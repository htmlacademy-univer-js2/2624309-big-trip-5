export default class Point {
  constructor(id, type, destination, dateFrom, dateTo, basePrice, offers, isFavorite) {
    this.id = id;
    this.type = type;
    this.destination = destination;
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
    this.basePrice = basePrice;
    this.offers = offers;
    this.isFavorite = isFavorite;
  }
}
