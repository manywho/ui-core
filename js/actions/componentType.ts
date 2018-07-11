import actionType from './actionType';
import FluxAction from './FluxAction';

// All actions related to components held in the state
// Actions should adhere to the flux-standard-action pattern
// https://github.com/redux-utilities/flux-standard-action

export const registerComponentType = ({ name, component }): FluxAction => ({
    type: actionType.COMPONENT_TYPE_REGISTER,
    payload: {
        name, 
        component, 
    },
});
