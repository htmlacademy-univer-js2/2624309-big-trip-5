import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import Model from '../model/model.js';
import PointPresenter from './point-presenter.js';

export default class TripPresenter {
  constructor() {
    this.model = new Model();
    this.listContainer = null;

    this.filtersComponent = null;
    this.sortComponent = null;

    this.pointPresenters = new Map(); // для хранения PointPresenter по id
  }

  init() {
    this.renderFilters();
    this.renderSort();
    this.renderList();
    this.renderPoints();
  }

  renderFilters() {
    this.filtersComponent = new FiltersView();
    document.querySelector('.trip-controls__filters').appendChild(this.filtersComponent.element);
  }

  renderSort() {
    this.sortComponent = new SortView();
    document.querySelector('.trip-events').appendChild(this.sortComponent.element);
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

    // Удаляем предыдущие презентеры и очищаем контейнер
    this.pointPresenters.forEach((presenter) => presenter.destroy());
    this.pointPresenters.clear();
    this.listContainer.innerHTML = '';

    points.forEach((point) => {
      const presenter = new PointPresenter(
        this.listContainer,
        this.handleDataChange.bind(this),
        this.resetAllForms.bind(this)
      );
      presenter.init(point, destinations, offers);
      this.pointPresenters.set(point.id, presenter);
    });
  }

  handleDataChange(updatedPoint) {
    // Обновляем модель — здесь можно добавить вызов API и обновление модели
    this.model.updatePoint(updatedPoint);
    this.renderPoints();
  }

  resetAllForms() {
    this.pointPresenters.forEach((presenter) => presenter.resetView());
  }
}
