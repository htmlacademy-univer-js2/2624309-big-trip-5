import FiltersView from '../view/filters-view.js';
import { RenderPosition, render, remove } from '../presenter/render.js';

export default class FilterPresenter {
  #container = null;
  #filterModel = null;
  #pointsModel = null;
  #filtersComponent = null;
  #onFilterChange = null;

  constructor(container, filterModel, pointsModel, onFilterChange) {
    this.#container = container;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
    this.#onFilterChange = onFilterChange;
  }

  init() {
    const prev = this.#filtersComponent;
    const points = this.#pointsModel.getPoints();
    const filtersAvailability = {
      everything: true,
      future: points.some((p) => new Date(p.dateFrom) > new Date()),
      past:    points.some((p) => new Date(p.dateTo) < new Date()),
      // … аналогично для present
    };

    this.#filtersComponent = new FiltersView(filtersAvailability, this.#filterModel.getFilter());
    this.#filtersComponent.setFilterChangeHandler((filterType) => {
      this.#filterModel.setFilter(filterType);
      this.#onFilterChange();
    });

    if (prev) {
      remove(prev);
    }
    render(this.#filtersComponent, this.#container, RenderPosition.BEFOREEND);
  }
}
