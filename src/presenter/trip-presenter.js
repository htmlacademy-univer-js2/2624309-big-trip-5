import FiltersView from '../view/filters-view.js'; 
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import EditPointView from '../view/form-edit-view.js';
import Model from '../model/model.js';

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
      future: points.some(point => new Date(point.dateFrom).getTime() > now),
      present: points.some(point => {
        const from = new Date(point.dateFrom).getTime();
        const to = new Date(point.dateTo).getTime();
        return from <= now && now <= to;
      }),
      past: points.some(point => new Date(point.dateTo).getTime() < now),
    };
  }

  renderFilters() {
    const filtersView = new FiltersView();
    document.querySelector('.trip-controls__filters').appendChild(filtersView.element);
  }

  renderSort() {
    const sortView = new SortView();
    document.querySelector('.trip-events').appendChild(sortView.element);
  }

  renderList() {
    const container = document.querySelector('.trip-events');
    const listElement = document.createElement('ul');
    listElement.classList.add('trip-events__list');
    container.appendChild(listElement);
    this.listContainer = listElement;
  }

  renderPoints() {
    // Получаем точки, применяем фильтр и сортировку
    let points = this.model.getPoints();

    points = filter[this.model.getFilter()](points);
    points = this.model.getSort() === SortType.DAY ? sort[SortType.DAY](points) : sort[this.model.getSort()](points);

    if (points.length === 0) {
      this.renderEmptyMessage(this.model.getFilter());
      return;
    }

    this.clearEmptyMessage();

    points.forEach((point) => {
      const pointView = new PointView(point, destinations, offers);
      const editPointView = new EditPointView(point, destinations, offers);

      this.listContainer.appendChild(pointView.element);

      this.components.push({ pointView, editPointView });

      pointView.expandButton.addEventListener('click', () => {
        this.replacePointToForm(pointView, editPointView);
      });

      editPointView.formElement.addEventListener('submit', (evt) => {
        evt.preventDefault();
        this.replaceFormToPoint(pointView, editPointView);
      });

      editPointView.collapseButton.addEventListener('click', () => {
        this.replaceFormToPoint(pointView, editPointView);
      });
    });

    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        this.components.forEach(({ pointView, editPointView }) => {
          if (this.listContainer.contains(editPointView.element)) {
            this.replaceFormToPoint(pointView, editPointView);
          }
        });
      }
    });
  }

  replacePointToForm(pointView, editPointView) {
    this.listContainer.replaceChild(editPointView.element, pointView.element);
  }

  replaceFormToPoint(pointView, editPointView) {
    this.listContainer.replaceChild(pointView.element, editPointView.element);
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
      type: 'flight', // Предустановленный тип
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
    this.blockForm(true);             // Заблокировать форму (отключить кнопки, инпуты)
    this.currentEditForm.setSaving(true);  // Показать "Saving..." на кнопке

    if (formData.isNew) {
      // Создать новую точку на сервере
      await this.apiService.createPoint(formData);
    } else {
      // Обновить существующую точку
      await this.apiService.updatePoint(formData.id, formData);
    }

    // Обновить данные в модели после успешного запроса
    const points = await this.apiService.getPoints();
    this.model.setPoints(points);

    this.clearPoints();  // Очистить список точек на UI
    this.renderPoints(); // Перерисовать точки с актуальными данными

    this.closeEditForm(); // Закрыть форму и разблокировать кнопку "New Event"

  } catch (error) {
    this.shakeForm();    // Эффект "покачивания" при ошибке
    console.error('Ошибка при сохранении точки маршрута:', error);
  } finally {
    this.blockForm(false);           // Разблокировать форму
    this.currentEditForm.setSaving(false); // Восстановить текст кнопки
  }
}

handleFormCancel() {
  // Просто закрываем форму и разблокируем кнопку
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

async handleFormSave(formData) {
  // После успешного API-запроса
const points = await this.apiService.getPoints();
this.model.setPoints(points);

// Перерисовываем фильтры и сортировку (чтобы кнопки и их состояния были актуальны)
this.renderFilters();
this.renderSort();

// Перерисовываем список точек
this.clearPoints();
this.renderPoints();

  try {
    this.currentEditForm.blockForm(true);
    this.currentEditForm.setSaving(true);

    if (formData.isNew) {
      await this.apiService.createPoint(formData);
    } else {
      await this.apiService.updatePoint(formData.id, formData);
    }

    // Обновление данных, рендер...

    this.closeEditForm();
  } catch (error) {
    this.shakeForm();
  } finally {
    this.currentEditForm.blockForm(false);
    this.currentEditForm.setSaving(false);
  }
}

async handleFormDelete(pointId) {
  // После успешного API-запроса
const points = await this.apiService.getPoints();
this.model.setPoints(points);

// Перерисовываем фильтры и сортировку (чтобы кнопки и их состояния были актуальны)
this.renderFilters();
this.renderSort();

// Перерисовываем список точек
this.clearPoints();
this.renderPoints();

  try {
    this.currentEditForm.blockForm(true);
    this.currentEditForm.setDeleting(true);

    await this.apiService.deletePoint(pointId);

    // Обновление данных, рендер...

    this.closeEditForm();
  } catch (error) {
    this.shakeForm();
  } finally {
    this.currentEditForm.blockForm(false);
    this.currentEditForm.setDeleting(false);
  }
}

  shakeForm() {
  if (this.currentEditForm) {
    this.currentEditForm.shake();
  }
}

handleFavoriteToggle(point) {
  const updatedPoint = {...point, isFavorite: !point.isFavorite};
  this.apiService.updatePoint(updatedPoint.id, updatedPoint)
    .then(() => this.apiService.getPoints())
    .then((points) => {
      this.model.setPoints(points);
      this.clearPoints();
      this.renderPoints();
    })
    .catch(() => {
      // Здесь можно показать shake эффект для ошибки
    });
}

}
