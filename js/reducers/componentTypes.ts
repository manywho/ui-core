import { assoc } from 'ramda';
import actionType from '../actions/actionType';
import FluxAction from '../actions/FluxAction';

// Subscribes to events related to componentTypes within the state
// Handles ALL modifications to componentTypes
// All modifications must be made immutably

function componentTypes(componentTypes = {}, action: FluxAction) {

    const { type, payload } = action;

    switch (type) {

    case actionType.COMPONENT_TYPE_REGISTER: {
        return assoc(payload.name, payload.component, componentTypes);
    }

    } // End switch

    // Action not caught
    return componentTypes;
}

export default componentTypes;
