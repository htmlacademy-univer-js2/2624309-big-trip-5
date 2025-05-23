import {FilterType} from './model.js';

export const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => new Date(point.dateFrom) > new Date()),
  [FilterType.PRESENT]: (points) => points.filter((point) => {
    const now = new Date();
    return new Date(point.dateFrom) <= now && now <= new Date(point.dateTo);
  }),
  [FilterType.PAST]: (points) => points.filter((point) => new Date(point.dateTo) < new Date()),
};