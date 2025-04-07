import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import Model from '../model/model.js';

export default class TripPresenter {
  constructor() {
    this.model = new Model();
    this.listContainer = null;
  }

  init() {
    this.renderFilters();
    this.renderSort();
    this.renderList();
    this.renderPoints();
  }

  renderFilters() {
    new FiltersView().render(document.querySelector('.trip-controls__filters'));
  }

  renderSort() {
    new SortView().render(document.querySelector('.trip-events'));
  }

  renderList() {
    const container = document.querySelector('.trip-events');
    const listElement = document.createElement('ul');
    listElement.classList.add('trip-events__list');
    container.appendChild(listElement);
    this.listContainer = listElement;
  }

  renderPoints() {
    const points = this.model.getPoints();
    const destinations = this.model.getDestinations();
    const offers = this.model.getOffers();

    points.forEach((point) => {
      new PointView(point, destinations, offers).render(this.listContainer);
    });
  }
}