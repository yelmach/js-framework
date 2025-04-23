import { resetHookIndex, runEffects, cleanupEffects } from './hooks.js';

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


let rootComponentFn = null;
let rootContainer = null;

function render(rootComponent, container) {
    rootComponentFn = rootComponent;
    rootContainer = container;

    resetHookIndex();

    const element = createElement(rootComponentFn());
    container.innerHTML = '';
    container.appendChild(element);

    setTimeout(runEffects, 0);
}

function rerender() {
    if (!rootComponentFn || !rootContainer) return;

    resetHookIndex();

    const newElement = createElement(rootComponentFn());
    const oldElement = rootContainer.firstChild;

    if (oldElement && newElement) {
        rootContainer.replaceChild(newElement, oldElement);
    } else if (newElement) {
        rootContainer.appendChild(newElement);
    }

    setTimeout(runEffects, 0);
}

function unmount() {
    if (rootContainer) {
        rootContainer.innerHTML = '';

        cleanupEffects();

        rootComponentFn = null;
        rootContainer = null;
    }
}

export { createElement, render, rerender, unmount }