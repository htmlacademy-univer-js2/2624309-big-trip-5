import PointsModel from './model/model.js';
import TripPresenter from './presenter/trip-presenter.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';

const pointsModel = new PointsModel();
const filterModel = new FilterModel();

// Заполняем модель начальными моковыми данными
const initialDestinations = generateDestinations();
const initialOffers = generateOffers();
const initialPoints = generatePoints(initialDestinations);

pointsModel.setDestinations(initialDestinations);
pointsModel.setOffers(initialOffers);
pointsModel.setPoints(initialPoints);

const tripContainer = document.querySelector('.trip-events');
const filtersContainer = document.querySelector('.trip-controls__filters');

// Презентер маршрута
const tripPresenter = new TripPresenter(tripContainer, pointsModel, filterModel);
tripPresenter.init();

// Презентер фильтров
const filterPresenter = new FilterPresenter(
  filtersContainer,
  filterModel,
  pointsModel,
  () => {
    tripPresenter.clearPoints();
    tripPresenter.renderPoints();
  }
);
filterPresenter.init();
