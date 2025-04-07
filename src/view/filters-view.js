export default class FiltersView {
  getTemplate() {
    return `
      <form class="trip-filters">
        <div class="trip-filters__filter">
          <input id="filter-everything" type="radio" name="trip-filter" checked>
          <label for="filter-everything">Everything</label>
        </div>
        <div class="trip-filters__filter">
          <input id="filter-future" type="radio" name="trip-filter">
          <label for="filter-future">Future</label>
        </div>
        <div class="trip-filters__filter">
          <input id="filter-present" type="radio" name="trip-filter">
          <label for="filter-present">Present</label>
        </div>
        <div class="trip-filters__filter">
          <input id="filter-past" type="radio" name="trip-filter">
          <label for="filter-past">Past</label>
        </div>
      </form>
    `;
  }

  render(container) {
    container.insertAdjacentHTML('beforeend', this.getTemplate());
  }
}