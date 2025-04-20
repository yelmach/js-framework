function createElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
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
            element[key.slice(2).toLowerCase()] = value;
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
            element[key] = value
        }
    }
}

function render(vnode, container) {
    container.innerHTML = '';
    const element = createElement(vnode);
    container.appendChild(element);
}

export { createElement, render }
