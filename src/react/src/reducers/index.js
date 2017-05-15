import { combineReducers } from 'redux'
import todos from './todos'
import loading from './loading'

const rootReducer = combineReducers({
  loading,
  todos
})

export default rootReducer
