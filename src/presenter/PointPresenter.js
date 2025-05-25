import PointView from '../view/point-view.js';
import EditPointView from '../view/form-edit-view.js';

export default class PointPresenter {
  #point = null;
  #destinations = null;
  #offers = null;

  #pointComponent = null;
  #editPointComponent = null;

  #handleDataChange = null;
  #handleModeChange = null;

  #container = null;

  #isEditMode = false;

  constructor(container, handleDataChange, handleModeChange) {
    this.#container = container;
    this.#handleDataChange = handleDataChange; // функция обновления данных в модели
    this.#handleModeChange = handleModeChange; // функция сброса всех открытых форм
  }

  init(point, destinations, offers) {
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;

    const prevPointComponent = this.#pointComponent;
    const prevEditPointComponent = this.#editPointComponent;

    this.#pointComponent = new PointView(this.#point, this.#destinations, this.#offers);
    this.#editPointComponent = new EditPointView(this.#point, this.#destinations, this.#offers);

    // Навешиваем обработчики
    this.#pointComponent.setExpandClickHandler(this.#handleExpandClick.bind(this));
    this.#pointComponent.setFavoriteClickHandler(this.#handleFavoriteClick.bind(this));

    this.#editPointComponent.setSaveHandler(this.#handleFormSave.bind(this));
    this.#editPointComponent.setCancelHandler(this.#handleFormCancel.bind(this));

    if (!prevPointComponent || !prevEditPointComponent) {
      this.#container.appendChild(this.#pointComponent.element);
      return;
    }

    if (this.#isEditMode) {
      this.#container.replaceChild(this.#editPointComponent.element, prevEditPointComponent.element);
    } else {
      this.#container.replaceChild(this.#pointComponent.element, prevPointComponent.element);
    }

    prevPointComponent.removeElement();
    prevEditPointComponent.removeElement();
  }

  #handleExpandClick() {
    this.#handleModeChange(); // сбросить все открытые формы
    this.#replacePointToForm();
  }

  #handleFavoriteClick() {
    const updatedPoint = { ...this.#point, isFavorite: !this.#point.isFavorite };
    this.#handleDataChange(updatedPoint);
  }

  #handleFormSave(updatedPoint) {
    this.#handleDataChange(updatedPoint);
    this.#replaceFormToPoint();
  }

  #handleFormCancel() {
    this.#replaceFormToPoint();
  }

  resetView() {
    if (this.#isEditMode) {
      this.#replaceFormToPoint();
    }
  }

  #replacePointToForm() {
    this.#container.replaceChild(this.#editPointComponent.element, this.#pointComponent.element);
    this.#isEditMode = true;
  }

  #replaceFormToPoint() {
    this.#container.replaceChild(this.#pointComponent.element, this.#editPointComponent.element);
    this.#isEditMode = false;
  }

  destroy() {
    this.#pointComponent.removeElement();
    this.#editPointComponent.removeElement();
  }
}
