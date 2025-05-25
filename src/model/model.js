
export default class Model {
  constructor() {
    this.destinations = generateDestinations();
    this.offers = generateOffers();
    this.points = generatePoints(this.destinations);
  }

  // --- Destinations ---
  getDestinations() {
    return this.destinations;
  }

  setDestinations(destinations) {
    this.destinations = Array.isArray(destinations) ? destinations.slice() : [];
  }

  // --- Offers ---
  getOffers() {
    return this.offers;
  }

  setOffers(offers) {
    this.offers = Array.isArray(offers) ? offers.slice() : [];
  }

  // --- Points (CRUD) ---
  getPoints() {
    return this.points;
  }

  setPoints(points) {
    this.points = Array.isArray(points) ? points.slice() : [];
  }

  updatePoint(updatedPoint) {
    const index = this.points.findIndex((p) => p.id === updatedPoint.id);
    if (index === -1) {
      throw new Error('Cannot update non-existing point');
    }
    this.points = [
      ...this.points.slice(0, index),
      updatedPoint,
      ...this.points.slice(index + 1),
    ];
  }

  addPoint(newPoint) {
    this.points = [newPoint, ...this.points];
  }

  deletePoint(pointId) {
    this.points = this.points.filter((p) => p.id !== pointId);
  }
}
