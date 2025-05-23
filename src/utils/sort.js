import {SortType} from './model.js';

export const sort = {
  [SortType.DAY]: (points) => points.slice().sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom)),
  [SortType.PRICE]: (points) => points.slice().sort((a, b) => b.basePrice - a.basePrice),
  [SortType.TIME]: (points) => points.slice().sort((a, b) => {
    const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
    const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
    return durationB - durationA;
  }),
};
