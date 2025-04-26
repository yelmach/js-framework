import { diff } from "./diffing.js";
import { cleanupEffects, resetHookIndex, runEffects } from "./hooks.js";

let currentVNode = null;
let rootComponentFn = null;
let rootContainer = null;

function render(rootComponent, container) {
    rootComponentFn = rootComponent;
    rootContainer = container;

    resetHookIndex();

    const newVNode = rootComponentFn();

    container.innerHTML = '';
    const element = createElement(newVNode);
    container.appendChild(element);

    currentVNode = newVNode;

    setTimeout(runEffects, 0);
}

function rerender() {
    if (!rootComponentFn || !rootContainer) return;

    resetHookIndex();

    const newVNode = rootComponentFn();

    // Apply diffing algorithm to update DOM
    diff(rootContainer, currentVNode, newVNode, 0);

    currentVNode = newVNode;

    setTimeout(runEffects, 0);
}

function unmount() {
    if (rootContainer) {
        rootContainer.innerHTML = '';

        cleanupEffects();

        rootComponentFn = null;
        rootContainer = null;
        currentVNode = null;
    }
}

// Create a DOM element from a virtual node (vnode).
function createElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode.toString());
    }

    if (!vnode) {
        return document.createTextNode('');
    }

    if (vnode && vnode.component) {
        const result = vnode.component(vnode.props || {});
        return createElement(result);
    }

    if (vnode.tag === 'fragment') {
        const fragmentContainer = document.createDocumentFragment();
        if (vnode.children) {
            vnode.children.forEach(child => {
                if (child === null || child === undefined) return;
                fragmentContainer.appendChild(createElement(child));
            });
        }
        return fragmentContainer;
    }

    const element = document.createElement(vnode.tag);

    // Set element key for tracking (stored as a data attribute)
    if (vnode.attrs && vnode.attrs.key) {
        element.setAttribute('data-key', vnode.attrs.key);
    }

    if (vnode.attrs) {
        setAttributes(element, vnode.attrs);
    }

    if (vnode.children) {
        vnode.children.forEach(child => {
            if (child === null || child === undefined) return;
            element.appendChild(createElement(child));
        });
    }

    return element;
}

// set attributes on the DOM element.
function setAttributes(element, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'key') continue;

        if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.toLowerCase();
            element[eventName] = value;
        }
        else if (key === 'class' || key.startsWith('data-')) {
            element.setAttribute(key, value);
        }
        else if (key === 'style' && typeof value === 'object') {
            Object.entries(value).forEach(([styleKey, styleValue]) => {
                element.style[styleKey] = styleValue;
            });
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

export { createElement, render, rerender, unmount };