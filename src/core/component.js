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