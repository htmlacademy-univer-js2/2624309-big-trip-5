import AbstractView from '../framework/view/abstract-view.js';

const sortTypes = [
  { type: 'day', label: 'Day' },
  { type: 'time', label: 'Time' },
  { type: 'price', label: 'Price' },
];

export default class SortView extends AbstractView {
  #currentSortType = 'day';
  #handleSortChange;

  constructor(currentSortType, handleSortChange) {
    super();
    this.#currentSortType = currentSortType;
    this.#handleSortChange = handleSortChange;
    this.element.addEventListener('click', this.#onSortTypeChange.bind(this));
  }

  get template() {
    return `
      <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
        ${sortTypes.map(({type, label}) => `
          <div class="trip-sort__item trip-sort__item--${type}">
            <input
              id="sort-${type}"
              class="trip-sort__input visually-hidden"
              type="radio"
              name="trip-sort"
              value="${type}"
              data-sort-type="${type}"
              ${this.#currentSortType === type ? 'checked' : ''}
            >
            <label class="trip-sort__btn" for="sort-${type}">${label}</label>
          </div>
        `).join('')}
      </form>
    `;
  }

  #onSortTypeChange(evt) {
    const sortType = evt.target.dataset.sortType;
    if (!sortType || sortType === this.#currentSortType) {
      return;
    }
    this.#handleSortChange(sortType);
  }
}
