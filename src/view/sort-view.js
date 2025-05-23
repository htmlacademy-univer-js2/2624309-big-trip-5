export default class SortView {
    get template() {
      return `
        <div class="trip-sort">
          <div class="trip-sort__item">
            <input id="sort-day" type="radio" name="trip-sort" checked>
            <label for="sort-day">Day</label>
          </div>
          <div class="trip-sort__item">
            <input id="sort-price" type="radio" name="trip-sort">
            <label for="sort-price">Price</label>
          </div>
        </div>
      `;
    }
  
    render(container) {
      container.insertAdjacentHTML('beforeend', this.getTemplate());
    }
  }
  