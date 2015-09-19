import {run, Rx} from '@cycle/core';
import {makeIDOMDriver} from './drivers/idom';

function intent({IDOM}) {
  let click$ = IDOM.select('.container').events('click');

  return {
    click$
  };
}

function model(actions) {
  let clickedElement$ = actions.click$
    .map(e => e.target)
    .startWith(null);

  return {
    clickedElement$
  }
}

let border = {
  'border': '2px solid black',
  'margin': '0.2em'
};

function view(state) {
  let clickedEl = state.clickedElement$
    .map(clickedElement => {
      let el = clickedElement === null? 'Nothing':
      clickedElement.id?
        `#${clickedElement.id}`:
        clickedElement.className?
          `.${clickedElement.className}`:
          `A ${clickedElement.localName}`;
      return el;
    })

  let myDialogue = Rx.Observable.just(<div></div>);

  return Rx.Observable.combineLatest(
    clickedEl,
    myDialogue,
    (el, myDialogue) => {
      return (
        <div>
          <h1>{el} has been clicked!</h1>
          <h1>Click anything inside the box!</h1>
          <div className="container" style="border: 2px solid black; margin: 2rem;">
            <h2 style={border}>This is an h2 </h2>
            <p style={border}>this ia a p tag
              <button style={border}>This is a button tag></button>
            </p>
            {myDialogue}
            {Rx.Observable.just(<h1>Hello, world</h1>)}
          </div>
        </div>
      );
    }
  );
}

function main(responses: Object){
  const actions = intent(responses);
  const state = model(actions);
  const view$ = view(state);
  return {
    IDOM: view$
  }

}

const drivers: Object = {
  IDOM: makeIDOMDriver('.app')
};

run(main, drivers);
