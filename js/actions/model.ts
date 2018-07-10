import actionType from './actionType';
import FluxAction from './FluxAction';

// All actions related to the model section of state
// Actions should adhere to the flux-standard-action pattern
// https://github.com/redux-utilities/flux-standard-action

export const replaceContainers = ({ flowKey, containers, data, propertyName }): FluxAction => ({
    type: actionType.MODEL_SET_CONTAINERS,
    payload: {
        flowKey,
        containers,
        data,
        propertyName,
    },
});

export const replaceComponents = ({ flowKey, components, data }): FluxAction => ({
    type: actionType.MODEL_SET_COMPONENTS,
    payload: {
        flowKey,
        components,
        data,
    },
});

export const addFlow = ({ flowKey }): FluxAction => ({
    type: actionType.MODEL_ADD_FLOW,
    payload: { 
        flowKey,
    },
});
