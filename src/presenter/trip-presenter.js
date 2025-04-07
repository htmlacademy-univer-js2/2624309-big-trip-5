import FiltersView from '../view/filters-view.js';
 import SortView from '../view/sort-view.js';
 import FormEditView from '../view/form-edit-view.js';
 import PointView from '../view/point-view.js';
 
 export default class TripPresenter {
   constructor(container) {
     this.container = container;
   }
 
   init() {
     new FiltersView().render(document.querySelector('.trip-controls__filters'));
     new SortView().render(document.querySelector('.trip-events'));
     new FormEditView().render(document.querySelector('.trip-events'));
     for (let i = 0; i < 3; i++) {
       new PointView().render(document.querySelector('.trip-events'));
     }
   }
 }
 