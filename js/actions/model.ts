import actionType from './actionType';

// All actions related to the model section of state

export const replaceContainers = ({ flowKey, containers, data, propertyName }) => ({
    flowKey,
    containers,
    data,
    propertyName,
    type: actionType.MODEL_SET_CONTAINERS,
});

export const replaceComponents = ({ flowKey, components, data }) => ({
    flowKey,
    components,
    data,
    type: actionType.MODEL_SET_COMPONENTS,
});

export const addFlow = ({ flowKey }) => ({
    flowKey,
    type: actionType.MODEL_ADD_FLOW,
});
