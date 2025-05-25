import {generateDestinations, generateOffers, generatePoints} from '../mock/mock.js';

export default class Model {
  constructor() {
    this.destinations = generateDestinations();
    this.offers = generateOffers();
    this.points = generatePoints(this.destinations);
  }

  getDestinations() {
    return this.destinations;
  }

  getOffers() {
    return this.offers;
  }

  getPoints() {
    return this.points;
  }
}
