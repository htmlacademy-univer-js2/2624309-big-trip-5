import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import EditPointView from '../view/form-edit-view.js';
import EmptyRouteView from '../view/empty-route-view.js'; // если используется
import Model from '../model/model.js';
import ApiService from '../api/api-service.js';
import { FilterType, SortType } from '../const.js';
import { filter, sort } from '../utils/filter-sort.js'; // импорт фильтров и сортировок

export default class TripPresenter {
  constructor() {
    this.model = new Model();
    this.apiService = new ApiService();

    this.filtersComponent = null;
    this.sortComponent = null;

    this.listContainer = null;
    this.components = [];

    this.newEventButton = document.querySelector('.trip-main__event-add-btn');
    this.currentEditForm = null;
  }

  async init() {
    this.renderLoading();

    this.newEventButton.addEventListener('click', this.handleNewEventClick.bind(this));

    try {
      const [points, destinations, offers] = await Promise.all([
        this.apiService.getPoints(),
        this.apiService.getDestinations(),
        this.apiService.getOffers(),
      ]);

      this.model.setPoints(points);
      this.model.setDestinations(destinations);
      this.model.setOffers(offers);

      this.clearLoading();
      this.renderFilters();
      this.renderSort();
      this.renderList();
      this.renderPoints();

    } catch (error) {
      this.clearLoading();
      this.renderError();
      // eslint-disable-next-line no-console
      console.error('Ошибка загрузки данных с сервера:', error);
    }
  }

  renderLoading() {
    const container = document.querySelector('.trip-events');
    container.textContent = 'Loading...';
  }

  clearLoading() {
    const container = document.querySelector('.trip-events');
    container.textContent = '';
  }

  renderError() {
    const container = document.querySelector('.trip-events');
    container.textContent = 'Failed to load latest route information';
  }

  getFiltersAvailability(points) {
    const now = Date.now();

    return {
      everything: points.length > 0,
      future: points.some((point) => new Date(point.dateFrom).getTime() > now),
      present: points.some((point) => {
        const from = new Date(point.dateFrom).getTime();
        const to = new Date(point.dateTo).getTime();
        return from <= now && now <= to;
      }),
      past: points.some((point) => new Date(point.dateTo).getTime() < now),
    };
  }

  renderFilters() {
    if (this.filtersComponent) {
      this.filtersComponent.removeElement();
    }
    const points = this.model.getPoints();
    const filtersAvailability = this.getFiltersAvailability(points);
    this.filtersComponent = new FiltersView(filtersAvailability);
    this.filtersComponent.setFilterChangeHandler(this.handleFilterChange.bind(this));
    document.querySelector('.trip-controls__filters').appendChild(this.filtersComponent.element);
  }

  renderSort() {
    if (this.sortComponent) {
      this.sortComponent.removeElement();
    }
    this.sortComponent = new SortView();
    this.sortComponent.setSortChangeHandler(this.handleSortChange.bind(this));
    document.querySelector('.trip-events').appendChild(this.sortComponent.element);
  }

  renderList() {
    const container = document.querySelector('.trip-events');
    const listElement = document.createElement('ul');
    listElement.classList.add('trip-events__list');
    container.appendChild(listElement);
    this.listContainer = listElement;
  }

  renderPoints() {
    let points = this.model.getPoints();
    const filterType = this.model.getFilter();
    const sortType = this.model.getSort();
    const destinations = this.model.getDestinations();
    const offers = this.model.getOffers();

    points = filter[filterType](points);
    points = sortType === SortType.DAY ? sort[SortType.DAY](points) : sort[sortType](points);

    if (points.length === 0) {
      this.renderEmptyMessage(filterType);
      return;
    }

    this.clearEmptyMessage();

    this.components = []; // очищаем компоненты перед рендером
    this.listContainer.innerHTML = ''; // очищаем список

    points.forEach((point) => {
      const pointView = new PointView(point, destinations, offers);
      const editPointView = new EditPointView(point, destinations, offers);

      this.listContainer.appendChild(pointView.element);

      this.components.push({ pointView, editPointView });

      pointView.setExpandClickHandler(() => {
        this.closeEditForms();
        this.replacePointToForm(pointView, editPointView);
      });

      editPointView.setSaveHandler(this.handleFormSave.bind(this));
      editPointView.setCancelHandler(this.handleFormCancel.bind(this));
      editPointView.setDeleteHandler(this.handleFormDelete.bind(this));

      editPointView.collapseButton.addEventListener('click', () => {
        this.replaceFormToPoint(pointView, editPointView);
      });
    });

    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        this.closeEditForms();
      }
    });
  }

  renderEmptyMessage(filterType) {
    if (!this.emptyRouteComponent) {
      this.emptyRouteComponent = new EmptyRouteView(filterType);
      this.listContainer.appendChild(this.emptyRouteComponent.element);
    }
  }

  clearEmptyMessage() {
    if (this.emptyRouteComponent) {
      this.emptyRouteComponent.removeElement();
      this.emptyRouteComponent = null;
    }
  }

  closeEditForms() {
    this.components.forEach(({ pointView, editPointView }) => {
      if (this.listContainer.contains(editPointView.element)) {
        this.replaceFormToPoint(pointView, editPointView);
      }
    });
    this.currentEditForm = null;
    this.newEventButton.disabled = false;
  }

  replacePointToForm(pointView, editPointView) {
    this.listContainer.replaceChild(editPointView.element, pointView.element);
    this.currentEditForm = editPointView;
    this.newEventButton.disabled = true;
  }

  replaceFormToPoint(pointView, editPointView) {
    this.listContainer.replaceChild(pointView.element, editPointView.element);
    this.currentEditForm = null;
    this.newEventButton.disabled = false;
  }

  handleNewEventClick() {
    if (this.currentEditForm) {
      this.currentEditForm.removeElement();
      this.currentEditForm = null;
    }

    this.model.setFilter(FilterType.EVERYTHING);
    this.model.setSort(SortType.DAY);

    this.clearPoints();
    this.renderFilters();
    this.renderSort();

    const emptyPoint = {
      type: 'flight',
      destination: null,
      dateFrom: new Date(),
      dateTo: new Date(),
      basePrice: 0,
      offers: [],
      isNew: true,
    };

    this.currentEditForm = new EditPointView(emptyPoint, this.model.getDestinations(), this.model.getOffers());
    this.listContainer.prepend(this.currentEditForm.element);
    this.newEventButton.disabled = true;

    this.currentEditForm.setSaveHandler(this.handleFormSave.bind(this));
    this.currentEditForm.setCancelHandler(this.handleFormCancel.bind(this));

    document.addEventListener('keydown', this.handleEscKeyDown.bind(this));
  }

  handleEscKeyDown(evt) {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.closeEditForm();
    }
  }

  async handleFormSave(formData) {
    try {
      this.blockForm(true);
      this.currentEditForm.setSaving(true);

      if (formData.isNew) {
        await this.apiService.createPoint(formData);
      } else {
        await this.apiService.updatePoint(formData.id, formData);
      }

      const points = await this.apiService.getPoints();
      this.model.setPoints(points);

      this.clearPoints();
      this.renderPoints();

      this.closeEditForm();
    } catch (error) {
      this.shakeForm();
      // eslint-disable-next-line no-console
      console.error('Ошибка при сохранении точки маршрута:', error);
    } finally {
      this.blockForm(false);
      this.currentEditForm.setSaving(false);
    }
  }

  async handleFormDelete(pointId) {
    try {
      this.blockForm(true);
      this.currentEditForm.setDeleting(true);

      await this.apiService.deletePoint(pointId);

      const points = await this.apiService.getPoints();
      this.model.setPoints(points);

      this.clearPoints();
      this.renderPoints();

      this.closeEditForm();
    } catch (error) {
      this.shakeForm();
      // eslint-disable-next-line no-console
      console.error('Ошибка при удалении точки маршрута:', error);
    } finally {
      this.blockForm(false);
      this.currentEditForm.setDeleting(false);
    }
  }

  blockForm(isBlocked) {
    if (this.currentEditForm) {
      this.currentEditForm.blockForm(isBlocked);
    }
  }

  shakeForm() {
    if (this.currentEditForm) {
      this.currentEditForm.shake();
    }
  }

  handleFormCancel() {
    this.closeEditForm();
  }

  closeEditForm() {
    if (this.currentEditForm) {
      this.currentEditForm.removeElement();
      this.currentEditForm = null;
    }
    this.newEventButton.disabled = false;
    document.removeEventListener('keydown', this.handleEscKeyDown.bind(this));
  }

  clearPoints() {
    if (this.listContainer) {
      this.listContainer.innerHTML = '';
    }
    this.components = [];
  }

  handleFilterChange(filterType) {
    this.model.setFilter(filterType);
    this.model.setSort(SortType.DAY); // Сброс сортировки при смене фильтра

    this.clearPoints();
    this.renderFilters();
    this.renderSort();
    this.renderPoints();
  }

  handleSortChange(sortType) {
    this.model.setSort(sortType);

    this.clearPoints();
    this.renderSort();
    this.renderPoints();
  }

  handleFavoriteToggle(point) {
    const updatedPoint = { ...point, isFavorite: !point.isFavorite };
    this.apiService.updatePoint(updatedPoint.id, updatedPoint)
      .then(() => this.apiService.getPoints())
      .then((points) => {
        this.model.setPoints(points);
        this.clearPoints();
        this.renderPoints();
      })
      .catch(() => {
        // Можно добавить shake эффект или уведомление об ошибке
      });
  }
}
