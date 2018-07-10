import actionType from './actionType';
import FluxAction from './FluxAction';

// All actions related to components held in the state
// Actions should adhere to the flux-standard-action pattern
// https://github.com/redux-utilities/flux-standard-action

export const updateComponent = ({ id, value, flowKey }): FluxAction => ({
    type: actionType.STATE_SET_COMPONENT,
    payload: {
        flowKey,
        id,
        value,
    },
});

export const replaceComponents = ({ values, flowKey }): FluxAction => ({
    type: actionType.STATE_SET_COMPONENTS,
    payload: {
        flowKey,
        values,
    },
});

export const resetComponents = ({ models, invokeType, flowKey }): FluxAction => ({
    type: actionType.STATE_RESET_COMPONENTS,
    payload: {
        flowKey,
        invokeType,
        models,
    },
});
