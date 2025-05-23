import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointPresenter from './point-presenter.js';
import Model from '../model/model.js';
import { SortType, FilterType } from '../const.js';

export default class TripPresenter {
  constructor() {
    this.model = new Model();

    this.listContainer = null;
    this.pointPresenters = new Map();

    this.currentSortType = SortType.DAY;

    this.sortComponent = null;
  }

  init() {
    this.renderList();
    this.renderSort();
    this.renderPoints();
  }

  renderList() {
    const container = document.querySelector('.trip-events');
    const listElement = document.createElement('ul');
    listElement.classList.add('trip-events__list');
    container.appendChild(listElement);
    this.listContainer = listElement;
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
      return; // Не перерисовываем, если сортировка не изменилась
    }
    this.currentSortType = sortType;
    this.clearPoints();
    this.renderPoints();
  }

  getSortedPoints() {
    const points = this.model.getPoints().slice(); // копируем массив
    switch(this.currentSortType) {
      case SortType.DAY:
        return points.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
      case SortType.TIME:
        return points.sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durationB - durationA; // от большего к меньшему
        });
      case SortType.PRICE:
        return points.sort((a, b) => b.basePrice - a.basePrice); // от большего к меньшему
      default:
        return points;
    }
  }

  renderPoints() {
    const points = this.getSortedPoints();
    points.forEach(point => {
      const presenter = new PointPresenter(point, this.listContainer);
      presenter.init();
      this.pointPresenters.set(point.id, presenter);
    });
  }

  clearPoints() {
    this.pointPresenters.forEach(presenter => presenter.destroy());
    this.pointPresenters.clear();
  }
}