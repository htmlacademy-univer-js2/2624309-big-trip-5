import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

export default class PointView extends AbstractView {
  #point;
  #destination;
  #offers;
  #handlers;

  constructor(point, destinations, offers, handlers = {}) {
    super();
    this.#point = point;
    this.#destination = destinations.find((d) => d.id === point.destination);
    this.#offers = offers[point.type]?.filter((o) => point.offers.includes(o.id));
    this.#handlers = handlers;

    // Навешиваем обработчик после создания элемента
    if (this.element) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#handlers.onExpandClick);
    }
  }

  setFavoriteClickHandler(callback) {
    this.element.querySelector('.event__favorite-btn').addEventListener('click', (evt) => {
      evt.preventDefault();
      callback();
    });
  }

  #formatDate(date) {
    return dayjs(date).format('HH:mm');
  }

  #getDuration(dateFrom, dateTo) {
    const diffMs = dayjs(dateTo).diff(dayjs(dateFrom));
    const dur = dayjs.duration(diffMs);

    const hours = dur.hours();
    const minutes = dur.minutes();

    return `${hours > 0 ? `${hours}H ` : ''}${minutes}M`;
  }

  get template() {
    const { type, dateFrom, dateTo, basePrice } = this.#point;

    return `
      <li class="trip-events__item">
        <div class="event">
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
          </div>
          <h3 class="event__title">${type} ${this.#destination?.name || ''}</h3>
          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="${dayjs(dateFrom).toISOString()}">${this.#formatDate(dateFrom)}</time>
              &mdash;
              <time class="event__end-time" datetime="${dayjs(dateTo).toISOString()}">${this.#formatDate(dateTo)}</time>
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
