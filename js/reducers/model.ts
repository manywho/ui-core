import { merge, isNil, set, lensPath, view } from 'ramda';
import actionType from '../actions/actionType';
import * as Model from '../services/model';
import * as Utils from '../services/utils';
import { contentTypes } from '../services/component';

// Subscribes to events related to the model section of the state
// Handles ALL modifications to the model
// All modifications must be made immutably

function model(flows = {}, action) {

    switch (action.type) {

    case actionType.MODEL_ADD_FLOW: {
        const lookUpKey = Utils.getLookUpKey(action.flowKey);
        return merge(flows, { [lookUpKey]: action.flow || {} });        
    }

    case actionType.MODEL_SET_CONTAINERS: {
        return setContainers(flows, action);        
    }

    case actionType.MODEL_SET_COMPONENTS: {
        return setComponents(flows, action);        
    }

    } // End switch

    // Action not caught
    return flows;
}

// TODO: make immutable
const setContainers = (flows, { flowKey, containers, data, propertyName }) => {

    const lookUpKey = Utils.getLookUpKey(flowKey);

    propertyName = propertyName || 'pageContainerResponses';

    if (containers) {

        flows[lookUpKey].containers = {};

        const flattenedContainers = flattenContainers(containers, null, [], propertyName);
        flattenedContainers.forEach((item) => {

            flows[lookUpKey].containers[item.id] = item;

            if (data && Utils.contains(data, item.id, 'pageContainerId'))
                flows[lookUpKey].containers[item.id] = updateData(data, item, 'pageContainerId');
        });
    }

    return flows;
};

// TODO: make immutable
const setComponents = (flows, { flowKey, components, data }) => {

    const flowLookUpKey = Utils.getLookUpKey(flowKey);
    const flow = flows[flowLookUpKey];

    if (components) {

        const decodeTextArea = document.createElement('textarea');
        
        flow.components = {};

        components.forEach((item) => {

            item.attributes = item.attributes || {};

            flow.components[item.id] = item;

            if (!flow.containers[item.pageContainerId].childCount)
                flow.containers[item.pageContainerId].childCount = 0;

            flow.containers[item.pageContainerId].childCount += 1;

            if (data && Utils.contains(data, item.id, 'pageComponentId'))
                flow.components[item.id] = updateData(data, item, 'pageComponentId');

            flow.components[item.id] = decodeEntities(flow.components[item.id], decodeTextArea);

        });
    }

    return flows;
};

// TODO: make immutable
function flattenContainers(containers, parent, result, propertyName) {

    propertyName = propertyName || 'pageContainerResponses';

    if (containers != null) {

        for (let index = 0; index < containers.length; index += 1) {

            const item = containers[index];

            if (parent) {
                item.parent = parent.id;
                parent.childCount = containers.length;
            }

            result.push(item);
            flattenContainers(item[propertyName], item, result, propertyName);
        }
    }

    return result;
}

// TODO: make immutable
function updateData(collection, item, key) {

    const data = Utils.get(collection, item.id, key);

    if (data != null) {

        if (item.hasOwnProperty('contentType') && item.contentType == null)
            item.contentType = contentTypes.string;

        return Utils.extend({}, [item, data]);
    }

    return item;
}

// TODO: make immutable
function decodeEntities(item, textArea) {

    if (item.contentValue) {
        textArea.innerHTML = item.contentValue;
        item.contentValue = textArea.textContent;
        textArea.textContent = '';
    }

    if (item.objectData) {

        item.objectData.forEach((objectData) => {

            if (objectData.properties)
                objectData.properties = objectData.properties.map((prop) => {

                    if (prop.contentValue) {
                        textArea.innerHTML = prop.contentValue;
                        prop.contentValue = textArea.textContent;
                        textArea.textContent = '';
                    }
                    return prop;
                });
        });
    }

    return item;
}

export default model;
