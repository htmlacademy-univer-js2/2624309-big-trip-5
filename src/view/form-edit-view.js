export default class FormEditView {
  constructor() {
    this.element = null;
  }

  getTemplate() {
    return `
      <form class="event event--edit">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/taxi.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                <!-- Типы событий будут здесь -->
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              Taxi
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="Amsterdam" list="destination-list-1">
            <datalist id="destination-list-1">
              <!-- Список городов будет здесь -->
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="18/03/19 12:25">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="18/03/19 13:35">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="160">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <!-- Детали формы будут здесь -->
        </section>
      </form>
    `;
  }

  render(container) {
    container.insertAdjacentHTML('afterbegin', this.getTemplate());
    this.element = container.querySelector('.event.event--edit');
  }

  blockForm(isBlocked) {
    if (!this.element) {
      return;
    }
    const elements = this.element.querySelectorAll('input, button, select, textarea');
    elements.forEach((el) => {
      el.disabled = isBlocked;
    });
  }

  setSaving(isSaving) {
    if (!this.element) {
      return;
    }
    const saveButton = this.element.querySelector('.event__save-btn');
    if (saveButton) {
      saveButton.textContent = isSaving ? 'Saving...' : 'Save';
    }
  }

  setDeleting(isDeleting) {
    if (!this.element) {
      return;
    }
    const deleteButton = this.element.querySelector('.event__reset-btn'); // исправлен селектор
    if (deleteButton) {
      deleteButton.textContent = isDeleting ? 'Deleting...' : 'Delete';
    }
  }

  shake() {
    if (!this.element) {
      return;
    }
    this.element.classList.add('shake');
    setTimeout(() => this.element.classList.remove('shake'), 600);
  }
}
