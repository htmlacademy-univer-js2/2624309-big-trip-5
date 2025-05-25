import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import Model from '../model/model.js';
import PointPresenter from './point-presenter.js';
import { SortType, FilterType } from '../const.js';

export default class TripPresenter {
  constructor() {
    this.model = new Model();

    this.listContainer = null;
    this.pointPresenters = new Map();

    this.currentSortType = SortType.DAY;

    this.filtersComponent = null;
    this.sortComponent = null;
  }

  init() {
    this.renderList();
    this.renderFilters();
    this.renderSort();
    this.renderPoints();
  }

  renderFilters() {
    this.filtersComponent = new FiltersView();
    document.querySelector('.trip-controls__filters').appendChild(this.filtersComponent.element);
  }

  renderSort() {
    if (this.sortComponent) {
      this.sortComponent.element.remove();
      this.sortComponent.removeElement();
    }
    this.sortComponent = new SortView(this.currentSortType, this.handleSortChange.bind(this));
    document.querySelector('.trip-events').prepend(this.sortComponent.element);
  }

  handleSortChange(sortType) {
    if (this.currentSortType === sortType) {
      return;
    }
    this.currentSortType = sortType;
    this.clearPoints();
    this.renderPoints();
  }

  renderList() {
    const container = document.querySelector('.trip-events');
    const listElement = document.createElement('ul');
    listElement.classList.add('trip-events__list');
    container.appendChild(listElement);
    this.listContainer = listElement;
  }

  getSortedPoints() {
    const points = this.model.getPoints().slice();
    switch(this.currentSortType) {
      case SortType.DAY:
        return points.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
      case SortType.TIME:
        return points.sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durationB - durationA;
        });
      case SortType.PRICE:
        return points.sort((a, b) => b.basePrice - a.basePrice);
      default:
        return points;
    }
  }

  renderPoints() {
    const points = this.getSortedPoints();
    const destinations = this.model.getDestinations();
    const offers = this.model.getOffers();

    this.clearPoints();

    points.forEach(point => {
      const presenter = new PointPresenter(
        this.listContainer,
        this.handleDataChange.bind(this),
        this.resetAllForms.bind(this)
      );
      presenter.init(point, destinations, offers);
      this.pointPresenters.set(point.id, presenter);
    });
  }

  clearPoints() {
    this.pointPresenters.forEach(presenter => presenter.destroy());
    this.pointPresenters.clear();
    if(this.listContainer) {
      this.listContainer.innerHTML = '';
    }
  }

  handleDataChange(updatedPoint) {
    this.model.updatePoint(updatedPoint);
    this.renderPoints();
  }

  resetAllForms() {
    this.pointPresenters.forEach(presenter => presenter.resetView());
  }
}
