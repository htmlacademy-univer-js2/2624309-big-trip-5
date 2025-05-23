import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import EditPointView from '../view/form-edit-view.js';
import Model from '../model/model.js';

export default class TripPresenter {
  constructor() {
    this.model = new Model();
    this.listContainer = null;
    this.components = [];
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
    const sortView = new SortView();
    document.querySelector('.trip-events').appendChild(sortView.element);
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
      const pointView = new PointView(point, destinations, offers);
      const editPointView = new EditPointView(point, destinations, offers);

      this.listContainer.appendChild(pointView.element);

      this.components.push({ pointView, editPointView });

      pointView.expandButton.addEventListener('click', () => {
        this.replacePointToForm(pointView, editPointView);
      });

      editPointView.formElement.addEventListener('submit', (evt) => {
        evt.preventDefault();
        this.replaceFormToPoint(pointView, editPointView);
      });

      editPointView.collapseButton.addEventListener('click', () => {
        this.replaceFormToPoint(pointView, editPointView);
      });
    });

    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        this.components.forEach(({ pointView, editPointView }) => {
          if (this.listContainer.contains(editPointView.element)) {
            this.replaceFormToPoint(pointView, editPointView);
          }
        });
      }
    });
  }

  replacePointToForm(pointView, editPointView) {
    this.listContainer.replaceChild(editPointView.element, pointView.element);
  }

  replaceFormToPoint(pointView, editPointView) {
    this.listContainer.replaceChild(pointView.element, editPointView.element);
  }
  
}
