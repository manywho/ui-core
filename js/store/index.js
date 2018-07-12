import { createStore, combineReducers, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import freeze from './freeze';
import * as reducers from '../reducers';

// Creates and exports the application store from all reducers
// All redux middleware is added here
// The store state should not be accessed or changed directly
// Use the getState method to view the current state
// All changes to state must go through an action and reducer

const reduxMiddleware = [];

if (false /* isDevelopment */) {
    // This freezes the entire state object to ensure all state mutations are made immutably
    reduxMiddleware.push(freeze);        
}

const reducer = combineReducers(reducers);
const enhancers = composeWithDevTools(
    applyMiddleware(...reduxMiddleware),
);

const store = createStore(
    reducer,
    enhancers
);

export default store;
