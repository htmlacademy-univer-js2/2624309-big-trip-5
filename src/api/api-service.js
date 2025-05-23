const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';
const AUTHORIZATION = `Basic ${Math.random().toString(36).substring(2, 15)}`;

export default class ApiService {
  constructor() {
    this._authorization = AUTHORIZATION;
  }

  async _load({url, method = 'GET', body = null, headers = new Headers()}) {
    headers.append('Authorization', this._authorization);

    const response = await fetch(`${END_POINT}/${url}`, {method, body, headers});
    if (!response.ok) {
      throw new Error(`Ошибка загрузки данных: ${response.status}`);
    }
    return response.json();
  }

  getPoints() {
    return this._load({url: 'points'});
  }

  getDestinations() {
    return this._load({url: 'destinations'});
  }

  getOffers() {
    return this._load({url: 'offers'});
  }
}
