import { resetHookIndex, runEffects, cleanupEffects } from './hooks.js';

let previousVirtualDOM = null;

function createElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
    }

    if (vnode && vnode.component) {
        const result = vnode.component(vnode.props || {});
        return createElement(result);
    }

    const element = document.createElement(vnode.tag);

    if (vnode.attrs) {
        setAttributes(element, vnode.attrs);
    }

    vnode.children?.forEach(child => {
        if (child === null || child === undefined) return
        element.appendChild(createElement(child));
    });

    element._vnode = vnode;

    return element;
}

function setAttributes(element, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
        if (key.startsWith('on') && typeof value === 'function') {
            element[key.toLowerCase()] = value;
        }
        else if (key === 'class' || key.startsWith('data-')) {
            element.setAttribute(key, value);
        }
        else if (key === 'style' && typeof value === 'object') {
            Object.entries(value).forEach(([styleKey, styleValue]) => {
                element.style[styleKey] = styleValue;
            })
        }
        else {
            try {
                element[key] = value;
            } catch (e) {
                element.setAttribute(key, value);
            }
        }
    }
}

function removeAttributes(element, oldAttrs, newAttrs) {
    for (const [key, value] of Object.entries(oldAttrs)) {
        if (!(key in newAttrs)) {
            if (key.startsWith('on')) {
                element[key.toLowerCase()] = null;
            } else if (key === 'style') {
                element.removeAttribute('style');
            } else {
                element.removeAttribute(key);
            }
        }
    }
}

function updateAttributes(element, oldAttrs, newAttrs) {
    // Remove attributes that are no longer present
    removeAttributes(element, oldAttrs || {}, newAttrs || {});

    // Add or update attributes
    for (const [key, value] of Object.entries(newAttrs || {})) {
        const oldValue = oldAttrs?.[key];

        // Skip if the attribute value hasn't changed
        if (oldValue === value) continue;

        // Special handling for style objects
        if (key === 'style' && typeof value === 'object' && typeof oldValue === 'object') {
            // Update only changed styles
            for (const [styleKey, styleValue] of Object.entries(value)) {
                if (oldValue[styleKey] !== styleValue) {
                    element.style[styleKey] = styleValue;
                }
            }

            // Remove styles that are no longer present
            for (const styleKey in oldValue) {
                if (!(styleKey in value)) {
                    element.style[styleKey] = '';
                }
            }
        } else {
            // For other attributes, use setAttributes function
            setAttributes(element, { [key]: value });
        }
    }
}

function reconcile(parentDom, oldVNode, newVNode, index = 0) {
    // If no old node, create new DOM
    if (!oldVNode) {
        parentDom.appendChild(createElement(newVNode));
        return;
    }

    // If no new node, remove old DOM
    if (!newVNode) {
        parentDom.removeChild(parentDom.childNodes[index]);
        return;
    }

    // Handle text nodes
    if (typeof oldVNode === 'string' || typeof oldVNode === 'number' ||
        typeof newVNode === 'string' || typeof newVNode === 'number') {

        if (oldVNode !== newVNode) {
            // Text changed, replace node
            const newTextNode = document.createTextNode(newVNode);
            parentDom.replaceChild(newTextNode, parentDom.childNodes[index]);
        }
        return;
    }

    // Handle component nodes
    if (oldVNode.component || newVNode.component) {
        // If component type changed or is different
        if (!oldVNode.component || !newVNode.component ||
            oldVNode.component !== newVNode.component) {

            const newElement = createElement(newVNode);
            parentDom.replaceChild(newElement, parentDom.childNodes[index]);
            return;
        }

        // Same component, possibly with different props
        const result = newVNode.component(newVNode.props || {});
        const oldResult = oldVNode.component(oldVNode.props || {});

        // Recursively reconcile component output
        reconcile(parentDom, oldResult, result, index);
        return;
    }

    // If node types are different, replace completely
    if (oldVNode.tag !== newVNode.tag) {
        const newElement = createElement(newVNode);
        parentDom.replaceChild(newElement, parentDom.childNodes[index]);
        return;
    }

    // Same tag - update the element in place
    const domElement = parentDom.childNodes[index];

    // Update attributes
    updateAttributes(domElement, oldVNode.attrs, newVNode.attrs);

    // Store the new virtual node reference
    domElement._vnode = newVNode;

    // Reconcile children with key support
    reconcileChildren(domElement, oldVNode.children || [], newVNode.children || []);
}

// Reconcile children with key-based tracking
function reconcileChildren(parentDom, oldChildren, newChildren) {
    // Create maps for keyed elements
    const oldKeyed = {};
    const newKeyed = {};

    // Identify keyed elements in old and new children
    oldChildren.forEach((child, i) => {
        const key = getKey(child, i);
        if (key) oldKeyed[key] = { node: child, index: i };
    });

    newChildren.forEach((child, i) => {
        const key = getKey(child, i);
        if (key) newKeyed[key] = { node: child, index: i };
    });

    let oldIndex = 0;
    let newIndex = 0;

    // Process all children
    while (newIndex < newChildren.length) {
        const oldChild = oldIndex < oldChildren.length ? oldChildren[oldIndex] : null;
        const newChild = newChildren[newIndex];

        // Skip null/undefined children
        if (oldChild === null || oldChild === undefined) {
            oldIndex++;
            continue;
        }

        const oldKey = getKey(oldChild, oldIndex);
        const newKey = getKey(newChild, newIndex);

        // Handle keyed elements
        if (newKey && oldKey) {
            // If keys match, update in place
            if (oldKey === newKey) {
                reconcile(parentDom, oldChild, newChild, oldIndex);
                oldIndex++;
                newIndex++;
            }
            // If old key exists in new children but at different position
            else if (newKeyed[oldKey]) {
                // Get the old element with the same key as current new child
                const oldKeyedItem = oldKeyed[newKey];

                if (oldKeyedItem) {
                    // Key exists in both old and new - move and update
                    const oldMatchingNode = oldKeyedItem.node;
                    const oldMatchingIndex = oldKeyedItem.index;

                    // Move DOM node if needed
                    if (oldMatchingIndex !== oldIndex) {
                        parentDom.insertBefore(
                            parentDom.childNodes[oldMatchingIndex],
                            parentDom.childNodes[oldIndex]
                        );
                    }

                    // Update the node
                    reconcile(parentDom, oldMatchingNode, newChild, oldIndex);
                } else {
                    // New key not in old - insert new node
                    reconcile(parentDom, null, newChild, oldIndex);
                }

                newIndex++;
            } else {
                // Old key not used anymore - remove it
                reconcile(parentDom, oldChild, null, oldIndex);
                oldIndex++;
            }
        }
        // No keys - simple position-based update
        else {
            reconcile(parentDom, oldChild, newChild, oldIndex);
            oldIndex++;
            newIndex++;
        }
    }

    // Remove any remaining old nodes
    while (oldIndex < oldChildren.length) {
        reconcile(parentDom, oldChildren[oldIndex], null, oldIndex);
        oldIndex++;
    }

    // Add any remaining new nodes
    while (newIndex < newChildren.length) {
        reconcile(parentDom, null, newChildren[newIndex], parentDom.childNodes.length);
        newIndex++;
    }
}

// Get key from virtual node
function getKey(vnode, fallbackIndex) {
    if (!vnode || typeof vnode === 'string' || typeof vnode === 'number') {
        return `__index_${fallbackIndex}`;
    }

    // Key from component props
    if (vnode.component && vnode.props && vnode.props.key !== undefined) {
        const key = vnode.props.key;
        return key;
    }

    // Key from element attributes
    if (vnode.attrs && vnode.attrs.key !== undefined) {
        const key = vnode.attrs.key;
        return key;
    }

    // Fallback to index for non-keyed elements
    return `__index_${fallbackIndex}`;
}

let rootComponentFn = null;
let rootContainer = null;

function render(rootComponent, container) {
    rootComponentFn = rootComponent;
    rootContainer = container;

    resetHookIndex();

    const vdom = rootComponentFn();

    const element = createElement(vdom);
    container.innerHTML = '';
    container.appendChild(element);

    previousVirtualDOM = vdom;

    setTimeout(runEffects, 0);
}

function rerender() {
    if (!rootComponentFn || !rootContainer) return;

    console.log("rerender triggered");
    resetHookIndex();

    const newVirtualDOM = rootComponentFn();

    reconcile(rootContainer, previousVirtualDOM, newVirtualDOM, 0);

    previousVirtualDOM = newVirtualDOM;

    setTimeout(runEffects, 0);
}

// Unmount and cleanup
function unmount() {
    if (rootContainer) {
        rootContainer.innerHTML = '';
        cleanupEffects();
        rootComponentFn = null;
        rootContainer = null;
        previousVirtualDOM = null;
    }
}

export { createElement, render, rerender, unmount }