import AbstractView from '../framework/view/abstract-view.js';

export default class PointView extends AbstractView {
  #point;
  #destination;
  #offers;
  #handlers;

  setFavoriteClickHandler(callback) {
    this.element.querySelector('.event__favorite-btn').addEventListener('click', (evt) => {
      evt.preventDefault();
      callback();
    });
  }

  constructor(point, destinations, offers, handlers = {}) {
    super();
    this.#point = point;
    this.#destination = destinations.find((d) => d.id === point.destination);
    this.#offers = offers[point.type]?.filter((o) => point.offers.includes(o.id));
    this.#handlers = handlers;

    // Навешиваем обработчик на кнопку, когда элемент создан
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#handlers.onExpandClick);
  }

  #formatDate(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  #getDuration(dateFrom, dateTo) {
    const diff = dateTo - dateFrom;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      return `${minutes}M`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}H ${remainingMinutes}M`;
  }

  get template() {
    const {type, dateFrom, dateTo, basePrice} = this.#point;

    return `
      <li class="trip-events__item">
        <div class="event">
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
          </div>
          <h3 class="event__title">${type} ${this.#destination?.name || ''}</h3>
          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time">${this.#formatDate(dateFrom)}</time>
              &mdash;
              <time class="event__end-time">${this.#formatDate(dateTo)}</time>
            </p>
            <p class="event__duration">${this.#getDuration(dateFrom, dateTo)}</p>
          </div>
          <p class="event__price">
            &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
          </p>
          ${this.#offers?.length ? `
            <h4 class="visually-hidden">Offers:</h4>
            <ul class="event__selected-offers">
              ${this.#offers.map((offer) => `
                <li class="event__offer">
                  <span class="event__offer-title">${offer.title}</span>
                  &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
                </li>
              `).join('')}
            </ul>
          ` : ''}
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </div>
      </li>
    `;
  }
}
