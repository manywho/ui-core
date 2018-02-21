import actionType from './actionType';

// All actions related to components held in the state

export const updateComponent = ({ id, value, flowKey }) => ({
    flowKey,
    id,
    value,
    type: actionType.STATE_SET_COMPONENT,
});

export const replaceComponents = ({ values, flowKey }) => ({
    flowKey,
    values,
    type: actionType.STATE_SET_COMPONENTS,
});

