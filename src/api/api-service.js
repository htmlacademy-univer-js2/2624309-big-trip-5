const Method = {
  GET:    'GET',
  PUT:    'PUT',
  POST:   'POST',
  DELETE: 'DELETE',
};

export default class ApiService {
  #endPoint = 'https://21.objects.pages.academy/big-trip';
  #authorization = `Basic ${Math.random().toString(36).substring(2)}`;

  async #load({url, method = Method.GET, body = null, headers = new Headers()}) {
    headers.append('Authorization', this.#authorization);
    const response = await fetch(`${this.#endPoint}/${url}`, {method, body, headers});
    if (!response.ok) {
      throw new Error(`Ошибка ${method} ${url}: ${response.status}`);
    }
    return response.json();
  }

  // Получение всех точек маршрута
  async getPoints() {
    const points = await this.#load({url: 'points'});
    return points.map(ApiService.adaptPointToClient);
  }

  // Обновление точки маршрута
  async updatePoint(point) {
    const adapted = ApiService.adaptPointToServer(point);
    const updated = await this.#load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(adapted),
      headers: new Headers({'Content-Type': 'application/json'}),
    });
    return ApiService.adaptPointToClient(updated);
  }

  // Создание новой точки маршрута
  async addPoint(point) {
    const adapted = ApiService.adaptPointToServer(point);
    const created = await this.#load({
      url: 'points',
      method: Method.POST,
      body: JSON.stringify(adapted),
      headers: new Headers({'Content-Type': 'application/json'}),
    });
    return ApiService.adaptPointToClient(created);
  }

  // Удаление точки маршрута
  async deletePoint(pointId) {
    await this.#load({
      url: `points/${pointId}`,
      method: Method.DELETE,
    });
  }

  // Получение пунктов назначения
  getDestinations() {
    return this.#load({url: 'destinations'});
  }

  // Получение офферов
  getOffers() {
    return this.#load({url: 'offers'});
  }

  // Адаптер данных сервера → клиент
  static adaptPointToClient(point) {
    return {
      id: point.id,
      type: point.type,
      basePrice: point.base_price,
      dateFrom: new Date(point.date_from),
      dateTo:   new Date(point.date_to),
      destination: point.destination,
      offers: point.offers,
      isFavorite: point.is_favorite,
    };
  }

  // Адаптер данных клиента → сервер
  static adaptPointToServer(point) {
    return {
      'id': point.id,
      'type': point.type,
      'base_price': point.basePrice,
      'date_from': point.dateFrom.toISOString(),
      'date_to':   point.dateTo.toISOString(),
      'destination': point.destination,
      'offers': point.offers,
      'is_favorite': point.isFavorite,
    };
  }
}
