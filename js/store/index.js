import { createStore, combineReducers } from 'redux';
import * as reducers from '../reducers';

// Creates and exports the application store from all reducers
// All redux middleware is added here
// Adds the store to the global manywho object so that it's available in the ui as a provider
// The store should not be accessed or changed directly
// Use the getState method to view the current state
// All changes to state must go through an action and reducer

const store = createStore(
    combineReducers(reducers),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

window.manywho.__store__ = store;

export default store;
