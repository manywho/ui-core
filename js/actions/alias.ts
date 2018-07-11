import actionType from './actionType';
import FluxAction from './FluxAction';

// All actions related to aliases held in the state
// Actions should adhere to the flux-standard-action pattern
// https://github.com/redux-utilities/flux-standard-action

export const registerAlias = ({ componentName, aliasList }): FluxAction => ({
    type: actionType.ALIAS_REGISTER,
    payload: {
        componentName, 
        aliasList, 
    },
});
