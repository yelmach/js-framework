function createVDOM(tag, attrs = {}, ...children) {
    const flattenedChildren = children.flat().filter(child =>
        child !== null && child !== undefined && child !== false
    );

    const processedChildren = flattenedChildren.map(child => {
        if (typeof child === 'string' || typeof child === 'number') {
            return createTextNode(child);
        }
        return child;
    })

    return {
        type: 'element',
        tag,
        attrs,
        children: processedChildren,
        key: attrs.key !== undefined ? attrs.key : null,
    };
}

function createTextNode(text) {
    return {
        type: 'text',
        text: String(text)
    };
}

function createDomElement(vnode) {
    if (vnode.type === 'text') {
        return document.createTextNode(vnode.text);
    }

    const element = document.createElement(vnode.tag);

    for (const [key, value] of Object.entries(vnode.attrs)) {
        if (key.startsWith('on')) {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    }

    vnode.children.forEach(child => {
        const childNode = createDomElement(child);
        if (childNode) element.appendChild(childNode);
    });

    element._vnode = vnode;

    return element;
}

function mount(vnode, container) {
    const element = createDomElement(vnode);
    container.appendChild(element);
    return element;
}

function patch(oldVNode, newVNode, container) {

}

