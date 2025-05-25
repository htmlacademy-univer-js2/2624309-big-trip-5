import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import Model from '../model/model.js';
import PointPresenter from './PointPresenter.js';
import { SortType, FilterType } from '../const.js';
import { render, RenderPosition, remove } from './render.js';

export default class TripPresenter {
  constructor(container) {
    this.container = container;
    this.model = new Model();
    this.pointPresenters = new Map();

    this.currentSortType = SortType.DAY;
    this.currentFilter = FilterType.EVERYTHING;

    this.filtersComponent = null;
    this.sortComponent = null;
    this.listContainer = null;
  }

  init() {
    this._renderFilters();
    this._renderSort();
    this._renderList();
    this._renderPoints();
  }

  // --- FILTERS ---
  _getFilteredPoints() {
    const all = this.model.getPoints();
    const now = Date.now();

    switch (this.currentFilter) {
      case FilterType.FUTURE:
        return all.filter((p) => new Date(p.dateFrom) > now);
      case FilterType.PAST:
        return all.filter((p) => new Date(p.dateTo) < now);
      // case FilterType.PRESENT: …
      default:
        return all;
    }
  }

  _renderFilters() {
    const old = this.filtersComponent;
    const points = this.model.getPoints();
    const availability = {
      everything: points.length > 0,
      future:     points.some((p) => new Date(p.dateFrom) > Date.now()),
      present:    points.some((p) => new Date(p.dateFrom) <= Date.now() && Date.now() <= new Date(p.dateTo)),
      past:       points.some((p) => new Date(p.dateTo) < Date.now()),
    };

    this.filtersComponent = new FiltersView(availability, this.currentFilter);
    this.filtersComponent.setFilterChangeHandler((filterType) => {
      this.currentFilter = filterType;
      this.currentSortType = SortType.DAY; // сброс сортировки
      this._clearPoints();
      this._renderSort();
      this._renderPoints();
    });

    if (old) {
      remove(old);
    }
    render(this.filtersComponent, this.container.querySelector('.trip-controls__filters'), RenderPosition.BEFOREEND);
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
        return points.slice().sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
      case SortType.TIME:
        return points.slice().sort((a, b) => {
          const da = new Date(a.dateTo) - new Date(a.dateFrom);
          const db = new Date(b.dateTo) - new Date(b.dateFrom);
          return db - da;
        });
      case SortType.PRICE:
        return points.slice().sort((a, b) => b.basePrice - a.basePrice);
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
    const points = this._getSortedPoints(filtered);
    const dests = this.model.getDestinations();
    const offers = this.model.getOffers();

    // пусто?
    if (points.length === 0) {
      const message = {
        [FilterType.EVERYTHING]: 'Click New Event to create your first point',
        [FilterType.FUTURE]:     'There are no future events now',
        [FilterType.PAST]:       'There are no past events now',
        [FilterType.PRESENT]:    'There are no present events now',
      }[this.currentFilter];

      const emptyEl = document.createElement('p');
      emptyEl.classList.add('trip-events__msg');
      emptyEl.textContent = message;
      this.listContainer.appendChild(emptyEl);
      return;
    }

    points.forEach((point) => {
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
    this.listContainer.innerHTML = '';
  }

  // --- CRUD Actions ---
  _handleUpdatePoint(updated) {
    this.model.updatePoint(updated);
    this._clearPoints();
    this._renderPoints();
  }

  _handleDeletePoint(deleted) {
    this.model.deletePoint(deleted.id);
    this._clearPoints();
    this._renderPoints();
  }

  _handleAddPoint(newPoint) {
    this.model.addPoint(newPoint);
    this._clearPoints();
    this._renderPoints();
  }
}
