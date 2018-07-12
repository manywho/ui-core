import * as React from 'react';

import * as Component from './component';
import * as Engine from './engine';
import * as Log from 'loglevel';
import * as Settings from './settings';
import * as State from './state';
import * as Utils from './utils';

import store from '../store';
import { 
    replaceComponents, 
    addFlow, 
    removeFlow, 
    replaceContainers,
} from '../actions/model';

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

function updateData(collection, item, key) {

    Log.info('Updating item: ' + item.id);

    const data = Utils.get(collection, item.id, key);

    if (data != null) {

        if (item.hasOwnProperty('contentType') && item.contentType == null)
            item.contentType = Component.contentTypes.string;

        return Utils.extend({}, [item, data]);
    }

    return item;
}

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

function getNavigationItems(itemsResponse, dataResponse) {

    const navigationItems = {};

    if (itemsResponse) {

        itemsResponse.forEach((item) => {

            const data = dataResponse.find(dataResponseItem => Utils.isEqual(dataResponseItem.navigationItemId, item.id, true));

            navigationItems[item.id] = Utils.extend({}, [item, data], false);

            if (item.navigationItems != null)
                navigationItems[item.id].items = getNavigationItems(item.navigationItems, dataResponse);

        });
    }

    return navigationItems;
}

function hideContainers(lookUpKey) {
    const { model: flows } = store.getState();
    const containers = Object.keys(flows[lookUpKey].containers).map(key => flows[lookUpKey].containers[key]);
    const components = Object.keys(flows[lookUpKey].components).map(key => flows[lookUpKey].components[key]);
    const outcomes = Object.keys(flows[lookUpKey].outcomes).map(key => flows[lookUpKey].outcomes[key]);

    containers
        .filter(container => !container.parent)
        .forEach((container) => { 
            hideContainer(container, containers, components, outcomes); 
        });
}

function hideContainer(container, containers, components, outcomes) {
    let childContainers = containers.filter(child => child.parent === container.id);
    childContainers.forEach((child) => { 
        hideContainer(child, containers, components, outcomes); 
    });

    const childComponents = components.filter(component => component.pageContainerId === container.id && component.isVisible);
    const childOutcomes = outcomes.filter(outcome => outcome.pageContainerId === container.id);
    childContainers = childContainers.filter(child => child.isVisible);

    if (childComponents.length === 0 && childOutcomes.length === 0 && childContainers.length === 0 && Utils.isNullOrWhitespace(container.label))
        container.isVisible = false;
}

export interface INotification {
    timeout: number | string;
    message: string;
    type: string;
    dismissible: boolean;
    position: string;
}

/**
 * Parse the engine response into the model for this state from a `FORWARD` invoke request. This will setup the model
 * for things like: components, containers, outcomes, faults, votes, etc
 * @param engineInvokeResponse 
 * @param flowKey 
 */
export const parseEngineResponse = (engineInvokeResponse, flowKey: string) => {

    const { model: flows } = store.getState();

    const lookUpKey = Utils.getLookUpKey(flowKey);

    flows[lookUpKey].containers = {};
    flows[lookUpKey].components = {};
    flows[lookUpKey].outcomes = {};
    flows[lookUpKey].label = null;
    flows[lookUpKey].notifications = [];
    flows[lookUpKey].stateValues = [];
    flows[lookUpKey].preCommitStateValues = [];

    flows[lookUpKey].rootFaults = [];

    if (engineInvokeResponse)
        flows[lookUpKey].parentStateId = engineInvokeResponse.parentStateId;

    if (engineInvokeResponse && engineInvokeResponse.mapElementInvokeResponses) {

        flows[lookUpKey].invokeType = engineInvokeResponse.invokeType;
        flows[lookUpKey].waitMessage = engineInvokeResponse.notAuthorizedMessage || engineInvokeResponse.waitMessage;
        flows[lookUpKey].vote = engineInvokeResponse.voteResponse || null;

        if (engineInvokeResponse.mapElementInvokeResponses[0].pageResponse) {

            flows[lookUpKey].label = engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.label;

            setAttributes(flowKey, engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.attributes || null);

            setContainers(flowKey,
                          engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageContainerResponses,
                          engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageContainerDataResponses);

            setComponents(flowKey,
                          engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageComponentResponses,
                          engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses);

        }

        if (engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses)
            engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses.forEach((item) => {
                flows[lookUpKey].outcomes[item.id.toLowerCase()] = item;
            });

        hideContainers(lookUpKey);

        if (engineInvokeResponse.mapElementInvokeResponses[0].rootFaults) {

            flows[lookUpKey].rootFaults = [];
            flows[lookUpKey].notifications = flows[lookUpKey].notifications || [];

            for (const faultName in engineInvokeResponse.mapElementInvokeResponses[0].rootFaults) {

                let fault = null;

                try {
                    fault = JSON.parse(engineInvokeResponse.mapElementInvokeResponses[0].rootFaults[faultName]);
                }
                catch (ex) {
                    fault = { message: engineInvokeResponse.mapElementInvokeResponses[0].rootFaults[faultName] };
                }

                fault.name = faultName;

                flows[lookUpKey].rootFaults.push(fault);

                flows[lookUpKey].notifications.push({
                    message: fault.message,
                    position: 'center',
                    type: 'danger',
                    timeout: '0',
                    dismissible: true,
                });
            }

            State.setComponentLoading(Utils.extractElement(flowKey), null, flowKey);
        }

        if (Settings.global('history', flowKey) && Utils.isEqual(engineInvokeResponse.invokeType, 'FORWARD', true))
            setHistory(engineInvokeResponse, flowKey);

        flows[lookUpKey].preCommitStateValues = engineInvokeResponse.preCommitStateValues;
        flows[lookUpKey].stateValues = engineInvokeResponse.stateValues;

        switch (engineInvokeResponse.invokeType.toLowerCase()) {
        case 'wait':
            State.setComponentLoading('main', { message: engineInvokeResponse.waitMessage }, flowKey);
            break;
        }

    }
    else if (Utils.isEqual(engineInvokeResponse.invokeType, 'not_allowed', true))
        flows[lookUpKey].notifications.push({
            message: 'You are not authorized to access this content. Please contact your administrator for more details.',
            position: 'center',
            type: 'danger',
            timeout: '0',
            dismissible: false,

        });
};

/**
 * Parse the engine response into the model for this state from a `SYNC` invoke request
 * @param response Response from `Ajax.invoke`
 * @param flowKey 
 */
export const parseEngineSyncResponse = (response, flowKey: string) => {

    const { model: flows } = store.getState();

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (response.invokeType)
        flows[lookUpKey].invokeType = response.invokeType;

    if (response.mapElementInvokeResponses) {

        response.mapElementInvokeResponses[0].pageResponse.pageContainerDataResponses.forEach((item) => {
            let containerId = item.pageContainerId;

            // Steps will only ever have one container, the id is re-generated server side so it won't match up here, grab the existing id instead
            if (Utils.isEqual(response.mapElementInvokeResponses[0].developerName, 'step', true))
                containerId = Object.keys(flows[lookUpKey].containers)[0];

            flows[lookUpKey].containers[containerId] = Utils.extend(flows[lookUpKey].containers[containerId], item);
        });

        response.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses.forEach((item) => {
            flows[lookUpKey].components[item.pageComponentId] = Utils.extend(flows[lookUpKey].components[item.pageComponentId], item, false);
        });

        hideContainers(lookUpKey);
    }
};

/**
 * Parse the navigation response from `Ajax.getNavigation` into the model for this state
 * @param id Id of the navigation configuration in the flow
 * @param response Navigation response returned by `Ajax.getNavigation`
 * @param flowKey 
 * @param currentMapElementId 
 */
export const parseNavigationResponse = (id: string, response, flowKey: string, currentMapElementId: string) => {

    const { model: flows } = store.getState();
    
    const lookUpKey = Utils.getLookUpKey(flowKey);

    flows[lookUpKey].navigation = {};

    flows[lookUpKey].navigation[id] = {
        culture: response.culture,
        developerName: response.developerName,
        label: response.label,
        tags: response.tags,
    };

    flows[lookUpKey].navigation[id].items = getNavigationItems(response.navigationItemResponses, response.navigationItemDataResponses);
    flows[lookUpKey].navigation[id].isVisible = response.isVisible;
    flows[lookUpKey].navigation[id].isEnabled = response.isEnabled;

    let selectedItem = null;
    for (const itemId in flows[lookUpKey].navigation[id].items) {

        if (flows[lookUpKey].navigation[id].items[itemId].isCurrent) {
            selectedItem = flows[lookUpKey].navigation[id].items[itemId];
            break;
        }

    }

    if (selectedItem == null && currentMapElementId) {

        for (const itemId in flows[lookUpKey].navigation[id].items) {

            if (Utils.isEqual(flows[lookUpKey].navigation[id].items[itemId].locationMapElementId, currentMapElementId, true)) {
                flows[lookUpKey].navigation[id].items[itemId].isCurrent = true;
                break;
            }

        }

    }

    const parentStateId = getParentStateId(flowKey);

    if (parentStateId)
        flows[lookUpKey].navigation[id].returnToParent = React.createElement(Component.getByName('returnToParent'), { flowKey, parentStateId });
};

/**
 * Get the label of the current page
 */
export const getLabel = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].label;
};

/**
 * Get an ordered array of all the child models of a container
 */
export const getChildren = (containerId: string, flowKey: string) => {
    
    const { model: flows } = store.getState();
    
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flows[lookUpKey] === undefined || flows[lookUpKey].containers === undefined)
        return [];

    if (containerId === 'root')
        return Utils.getAll(flows[lookUpKey].containers, undefined, 'parent');

    let children = [];
    const container = flows[lookUpKey].containers[containerId];

    if (container != null) {
        children = children.concat(Utils.getAll(flows[lookUpKey].containers, containerId, 'parent'));
        children = children.concat(Utils.getAll(flows[lookUpKey].components, containerId, 'pageContainerId'));
    }

    children.sort((a, b) => a.order - b.order);

    return children;
};

/**
 * Get a container by id
 */
export const getContainer = (containerId: string, flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].containers[containerId];
};

/**
 * Get a component by id
 */
export const getComponent = (componentId: string, flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].components[componentId];
};

/**
 * Get a component by name
 */
export const getComponentByName = (name: string, flowKey: string) => {
    const { model: flows } = store.getState();

    const lookUpKey = Utils.getLookUpKey(flowKey);
    const components = flows[lookUpKey].components;

    if (components) {
        for (const id in components) {
            if (Utils.isEqual(name, components[id].developerName, true))
                return components[id];
        }
    }

    return null;
};

/**
 * Get all the components
 */
export const getComponents = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].components;
};

/**
 * Get an outcome by id
 */
export const getOutcome = (id: string, flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flows[lookUpKey].outcomes)
        return flows[lookUpKey].outcomes[id.toLowerCase()];
};

/**
 * Get all the outcomes for a container / component
 * @param id Id of the component or container that the outcomes are associated with
 */
export const getOutcomes = (id: string, flowKey: string): any[] => {

    const { model: flows } = store.getState();

    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flows[lookUpKey] === undefined || flows[lookUpKey].outcomes === undefined)
        return [];

    const outcomesArray = Utils.convertToArray(flows[lookUpKey].outcomes) || [];

    outcomesArray.sort((a, b) => a.order - b.order);

    return outcomesArray.filter((outcome) => {
        return (!Utils.isNullOrWhitespace(id) && Utils.isEqual(outcome.pageObjectBindingId, id, true))
            || ((Utils.isNullOrWhitespace(id) || Utils.isEqual(id, 'root', true)) && Utils.isNullOrWhitespace(outcome.pageObjectBindingId));
    });
};

/**
 * Get currently active notifications for a given position
 * @param flowKey 
 * @param position `center`, `left`, `right` 
 */
export const getNotifications = (flowKey: string, position: string): INotification[] => {

    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flows[lookUpKey].notifications)
        return flows[lookUpKey].notifications.filter(notification => Utils.isEqual(notification.position, position, true));

    return [];
};

/**
 * Remove a notification
 */
export const removeNotification = (flowKey: string, notification: INotification) => {

    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flows[lookUpKey]) {

        const index = flows[lookUpKey].notifications.indexOf(notification);
        flows[lookUpKey].notifications.splice(index, 1);

        Engine.render(flowKey);
    }
};

/**
 * Add a new notification
 */
export const addNotification = (flowKey: string, notification: INotification) => {

    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flows[lookUpKey]) {

        flows[lookUpKey].notifications = flows[lookUpKey].notifications || [];

        flows[lookUpKey].notifications.push(notification);
        Engine.render(flowKey);
    }
};

/**
 * @ignore
 */
export const getSelectedNavigation = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].selectedNavigation;
};

/**
 * @ignore
 */
export const setSelectedNavigation = (navigationId: string, flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flows[lookUpKey].selectedNavigation = navigationId;
};

/**
 * Get the model for a configured navigation by id
 */
export const getNavigation = (navigationId: string, flowKey: string) => {

    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (navigationId)
        return flows[lookUpKey].navigation[navigationId];
};

/**
 * Get the first navigation model configured for this flow
 */
export const getDefaultNavigationId = (flowKey: string) => {

    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (flows[lookUpKey].navigation)
        return Object.keys(flows[lookUpKey].navigation)[0];
};

/**
 * Search the model for a matching container, component, outcome or navigation (in that order) for the given `id`
 */
export const getItem = (id: string, flowKey: string) => {

    let item = getContainer(id, flowKey);
    if (item != null)
        return item;

    item = getComponent(id, flowKey);
    if (item != null)
        return item;

    item = getOutcome(id, flowKey);
    if (item != null)
        return item;

    item = getNavigation(id, flowKey);
    if (item != null)
        return item;
};

/**
 * @ignore
 */
export const getInvokeType = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].invokeType;
};

/**
 * @ignore
 */
export const getWaitMessage = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].waitMessage;
};

/**
 * @ignore
 */
export const getPreCommitStateValues = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].preCommitStateValues;
};

/**
 * @ignore
 */
export const getStateValues = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].stateValues;
};

/**
 * @ignore
 */
export const getExecutionLog = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].executionLog;
};

/**
 * @ignore
 */
export const setExecutionLog = (flowKey: string, executionLog) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flows[lookUpKey].executionLog = executionLog;
};

/**
 * @hidden
 */
export const getHistory = (flowKey: string) => {

    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (!flows[lookUpKey].history)
        flows[lookUpKey].history = [];

    return flows[lookUpKey].history;
};

/**
 * @hidden
 */
export const setHistory = (engineInvokeResponse, flowKey: string) => {

    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);

    if (!flows[lookUpKey].history)
        flows[lookUpKey].history = [];

    if (!flows[lookUpKey].lastInvoke)
        flows[lookUpKey].lastInvoke = 'FORWARD';

    const length = flows[lookUpKey].history.length;
    let outcomes = null;

    if (Utils.isEqual(flows[lookUpKey].lastInvoke, 'FORWARD', true)) {

        if (engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses)
            outcomes = engineInvokeResponse.mapElementInvokeResponses[0].outcomeResponses.map((outcome) => {
                return { name: outcome.developerName, id: outcome.id, label: outcome.label, order: outcome.order };
            });

        flows[lookUpKey].history[length] = Utils.extend(flows[lookUpKey].history[length] || {}, [{
            outcomes,
            name: engineInvokeResponse.mapElementInvokeResponses[0].developerName,
            id: engineInvokeResponse.mapElementInvokeResponses[0].mapElementId,
            label: engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.label,
            content: engineInvokeResponse.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses[0].content || '',
        }]);
    }
};

/**
 * @hidden
 */
export const setHistorySelectedOutcome = (selectedOutcome, invokeType: string, flowKey: string) => {

    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);

    flows[lookUpKey].lastInvoke = invokeType;

    if (selectedOutcome) {

        if (!flows[lookUpKey].history)
            flows[lookUpKey].history = [];

        const length = flows[lookUpKey].history.length - 1;

        if (!flows[lookUpKey].history[length])
            flows[lookUpKey].history[length] = {};

        flows[lookUpKey].history[length].selectedOutcome = selectedOutcome;
    }
};

/**
 * @hidden
 */
export const popHistory = (mapElementId: string, flowKey: string) => {

    const { model: flows } = store.getState();

    const lookUpKey = Utils.getLookUpKey(flowKey);

    const length = flows[lookUpKey].history.length;

    for (let i = length; i > 0; i -= 1) {

        const mapElement = flows[lookUpKey].history[i - 1];

        if (mapElement.id === mapElementId)
            break;

        flows[lookUpKey].history.pop();
    }
};

/**
 * Check if an item has the property `containerType`
 */
export const isContainer = (item) => {
    return !Utils.isNullOrWhitespace(item.containerType);
};

/**
 * Create a new empty model for this state
 */
export const initializeModel = (flowKey: string) => {

    store.dispatch(addFlow({ flowKey }));
};

/**
 * @ignore
 */
export const getAttributes = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].attributes;
};

/**
 * @ignore
 */
export const getParentStateId = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].parentStateId;
};

/**
 * Remove the local cache of the model for this state
 */
export const deleteflows = (flowKey: string) => {
    store.dispatch(removeFlow({ flowKey }));
};

/**
 * @ignore
 */
export const getRootFaults = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].rootFaults || [];
};

/**
 * Set this flow models `containers` property by iterating through the `containers` array merge with the matching container data in `data` 
 */
export const setContainers = (flowKey: string, containers: any[], data: any, propertyName?: string) => {

    store.dispatch(replaceContainers({ flowKey, containers, data, propertyName }));
};

/**
 * Set this flow models `components` property by iterating through the `components` array merge with the matching container data in `data` 
 */
export const setComponents = (flowKey: string, components: any[], data: any) => {

    store.dispatch(replaceComponents({ flowKey, components, data }));
};

/**
 * @ignore
 */
export const setAttributes = (flowKey: string, attributes: any) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flows[lookUpKey].attributes = attributes;
};

/**
 * @ignore
 */
export const setModal = (flowKey: string, modal) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    flows[lookUpKey].modal = modal;
    Engine.render(flowKey);
};

/**
 * @ignore
 */
export const getModal = (flowKey: string) => {
    const { model: flows } = store.getState();
    const lookUpKey = Utils.getLookUpKey(flowKey);
    return flows[lookUpKey].modal;
};
