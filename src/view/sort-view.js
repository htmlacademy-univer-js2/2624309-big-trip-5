import AbstractView from '../framework/view/abstract-view.js';

const createSortTemplate = () => `
  <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
    <div class="trip-sort__item trip-sort__item--day" data-sort-type="day">
      <input id="sort-day" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-day" checked>
      <label class="trip-sort__btn" for="sort-day">Day</label>
    </div>

    <div class="trip-sort__item trip-sort__item--price" data-sort-type="price">
      <input id="sort-price" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-price">
      <label class="trip-sort__btn" for="sort-price">Price</label>
    </div>

    <div class="trip-sort__item trip-sort__item--time" data-sort-type="time">
      <input id="sort-time" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-time">
      <label class="trip-sort__btn" for="sort-time">Time</label>
    </div>
  </form>
`;

export default class SortView extends AbstractView {
  get template() {
    return createSortTemplate();
  }

  setSortTypeChangeHandler(callback) {
    this.element.addEventListener('click', (evt) => {
      const sortType = evt.target.closest('.trip-sort__item')?.dataset.sortType;
      if (!sortType) {
        return;
      }
      callback(sortType);
    });
  }
}
