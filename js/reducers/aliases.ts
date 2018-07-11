import { reduce, assoc, pipe, merge } from 'ramda';
import actionType from '../actions/actionType';
import FluxAction from '../actions/FluxAction';

// Subscribes to events related to aliases within the state
// Handles ALL modifications to aliases
// All modifications must be made immutably

function aliases(aliases = {}, action: FluxAction) {

    const { type, payload } = action;

    switch (type) {

    case actionType.ALIAS_REGISTER: {
        return registerAliases({ 
            aliases, 
            componentName: payload.componentName, 
            aliasList: payload.aliasList, 
        });
    }

    } // End switch

    // Action not caught
    return aliases;
}


const registerAliases = ({ aliasList, componentName, aliases }) => {

    return pipe(
        reduce(
            (newAliasCollection, alias) => {
                return assoc(alias, componentName, newAliasCollection);
            }, 
            {},
        ),
        merge(aliases),
    )(aliasList);
};

export default aliases;
