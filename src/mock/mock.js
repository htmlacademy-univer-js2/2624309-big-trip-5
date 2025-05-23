import Point from '../model/point.js';

const DESTINATIONS = [
  {
    id: 'd1',
    name: 'Amsterdam',
    description: 'Amsterdam, capital of the Netherlands',
    pictures: []
  },
  {
    id: 'd2',
    name: 'Chamonix',
    description: 'Chamonix, a resort area near Mont Blanc',
    pictures: []
  },
  {
    id: 'd3',
    name: 'Geneva',
    description: 'Geneva, Swiss city on Lake Geneva',
    pictures: []
  }
];

export const generateDestinations = () => DESTINATIONS;

export const generateOffers = () => ({
  taxi: [
    {id: 'taxi1', title: 'Order Uber', price: 20}
  ],
  flight: [
    {id: 'flight1', title: 'Add luggage', price: 50},
    {id: 'flight2', title: 'Switch to comfort', price: 80}
  ],
  drive: [
    {id: 'drive1', title: 'Rent a car', price: 200}
  ],
  'check-in': [
    {id: 'checkin1', title: 'Add breakfast', price: 50}
  ]
});

export const generatePoints = () => [
  new Point(
    'p1',
    'taxi',
    'd1',
    new Date('2024-03-18T10:30:00'),
    new Date('2024-03-18T11:00:00'),
    20,
    ['taxi1'],
    false
  ),
  new Point(
    'p2',
    'flight',
    'd2',
    new Date('2024-03-18T12:25:00'),
    new Date('2024-03-18T13:35:00'),
    160,
    ['flight1', 'flight2'],
    false
  ),
  new Point(
    'p3',
    'drive',
    'd2',
    new Date('2024-03-18T14:30:00'),
    new Date('2024-03-18T16:05:00'),
    160,
    ['drive1'],
    false
  ),
  new Point(
    'p4',
    'check-in',
    'd2',
    new Date('2024-03-18T16:20:00'),
    new Date('2024-03-18T17:00:00'),
    600,
    ['checkin1'],
    false
  )
];
