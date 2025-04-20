function createElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
    }

    if (vnode && vnode._isComponent) {
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

function render(vnode, container) {
    const vnodeToRender = typeof vnode === 'function' ? vnode() : vnode;
    container.innerHTML = '';
    const element = createElement(vnodeToRender);
    container.appendChild(element);
}

export { createElement, render }
