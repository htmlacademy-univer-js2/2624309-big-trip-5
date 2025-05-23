// src/render.js
const RenderPosition = {
  BEFOREBEGIN: 'beforebegin',
  AFTERBEGIN: 'afterbegin',
  BEFOREEND: 'beforeend',
  AFTEREND: 'afterend',
};

/**
 * Создаёт DOM-элемент из HTML-шаблона
 * @param {string} template — HTML строка
 * @return {HTMLElement}
 */
function createElement(template) {
  const newElement = document.createElement('div');
  newElement.innerHTML = template.trim();
  return newElement.firstElementChild;
}

/**
 * Отрисовывает компонент в контейнер в указанное место
 * @param {Object} component — объект с методом getElement()
 * @param {HTMLElement} container — контейнер для вставки
 * @param {string} place — позиция вставки, по умолчанию 'beforeend'
 */
function render(component, container, place = RenderPosition.BEFOREEND) {
  container.insertAdjacentElement(place, component.getElement());
}

export { RenderPosition, createElement, render };
