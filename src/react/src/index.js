import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import App from './containers/App'
import reducer from './reducers'
import 'todomvc-app-css/index.css'
import thunk from 'redux-thunk';
import { apiMiddleware } from "./middlewares"

const finalCreateStore = compose(
  applyMiddleware(apiMiddleware),
  applyMiddleware(thunk)
)(createStore);

const store = finalCreateStore(reducer);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

store.dispatch({type: 'GET_TODO'})
