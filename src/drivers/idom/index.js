import {Rx} from '@cycle/core';
import {patch} from 'incremental-dom';
import {render as RenderJSX} from 'jsx-to-idom';
import {getDomELement, isELement, fromEvent} from './utils';

function makeEventsSelector(element$) {
  return function events(eventName, useCapture = false) {
    if (typeof eventName !== `string`) {
      throw new Error(`DOM driver's get() expects second argument to be a ` +
        `string representing the event type to listen for.`)
    }
    return element$.flatMapLatest(element => {
      if (!element) {
        return Rx.Observable.empty()
      }
      return fromEvent(element, eventName, useCapture)
    }).share()
  }
}

function makeElementSelector(rootElem$) {
  return function select(selector) {
    if (typeof selector !== `string`) {
      throw new Error(`IDOM driver's select() expects first argument to be a ` +
        `string as a CSS selector`)
    }
    let element$ = selector.trim() === `:root` ? rootElem$ :
      rootElem$.map(rootElem => {
        return rootElem.querySelectorAll(selector)
      });
    return {
      observable: element$,
      events: makeEventsSelector(element$),
    }
  }
}

function renderIDOM(_container, _markup) {
  patch(_container, () => {
    RenderJSX(_markup);
  });
}

function parseChild(child) {

}

function parseTree(idomTree) {
  if (`object` === typeof idomTree && Array.isArray(idomTree.children) && idomTree.children.length > 0) {
      // jsx-ir object with children
    idomTree.children.map(parseTree);
    return Rx.Observable.just(idomTree);
  }

  if (typeof idomTree.subscribe === 'function') {
    return idomTree.map(parseTree);
  }

  if (`object` === typeof idomTree || `string` === typeof idomTree) {
    // Regular jsx-ir with no children
    // Or is a text node;
    return Rx.Observable.just(idomTree)
  }
}

function makeRootElem$(view$, container) {
  return view$.map(_ => container);
}

function makeIDOMDriver(container) {
  // Default place to patch in the dom`
  let rootElement = getDomELement(container);

  return function IDOMDriver(view$: Rx.Observable) {
    let rootElem$ = makeRootElem$(view$, rootElement);

    let id =view$
      .map(view => {console.log(view); return view})
      .flatMapLatest(parseTree);
    id
      .subscribe(view => {
        renderIDOM(rootElement, view);
      });

    return {
      select: makeElementSelector(rootElem$),
    }
  }
}

export default makeIDOMDriver;
export {makeIDOMDriver};
