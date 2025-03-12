import { createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import productReducer from "./redux/modules/productReducer";
import rootReducer from './redux/modules'

let store = createStore(rootReducer, applyMiddleware(thunk))

export default store;