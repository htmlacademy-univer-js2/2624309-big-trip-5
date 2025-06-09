import { FilterType } from '../const.js';

export default class FilterModel {
  #currentFilter = FilterType.EVERYTHING;

  getFilter() {
    return this.#currentFilter;
  }

  setFilter(filterType) {
    this.#currentFilter = filterType;
  }
}
