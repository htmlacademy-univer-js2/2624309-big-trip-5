import AbstractView from '../framework/view/abstract-view.js';

export default class FiltersView extends AbstractView {
  #filtersAvailability;

  constructor(filtersAvailability) {
    super();
    this.#filtersAvailability = filtersAvailability;
  }

  get template() {
    return `
      <form class="trip-filters" action="#" method="get">
        <div class="trip-filters__filter">
          <input
            id="filter-everything"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="everything"
            checked
            ${this.#filtersAvailability.everything ? '' : 'disabled'}
          >
          <label class="trip-filters__filter-label" for="filter-everything">Everything</label>
        </div>

        <div class="trip-filters__filter">
          <input
            id="filter-future"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="future"
            ${this.#filtersAvailability.future ? '' : 'disabled'}
          >
          <label class="trip-filters__filter-label" for="filter-future">Future</label>
        </div>

        <div class="trip-filters__filter">
          <input
            id="filter-present"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="present"
            ${this.#filtersAvailability.present ? '' : 'disabled'}
          >
          <label class="trip-filters__filter-label" for="filter-present">Present</label>
        </div>

        <div class="trip-filters__filter">
          <input
            id="filter-past"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="past"
            ${this.#filtersAvailability.past ? '' : 'disabled'}
          >
          <label class="trip-filters__filter-label" for="filter-past">Past</label>
        </div>

        <button class="visually-hidden" type="submit">Accept filter</button>
      </form>
    `;
  }

  render(container) {
    container.insertAdjacentHTML('beforeend', this.template);
  }
}
