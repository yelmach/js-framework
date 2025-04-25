function diff(parentDom, oldVNode, newVNode, index = 0) {
    if (!newVNode && !oldVNode) return;

    // Case 1: Nothing to render (remove old node)
    if (!newVNode) {
        if (parentDom.childNodes[index]) {
            parentDom.removeChild(parentDom.childNodes[index]);
        }
        return;
    }

    // Resolve component nodes before diffing
    const oldNode = oldVNode ? resolveComponentNode(oldVNode) : null;
    const newNode = resolveComponentNode(newVNode);

    // Case 2: New node but no old node (append)
    if (!oldNode) {
        parentDom.appendChild(createElement(newNode));
        return;
    }

    const domNode = parentDom.childNodes[index];
    if (!domNode) {
        parentDom.appendChild(createElement(newNode));
        return;
    }

    // Case 3: Both nodes are text nodes
    if (isTextNode(oldNode) && isTextNode(newNode)) {
        if (oldNode !== newNode) {
            domNode.nodeValue = newNode.toString();
        }
        return;
    }

    const oldKey = oldNode?.attrs?.key;
    const newKey = newNode?.attrs?.key;

    if (oldKey && newKey && oldKey !== newKey) {
        const keyedNode = findDOMNodeByKey(parentDom, newKey);
        if (keyedNode) {
            // Move the existing node to the current position
            parentDom.insertBefore(keyedNode.node, domNode);

            updateAttributes(keyedNode.node, oldNode.attrs, newNode.attrs);

            const oldChildren = oldNode.children || [];
            const newChildren = newNode.children || [];

            const maxLength = Math.max(oldChildren.length, newChildren.length);
            for (let i = 0; i < maxLength; i++) {
                diff(keyedNode.node, oldChildren[i], newChildren[i], i);
            }

            // Remove the original node
            parentDom.removeChild(domNode);
            return;
        }
    }

    // Case 4: Different node types (replace)
    if (!isSameNodeType(oldNode, newNode) || !hasSameKey(oldNode, newNode)) {
        const newDomNode = createElement(newNode);
        parentDom.replaceChild(newDomNode, domNode);
        return;
    }

    // Case 5: Same element type - update attributes and children
    updateAttributes(domNode, oldNode.attrs, newNode.attrs);

    const oldChildren = oldNode.children || [];
    const newChildren = newNode.children || [];

    // If both arrays are empty, nothing to do
    if (oldChildren.length === 0 && newChildren.length === 0) {
        return;
    }

    // If no new childern, clear all children
    if (newChildren.length === 0) {
        domNode.innerHTML = '';
        return;
    }

    // If no old children, we're adding all new children
    if (oldChildren.length === 0) {
        newChildren.forEach(child => {
            domNode.appendChild(createElement(child));
        });
        return;
    }

    // First, create a map of keyed old children
    const keyedOldChildren = new Map();
    oldChildren.forEach((child, i) => {
        const key = child && child.attrs && child.attrs.key;
        if (key !== undefined) {
            keyedOldChildren.set(key, { vnode: child, index: i, domIndex: i });
        }
    });

    // Track which old nodes have been used
    const usedOldNodes = new Set();

    // Current position in the DOM
    let currentIndex = 0;

    // Process each new child
    for (let i = 0; i < newChildren.length; i++) {
        const newChild = newChildren[i];
        const newKey = newChild && newChild.attrs && newChild.attrs.key;

        // Find the corresponding old node
        let oldChildInfo = null;
        if (newKey !== undefined) {
            oldChildInfo = keyedOldChildren.get(newKey);
        }

        // If we found a matching old node
        if (oldChildInfo && !usedOldNodes.has(oldChildInfo.index)) {
            // Mark this old node as used
            usedOldNodes.add(oldChildInfo.index);

            // Get the old vnode
            const oldChild = oldChildInfo.vnode;

            // If DOM indices don't match, we need to move the node
            if (oldChildInfo.domIndex !== currentIndex) {
                // Find the actual DOM node
                const oldDomNode = domNode.childNodes[oldChildInfo.domIndex];
                // Move it to the current position
                if (oldDomNode && currentIndex < domNode.childNodes.length) {
                    domNode.insertBefore(oldDomNode, domNode.childNodes[currentIndex]);
                } else if (oldDomNode) {
                    domNode.appendChild(oldDomNode);
                }
            }

            // Recursively diff this node
            diff(domNode, oldChild, newChild, currentIndex);
        } else {
            // No matching old node, insert a new one
            if (currentIndex < domNode.childNodes.length) {
                domNode.insertBefore(createElement(newChild), domNode.childNodes[currentIndex]);
            } else {
                domNode.appendChild(createElement(newChild));
            }
        }

        currentIndex++;
    }

    // Remove any unused old nodes
    for (let i = 0; i < oldChildren.length; i++) {
        if (!usedOldNodes.has(i)) {
            const index = Array.from(usedOldNodes).filter(idx => idx < i).length;
            const nodeIndex = i - index;
            if (domNode.childNodes[nodeIndex]) {
                domNode.removeChild(domNode.childNodes[nodeIndex]);
            }
        }
    }
}

function resolveComponentNode(vnode) {
    if (!vnode) return null;

    if (vnode.component) {
        return vnode.component(vnode.props || {})
    }
    return vnode;
}

function isTextNode(node) {
    return typeof node === 'string' || typeof node === 'number';
}

// Find a DOM node with the given key within a parent
function findDOMNodeByKey(parent, key, startIndex = 0) {
    if (!parent || !key) return null;

    for (let i = startIndex; i < parent.childNodes.length; i++) {
        const child = parent.childNodes[i];
        if (child.nodeType === 1 && child.getAttribute('data-key') === key.toString()) {
            return { node: child, index: i };
        }
    }

    return null;
}

// Helper function to check if two nodes are of the same type
function isSameNodeType(node1, node2) {
    // Handle null cases
    if (!node1 || !node2) return false;

    // Both text nodes
    if (isTextNode(node1) && isTextNode(node2)) {
        return true;
    }

    // One is text, other is not
    if (isTextNode(node1) || isTextNode(node2)) {
        return false;
    }

    // Compare tag names for regular elements
    return node1.tag === node2.tag;
}

// Helper to check if nodes have the same key
function hasSameKey(node1, node2) {
    // If both nodes don't have a key attribute, they're considered the same key (null key)
    if ((!node1 || !node1.attrs || !node1.attrs.key) &&
        (!node2 || !node2.attrs || !node2.attrs.key)) {
        return true;
    }

    // If one has a key and the other doesn't, they're different
    if ((!node1 || !node1.attrs || !node1.attrs.key) ||
        (!node2 || !node2.attrs || !node2.attrs.key)) {
        return false;
    }

    // Otherwise compare the keys
    return node1.attrs.key === node2.attrs.key;
}

// Update only the attributes that changed
function updateAttributes(element, oldAttrs, newAttrs) {
    if (!(element instanceof Element)) {
        return;
    }

    const oldAttrsMap = oldAttrs || {};
    const newAttrsMap = newAttrs || {};

    // Remove attributes that are not in the new vnode
    Object.keys(oldAttrsMap).forEach(attr => {
        if (attr === 'key') return;

        if (attr in newAttrsMap) return;

        if (attr.startsWith('on')) {
            element[attr.toLowerCase()] = null;
        }
        else if (attr === 'style') {
            element.style = '';
        }
        else if (attr === 'class' || attr.startsWith('data-')) {
            element.removeAttribute(attr);
        }
        else {
            try {
                element[attr] = undefined;
            } catch (e) {
                element.removeAttribute(attr);
            }
        }
    });

    // Set new or changed attributes
    Object.entries(newAttrsMap).forEach(([attr, value]) => {
        // Skip the key attribute
        if (attr === 'key') return;

        const oldValue = oldAttrsMap[attr];

        // Skip if the attribute hasn't changed
        if (oldValue === value) {
            return;
        }

        if (attr.startsWith('on') && typeof value === 'function') {
            element[attr.toLowerCase()] = value;
        }
        else if (attr === 'class' || attr.startsWith('data-')) {
            element.setAttribute(attr, value);
        }
        else if (attr === 'style' && typeof value === 'object') {
            element.style = '';
            Object.entries(value).forEach(([styleKey, styleValue]) => {
                element.style[styleKey] = styleValue;
            });
        }
        else {
            try {
                element[attr] = value;
            } catch (e) {
                element.setAttribute(attr, value);
            }
        }
    });
}

export { diff }