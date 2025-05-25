import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';

export default class EditPointView extends AbstractStatefulView {
  constructor(point, destinations, offers) {
    super();
    this._destinations = destinations;
    this._offers = offers;
    this._state = EditPointView.parsePointToState(point);

    this._restoreHandlers();
  }

  static parsePointToState(point) {
    return {
      ...point,
      // можно добавить временные поля, например, выбранные опции
      selectedOffers: point.offers.slice(),
    };
  }

  get template() {
    const {type, basePrice, dateFrom, dateTo, destination, selectedOffers} = this._state;
    const destinationData = this._destinations.find((d) => d.id === destination) || {};
    const offersByType = this._offers[type] || [];

    // Форматирование дат (можно улучшить)
    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth() + 1).toString().padStart(2,'0')}/${d.getFullYear().toString().slice(2)} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    };

    // Генерация списка типов
    const types = Object.keys(this._offers);
    const typesMarkup = types.map((offerType) => `
      <div class="event__type-item">
        <input id="event-type-${offerType}" class="event__type-input visually-hidden" type="radio" name="event-type" value="${offerType}" ${offerType === type ? 'checked' : ''}>
        <label class="event__type-label event__type-label--${offerType}" for="event-type-${offerType}">${offerType[0].toUpperCase() + offerType.slice(1)}</label>
      </div>`).join('');

    // Генерация списка пунктов назначения
    const destinationsMarkup = this._destinations.map((dest) => `<option value="${dest.name}"></option>`).join('');

    // Генерация списка офферов для выбранного типа
    const offersMarkup = offersByType.length > 0 ? `
      <section class="event__section  event__section--offers">
        <h3 class="event__section-title  event__section-title--offers">Offers</h3>
        <div class="event__available-offers">
          ${offersByType.map((offer) => {
    const isChecked = selectedOffers.includes(offer.id) ? 'checked' : '';
    return `
              <div class="event__offer-selector">
                <input class="event__offer-checkbox  visually-hidden" id="offer-${offer.id}" type="checkbox" name="event-offer" value="${offer.id}" ${isChecked}>
                <label class="event__offer-label" for="offer-${offer.id}">
                  <span class="event__offer-title">${offer.title}</span>
                  &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
                </label>
              </div>
            `;
  }).join('')}
        </div>
      </section>` : '';

    // Блок с описанием и фото пункта назначения
    const destinationDescription = destinationData.description ? `<p class="event__destination-description">${destinationData.description}</p>` : '';
    const photosMarkup = (destinationData.pictures || []).map((pic) => `<img class="event__photo" src="${pic.src}" alt="${pic.description}">`).join('');
    const photosSection = photosMarkup ? `
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${photosMarkup}
        </div>
      </div>` : '';

    return `
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">

          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${typesMarkup}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">${type}</label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationData.name || ''}" list="destination-list-1" autocomplete="off" required>
            <datalist id="destination-list-1">
              ${destinationsMarkup}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatDate(dateFrom)}" required>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatDate(dateTo)}" required>
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="number" min="0" name="event-price" value="${basePrice}" required>
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          ${offersMarkup}
          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            ${destinationDescription}
            ${photosSection}
          </section>
        </section>
      </form>
    `;
  }

  _restoreHandlers() {
    this.element.querySelector('.event__type-toggle').addEventListener('click', this._toggleTypeList.bind(this));

    this.element.querySelectorAll('.event__type-input').forEach((input) => {
      input.addEventListener('change', this._onTypeChange.bind(this));
    });

    this.element.querySelector('.event__input--destination').addEventListener('change', this._onDestinationChange.bind(this));

    this.element.querySelector('.event__save-btn').addEventListener('click', (evt) => {
      evt.preventDefault();
      this._callback.save(this._state);
    });

    this.element.querySelector('.event__reset-btn').addEventListener('click', (evt) => {
      evt.preventDefault();
      this._callback.delete(this._state.id);
    });

    this.element.querySelector('.event__rollup-btn').addEventListener('click', (evt) => {
      evt.preventDefault();
      this._callback.cancel();
    });
  }

  _toggleTypeList() {
    this.element.querySelector('.event__type-list').classList.toggle('hidden');
  }

  _onTypeChange(evt) {
    const newType = evt.target.value;
    this.updateElement({
      type: newType,
      selectedOffers: [],
    });
  }

  _onDestinationChange(evt) {
    const newDestinationName = evt.target.value;
    const newDestination = this._destinations.find((d) => d.name === newDestinationName);

    if (!newDestination) {
      // Можно сделать валидацию здесь или игнорировать неверные данные
      return;
    }

    this.updateElement({
      destination: newDestination.id,
    });
  }

  setSaveHandler(callback) {
    this._callback.save = callback;
  }

  setDeleteHandler(callback) {
    this._callback.delete = callback;
  }

  setCancelHandler(callback) {
    this._callback.cancel = callback;
  }
}
