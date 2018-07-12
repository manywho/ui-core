import deepFreeze from 'deep-freeze-strict';

/**
 * Middleware that prevents state from being mutated anywhere in the app.
 */
export default function freeze(store) {
    return next => action => {
        freezeStoreState(store)
        try {
            return next(action)
        }
        finally {
            freezeStoreState(store)
        }
    }
}

function freezeStoreState(store) {
    const state = store.getState()
    const stateClone = Object.assign({}, state);

    // Do not freeze component type classes because they replace their methods with 'this' bound instances
    delete stateClone['componentTypes'];

    if (isFreezable(stateClone)) {
        deepFreeze(stateClone)
    }
}

function isFreezable(value) {
    return value !== null && typeof value === 'object'
}