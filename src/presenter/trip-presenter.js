import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import Model from '../model/model.js';
import PointPresenter from './PointPresenter.js';
import ApiService from '../api/api-service.js';
import { SortType, FilterType } from '../const.js';
import { render, RenderPosition, remove } from './render.js';

export default class TripPresenter {
  constructor(container) {
    this.container       = container;
    this.model           = new Model();
    this.apiService      = new ApiService();
    this.pointPresenters = new Map();

    this.currentSortType = SortType.DAY;
    this.currentFilter   = FilterType.EVERYTHING;

    this.filtersComponent = null;
    this.sortComponent    = null;
    this.listContainer    = null;
    this.loadingComponent = null;
  }

  async init() {
    // 1) Показываем Loading...
    this._renderLoading();

    // 2) Загружаем точки, дестинации и оффера
    try {
      const [points, destinations, offers] = await Promise.all([
        this.apiService.getPoints(),
        this.apiService.getDestinations(),
        this.apiService.getOffers(),
      ]);

      // 3) Записываем данные в модель
      this.model.setPoints(points);
      this.model.setDestinations(destinations);
      this.model.setOffers(offers);

      // 4) Убираем Loading и рендерим всё
      this._removeLoading();
      this._renderFilters();
      this._renderSort();
      this._renderList();
      this._renderPoints();
    }
    catch (err) {
      console.error('Ошибка загрузки данных:', err);
      this._removeLoading();
      this._renderError();  // показываем «Failed to load…»
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

  // --- FILTERS ---

  _getFilteredPoints() {
    const all = this.model.getPoints();
    const now = Date.now();

    switch (this.currentFilter) {
      case FilterType.FUTURE:
        return all.filter(p => new Date(p.dateFrom) > now);
      case FilterType.PAST:
        return all.filter(p => new Date(p.dateTo) < now);
      case FilterType.PRESENT:
        return all.filter(p => {
          const from = new Date(p.dateFrom);
          const to   = new Date(p.dateTo);
          return from <= now && now <= to;
        });
      default:
        return all;
    }
  }

  _renderFilters() {
    const old = this.filtersComponent;
    const pts = this.model.getPoints();
    const availability = {
      everything: pts.length > 0,
      future:     pts.some(p => new Date(p.dateFrom) > Date.now()),
      present:    pts.some(p => {
        const now = Date.now();
        return new Date(p.dateFrom) <= now && now <= new Date(p.dateTo);
      }),
      past:       pts.some(p => new Date(p.dateTo) < Date.now()),
    };

    this.filtersComponent = new FiltersView(availability, this.currentFilter);
    this.filtersComponent.setFilterChangeHandler(filterType => {
      this.currentFilter   = filterType;
      this.currentSortType = SortType.DAY; // сброс сортировки
      this._clearPoints();
      this._renderSort();
      this._renderPoints();
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

  // --- SORT ---

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

  // --- LIST & POINTS ---

  _renderList() {
    const list = document.createElement('ul');
    list.classList.add('trip-events__list');
    this.container.querySelector('.trip-events').appendChild(list);
    this.listContainer = list;
  }

  _renderPoints() {
    const filtered = this._getFilteredPoints();
    const pts      = this._getSortedPoints(filtered);
    const dests    = this.model.getDestinations();
    const offers   = this.model.getOffers();

    // если нет ни одной точки
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

    pts.forEach(point => {
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
    this.pointPresenters.forEach(p => p.destroy());
    this.pointPresenters.clear();
    this.listContainer.innerHTML = '';
  }

  // --- CRUD Actions ---

  async _handleUpdatePoint(updated) {
    try {
      const saved = await this.apiService.updatePoint(updated);
      this.model.updatePoint(saved);
      this._clearPoints();
      this._renderPoints();
    } catch (err) {
      // здесь можно вызвать shake-эффект через presenter
      console.error('Ошибка при обновлении точки:', err);
    }
  }

  async _handleDeletePoint(deleted) {
    this.model.deletePoint(deleted.id);
    this._clearPoints();
    this._renderPoints();
  }

  async _handleAddPoint(newPoint) {
    this.model.addPoint(newPoint);
    this._clearPoints();
    this._renderPoints();
  }
}