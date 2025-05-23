import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import EditPointView from '../view/form-edit-view.js';
import Model from '../model/model.js';
import PointPresenter from './point-presenter.js';
import { SortType } from '../const.js';

const sortFunctions = {
  [SortType.DAY]: (points) => points.slice().sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom)),
  [SortType.PRICE]: (points) => points.slice().sort((a, b) => b.basePrice - a.basePrice),
  [SortType.TIME]: (points) => points.slice().sort((a, b) => {
    const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
    const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
    return durationB - durationA;
  }),
};

export default class TripPresenter {
  constructor() {
    this.model = new Model();

    this.listContainer = null;
    this.pointPresenters = new Map();

    this.sortComponent = null;
  }

  init() {
    this.renderFilters();
    this.renderSort();
    this.renderList();
    this.renderPoints();
  }

  renderFilters() {
    const filtersView = new FiltersView();
    document.querySelector('.trip-controls__filters').appendChild(filtersView.element);
  }

  renderSort() {
    this.sortComponent = new SortView();
    document.querySelector('.trip-events').appendChild(this.sortComponent.element);
    this.sortComponent.setSortTypeChangeHandler(this.handleSortTypeChange.bind(this));
  }

  renderList() {
    const container = document.querySelector('.trip-events');
    const listElement = document.createElement('ul');
    listElement.classList.add('trip-events__list');
    container.appendChild(listElement);
    this.listContainer = listElement;
  }

  clearPoints() {
    this.pointPresenters.forEach((presenter) => presenter.destroy());
    this.pointPresenters.clear();
    this.listContainer.innerHTML = '';
  }

  renderPoints() {
    this.clearPoints();

    let points = this.model.getPoints();
    const sortType = this.model.getSort() || SortType.DAY;

    if (!sortFunctions[sortType]) {
      points = this.model.getPoints(); // fallback без сортировки
    } else {
      points = sortFunctions[sortType](points);
    }

    points.forEach((point) => {
      const pointPresenter = new PointPresenter(this.listContainer, this.handleDataChange.bind(this), this.handleViewChange.bind(this));
      pointPresenter.init(point, this.model.getDestinations(), this.model.getOffers());
      this.pointPresenters.set(point.id, pointPresenter);
    });
  }

  handleSortTypeChange(sortType) {
    if (sortType === this.model.getSort()) {
      return; // сортировка не изменилась
    }

    this.model.setSort(sortType);
    this.renderPoints();
  }

  handleDataChange(updatedPoint) {
    this.model.updatePoint(updatedPoint);
    this.renderPoints();
  }

  handleViewChange() {
    this.pointPresenters.forEach((presenter) => presenter.resetView());
  }
}
