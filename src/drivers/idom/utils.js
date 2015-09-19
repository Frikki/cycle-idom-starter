import {Rx} from '@cycle/core';

function getDomELement(_el) {
  const domElement =
    typeof _el === `string`?
      document.querySelector(_el) : _el;

  if (typeof container === `string` && domElement === null) {
    throw new Error(`Cannot render into unknown element \`${container}\``)
  } else if (!isElement(domElement)) {
    throw new Error(`Given container is not a DOM element neither a selector ` +
      `string.`)
  }
  return domElement;
}

function isElement(obj) {
  return typeof HTMLElement === `object` ?
    obj instanceof HTMLElement || obj instanceof DocumentFragment : //DOM2
    obj && typeof obj === `object` && obj !== null &&
    (obj.nodeType === 1 || obj.nodeType === 11) &&
    typeof obj.nodeName === `string`
}

const disposableCreate = Rx.Disposable.create
const CompositeDisposable = Rx.CompositeDisposable
const AnonymousObservable = Rx.AnonymousObservable

function createListener({element, eventName, handler, useCapture}) {
  if (element.addEventListener) {
    element.addEventListener(eventName, handler, useCapture)
    return disposableCreate(function removeEventListener() {
      element.removeEventListener(eventName, handler, useCapture)
    })
  }
  throw new Error(`No listener found`)
}

function createEventListener({element, eventName, handler, useCapture}) {
  const disposables = new CompositeDisposable()

  const toStr = Object.prototype.toString
  if (toStr.call(element) === `[object NodeList]` ||
    toStr.call(element) === `[object HTMLCollection]`)
  {
    for (let i = 0, len = element.length; i < len; i++) {
      disposables.add(createEventListener({
        element: element.item(i),
        eventName,
        handler,
        useCapture}))
    }
  } else if (element) {
    disposables.add(createListener({element, eventName, handler, useCapture}))
  }
  return disposables
}

function fromEvent(element, eventName, useCapture = false) {
  return new AnonymousObservable(function subscribe(observer) {
    return createEventListener({
      element,
      eventName,
      handler: function handler() {
        observer.onNext(arguments[0])
      },
      useCapture})
  }).publish().refCount()
}

export {getDomELement, fromEvent, isElement};
