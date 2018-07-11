import { merge, isNil, set, lensPath, view, assoc } from 'ramda';
import actionType from '../actions/actionType';
import FluxAction from '../actions/FluxAction';
import * as Model from '../services/model';
import * as Utils from '../services/utils';
import { shouldValidate } from '../services/validation';
import { isValid } from '../services/state';

// Subscribes to events related to components within the state
// Handles ALL modifications to components
// All modifications must be made immutably

function components(allComponents = {}, action: FluxAction) {

    switch (action.type) {

    case actionType.COMPONENT_UPDATE: {
        return updateComponent(allComponents, action.payload);        
    }

    case actionType.COMPONENT_UPDATE_MANY: {
        return replaceComponents(allComponents, action.payload);        
    }

    case actionType.COMPONENT_RESET_ALL: {
        return resetComponents(allComponents, action.payload);        
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

const updateComponent = (allComponents, { flowKey, id: componentId, value }) => {
    
    const lookUpKey = Utils.getLookUpKey(flowKey);



    // get components for just this flow
    const flowComponents = allComponents[lookUpKey];
    // get the component we need to make updates to
    const componentToUpdate = flowComponents[componentId];

    // const isValid = 
    //     isNil(value.isValid) && componentToUpdate.isValid === false
    //     ? 

    // update the component by merging the properties inside value
    const newComponent = merge(componentToUpdate, value);

    // if (
    //     typeof value.isValid === 'undefined' 
    //     && newComponent.isValid === false
    // ) {
    //     const model = Model.getComponent(id, flowKey);

    //     if (model.isRequired &&
    //         (!Utils.isNullOrEmpty(value.contentValue as string) || (value.objectData && value.objectData.length > 0))
    //     ) {
    //         set(componentLens, { isValid: true, validationMessage: null }, allComponents);
    //     }
    // }

    const newFlowComponents = assoc(componentId, newComponent, flowComponents);
    const newAllComponents = assoc(lookUpKey, newFlowComponents, allComponents);

    return newAllComponents;
};

/**
 * Reset the local state of each component defined in the models. Optionally perform validation on each model
 */
const resetComponents = (allComponents, { models, invokeType, flowKey }) => {
    const flowLookUpKey = Utils.getLookUpKey(flowKey);
    const flowComponents = {}; 

    Object.keys(models).forEach((modelId) => {
        let selectedObjectData = null;
        const model = models[modelId];

        // We need to do a little work on the object data as we only want the selected values in the state
        if (model.objectData && !Utils.isEmptyObjectData(model))
            selectedObjectData = model.objectData.filter(item => item.isSelected);

        flowComponents[model.id] = {
            contentValue: model.contentValue || null,
            objectData: selectedObjectData || null,
        };

        if (shouldValidate(invokeType, flowKey))
            flowComponents[model.id] = merge(flowComponents[model.id], isValid(model.id, flowKey));
    });

    const newComponents = assoc(flowLookUpKey, flowComponents, allComponents);

    return newComponents;
};

export default components;
