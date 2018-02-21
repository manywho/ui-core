import { merge, isNil, set, lensPath, view } from 'ramda';
import actionType from '../actions/actionType';
import * as Model from '../services/model';
import * as Utils from '../services/utils';

// Subscribes to events related to components within the state
// Handles ALL modifications to components
// All modifications must be made immutably

function components(allComponents = {}, action) {

    switch (action.type) {

    case actionType.STATE_SET_COMPONENT: {
        return updateComponent(allComponents, action);        
    }

    case actionType.STATE_SET_COMPONENTS: {
        return replaceComponents(allComponents, action);        
    }

    } // End switch

    // Action not caught
    return allComponents;
}

const replaceComponents = (allComponents, { flowKey, values }) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);
    const newComponents = merge(allComponents, { [lookUpKey]: values });

    return newComponents;
};

const updateComponent = (allComponents, { flowKey, id, value }) => {
    
    const lookUpKey = Utils.getLookUpKey(flowKey);

    // A lens to the nested component
    const componentLens = lensPath([lookUpKey, id]);

    // update the value property on the component
    set(componentLens, { value }, allComponents);

    if (!isNil(value)) {
        // update the objectData property to value.objectData
        set(componentLens, { objectData: value.objectData }, allComponents);
    }

    if (
        typeof value.isValid === 'undefined' 
        && view(lensPath([lookUpKey, id, 'isValid']), allComponents) === false
    ) {
        const model = Model.getComponent(id, flowKey);

        if (model.isRequired &&
            (!Utils.isNullOrEmpty(value.contentValue as string) || (value.objectData && value.objectData.length > 0))
        ) {
            set(componentLens, { isValid: true, validationMessage: null }, allComponents);
        }
    }

    return allComponents;
};

export default components;
