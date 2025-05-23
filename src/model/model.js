import {generateDestinations, generateOffers, generatePoints} from '../mock/mock.js';

export const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

export const SortType = {
  DAY: 'day',
  PRICE: 'price',
  TIME: 'time',
};

export default class Model {
  constructor() {
    this.destinations = generateDestinations();
    this.offers = generateOffers();
    this.points = generatePoints(this.destinations);

    this.currentFilter = FilterType.EVERYTHING;
    this.currentSort = SortType.DAY;
  }

  setDestinations(destinations) {
    this.destinations = destinations;
  }

  setOffers(offers) {
    this.offers = offers;
  }

  setPoints(points) {
    this.points = points;
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

  setFilter(filter) {
    this.currentFilter = filter;
  }

  getFilter() {
    return this.currentFilter;
  }

  setSort(sort) {
    this.currentSort = sort;
  }

  getSort() {
    return this.currentSort;
  }
}
