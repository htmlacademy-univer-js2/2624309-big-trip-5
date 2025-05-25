import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import Model from '../model/model.js';
import PointPresenter from './PointPresenter.js';
import ApiService from '../api/api-service.js';
import { SortType, FilterType } from '../const.js';
import { render, RenderPosition, remove } from './render.js';
import dayjs from 'dayjs';

export default class TripPresenter {
  constructor(container) {
    this.container = container;
    this.apiService = new ApiService();
    this.model = new Model(this.apiService);
    this.pointPresenters = new Map();

    this.currentSortType = SortType.DAY;
    this.currentFilter = FilterType.EVERYTHING;

    this.filtersComponent = null;
    this.sortComponent = null;
    this.listContainer = null;
    this.loadingComponent = null;
  }

  async init() {
    this._renderLoading();

    try {
      await this.model.init(); // загружает точки, дестинации, офферы через API

      this._removeLoading();
      this._renderFilters();
      this._renderSort();
      this._renderList();
      this._renderPoints();
      this._updateRouteInfo(); // обновляем маршрут, даты и цену
    } catch (err) {
      this._removeLoading();
      this._renderError();
    }
  }

  // --- Loading / Error ---

  _renderLoading() {
    const container = this.container.querySelector('.trip-events');
    this.loadingComponent = document.createElement('p');
    this.loadingComponent.className = 'trip-events__msg';
    this.loadingComponent.textContent = 'Loading...';
    container.appendChild(this.loadingComponent);
  }

  _removeLoading() {
    if (this.loadingComponent) {
      this.loadingComponent.remove();
      this.loadingComponent = null;
    }
  }

  _renderError() {
    const container = this.container.querySelector('.trip-events');
    const errorEl = document.createElement('p');
    errorEl.className = 'trip-events__msg';
    errorEl.textContent = 'Failed to load latest route information';
    container.appendChild(errorEl);
  }

  // --- Filters ---

  _getFilteredPoints() {
    const all = this.model.getPoints();
    const now = Date.now();

    switch (this.currentFilter) {
      case FilterType.FUTURE:
        return all.filter((p) => new Date(p.dateFrom) > now);
      case FilterType.PAST:
        return all.filter((p) => new Date(p.dateTo) < now);
      case FilterType.PRESENT:
        return all.filter((p) => {
          const from = new Date(p.dateFrom);
          const to = new Date(p.dateTo);
          return from <= now && now <= to;
        });
      default:
        return all;
    }
  }

  _renderFilters() {
    const old = this.filtersComponent;
    const pts = this.model.getPoints();

    // Проверяем, для каких фильтров есть точки, чтобы блокировать недоступные
    const availability = {
      everything: pts.length > 0,
      future:     pts.some((p) => new Date(p.dateFrom) > Date.now()),
      present:    pts.some((p) => {
        const now = Date.now();
        return new Date(p.dateFrom) <= now && now <= new Date(p.dateTo);
      }),
      past:       pts.some((p) => new Date(p.dateTo) < Date.now()),
    };

    this.filtersComponent = new FiltersView(availability, this.currentFilter);
    this.filtersComponent.setFilterChangeHandler((filterType) => {
      this.currentFilter = filterType;
      this.currentSortType = SortType.DAY;
      this._clearPoints();
      this._renderSort();
      this._renderPoints();
      this._updateRouteInfo(); // обновляем маршрут при смене фильтра
    });

    if (old) {
      remove(old);
    }
    render(
      this.filtersComponent,
      this.container.querySelector('.trip-controls__filters'),
      RenderPosition.BEFOREEND
    );
  }

  // --- Sort ---

  _renderSort() {
    if (this.sortComponent) {
      remove(this.sortComponent);
    }
    this.sortComponent = new SortView(this.currentSortType, this._handleSortChange.bind(this));
    render(this.sortComponent, this.container, RenderPosition.AFTERBEGIN);
  }

  _handleSortChange(sortType) {
    if (this.currentSortType === sortType) {
      return;
    }
    this.currentSortType = sortType;
    this._clearPoints();
    this._renderPoints();
    this._updateRouteInfo(); // обновляем маршрут при смене сортировки
  }

  _getSortedPoints(points) {
    switch (this.currentSortType) {
      case SortType.DAY:
        return [...points].sort((a, b) =>
          new Date(a.dateFrom) - new Date(b.dateFrom)
        );
      case SortType.TIME:
        return [...points].sort((a, b) => {
          const da = new Date(a.dateTo) - new Date(a.dateFrom);
          const db = new Date(b.dateTo) - new Date(b.dateFrom);
          return db - da;
        });
      case SortType.PRICE:
        return [...points].sort((a, b) => b.basePrice - a.basePrice);
      default:
        return points;
    }
  }

  // --- List & Points ---

  _renderList() {
    const list = document.createElement('ul');
    list.classList.add('trip-events__list');
    this.container.querySelector('.trip-events').appendChild(list);
    this.listContainer = list;
  }

  _renderPoints() {
    const filtered = this._getFilteredPoints();
    const pts = this._getSortedPoints(filtered);
    const dests = this.model.getDestinations();
    const offers = this.model.getOffers();

    this._clearPoints();

    if (pts.length === 0) {
      const msg = {
        [FilterType.EVERYTHING]: 'Click New Event to create your first point',
        [FilterType.FUTURE]:     'There are no future events now',
        [FilterType.PAST]:       'There are no past events now',
        [FilterType.PRESENT]:    'There are no present events now',
      }[this.currentFilter];
      const emptyEl = document.createElement('p');
      emptyEl.className = 'trip-events__msg';
      emptyEl.textContent = msg;
      this.listContainer.appendChild(emptyEl);
      return;
    }

    pts.forEach((point) => {
      const presenter = new PointPresenter(
        this.listContainer,
        this._handleUpdatePoint.bind(this),
        this._handleDeletePoint.bind(this)
      );
      presenter.init(point, dests, offers);
      this.pointPresenters.set(point.id, presenter);
    });
  }

  _clearPoints() {
    this.pointPresenters.forEach((p) => p.destroy());
    this.pointPresenters.clear();
    if(this.listContainer) {
      this.listContainer.innerHTML = '';
    }
  }

  // --- Маршрут, даты и цена ---

  _updateRouteInfo() {
    const points = this.model.getPoints().slice().sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    if (points.length === 0) {
      this._clearRouteInfo();
      return;
    }

    const cities = points.map((p) => {
      const dest = this.model.getDestinations().find((d) => d.id === p.destination);
      return dest ? dest.name : '';
    });

    let routeStr = '';
    if (cities.length <= 3) {
      routeStr = cities.join(' — ');
    } else {
      routeStr = `${cities[0]} — ... — ${cities[cities.length - 1]}`;
    }

    const startDate = points[0].dateFrom;
    const endDate = points[points.length - 1].dateTo;

    const startDateStr = dayjs(startDate).format('MMM D');
    const endDateStr = dayjs(endDate).format('MMM D');

    let totalPrice = 0;
    points.forEach((p) => {
      totalPrice += p.basePrice;
      const offers = this.model.getOffers()[p.type] || [];
      p.offers.forEach((offerId) => {
        const offer = offers.find((o) => o.id === offerId);
        if (offer) {
          totalPrice += offer.price;
        }
      });
    });

    const routeElement = this.container.querySelector('.trip-info__main');
    const datesElement = this.container.querySelector('.trip-info__dates');
    const priceElement = this.container.querySelector('.trip-info__cost-value');

    if (routeElement) {
      routeElement.textContent = routeStr;
    }
    if (datesElement) {
      datesElement.textContent = `${startDateStr} — ${endDateStr}`;
    }
    if (priceElement) {
      priceElement.textContent = totalPrice;
    }
  }

  _clearRouteInfo() {
    const routeElement = this.container.querySelector('.trip-info__main');
    const datesElement = this.container.querySelector('.trip-info__dates');
    const priceElement = this.container.querySelector('.trip-info__cost-value');

    if (routeElement) {
      routeElement.textContent = '';
    }
    if (datesElement) {
      datesElement.textContent = '';
    }
    if (priceElement) {
      priceElement.textContent = '';
    }
  }

  // --- CRUD Actions ---

  async _handleUpdatePoint(updated) {
    try {
      const saved = await this.apiService.updatePoint(updated);
      this.model.updatePoint(saved);
      this._clearPoints();
      this._renderPoints();
      this._updateRouteInfo();
    } catch (err) {
      // можно добавить shake-эффект здесь
    }
  }

  async _handleDeletePoint(deleted) {
    try {
      await this.apiService.deletePoint(deleted.id);
      this.model.deletePoint(deleted.id);
      this._clearPoints();
      this._renderPoints();
      this._updateRouteInfo();
    } catch (err) {
      // можно добавить shake-эффект здесь
    }
  }

  async _handleAddPoint(newPoint) {
    try {
      const created = await this.apiService.addPoint(newPoint);
      this.model.addPoint(created);
      this._clearPoints();
      this._renderPoints();
      this._updateRouteInfo();
    } catch (err) {
      // можно добавить shake-эффект здесь
    }
  }
}
