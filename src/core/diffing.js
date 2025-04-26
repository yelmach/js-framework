import { createElement } from "./vdom.js";

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
    oldVNode = oldVNode ? resolveComponentNode(oldVNode) : null;
    newVNode = resolveComponentNode(newVNode);

    // Case 2: New node but no old node (append)
    if (!oldVNode) {
        parentDom.appendChild(createElement(newVNode));
        return;
    }

    const domNode = parentDom.childNodes[index];
    if (!domNode) {
        parentDom.appendChild(createElement(newVNode));
        return;
    }

    // Case 3: Both nodes are text nodes
    if (isTextNode(oldVNode) && isTextNode(newVNode)) {
        if (oldVNode !== newVNode) {
            domNode.nodeValue = newVNode.toString();
        }
        return;
    }

    // Case 4: Different node types (replace)
    if (!isSameNodeType(oldVNode, newVNode)) {
        const newDomNode = createElement(newVNode);
        parentDom.replaceChild(newDomNode, domNode);
        return;
    }

    // Case 5: Same element type - update attributes and children
    updateAttributes(domNode, oldVNode.attrs, newVNode.attrs);

    // Use improved diffChildren function
    diffChildren(domNode, oldVNode.children || [], newVNode.children || []);
}

function diffChildren(parentDom, oldChildren, newChildren) {
    // empty arrays
    if (oldChildren.length === 0 && newChildren.length === 0) {
        return;
    }

    if (newChildren.length === 0) {
        parentDom.innerHTML = '';
        return;
    }

    if (oldChildren.length === 0) {
        newChildren.forEach(child => {
            parentDom.appendChild(createElement(child));
        });
        return;
    }

    oldChildren = oldChildren.map(child => resolveComponentNode(child));
    newChildren = newChildren.map(child => resolveComponentNode(child));

    // Check if we need to handle keys
    const hasKeys = oldChildren.some(c => c?.attrs?.key) ||
        newChildren.some(c => c?.attrs?.key);

    // Simple case: no keys, diff by index
    if (!hasKeys) {
        for (let i = 0; i < Math.max(oldChildren.length, newChildren.length); i++) {
            diff(parentDom, oldChildren[i], newChildren[i], i);
        }
        return;
    }

    // Create a map of keyed old children
    const oldKeyedMap = new Map();
    const oldChildDomNodes = Array.from(parentDom.childNodes);

    for (let i = 0; i < oldChildren.length; i++) {
        const key = oldChildren[i]?.attrs?.key;
        if (key !== undefined && i < oldChildDomNodes.length) {
            oldKeyedMap.set(key, {
                vnode: oldChildren[i],
                domNode: oldChildDomNodes[i],
                index: i
            });
        }
    }

    // Track used DOM nodes to determine which ones to remove later
    const usedNodes = new Set();

    // Process new children in the order they are defined
    let currentIndex = 0;

    for (let i = 0; i < newChildren.length; i++) {
        const newChild = newChildren[i];
        const key = newChild?.attrs?.key;

        // If this child has a key and we have a matching old node
        if (key !== undefined && oldKeyedMap.has(key)) {
            const { vnode: oldChild, domNode: oldDomNode } = oldKeyedMap.get(key);

            // Mark this node as used
            usedNodes.add(oldDomNode);

            // Update the node
            updateAttributes(oldDomNode, oldChild.attrs, newChild.attrs);

            // Recursively update children
            diffChildren(oldDomNode, oldChild.children || [], newChild.children || []);

            // Move this node to the current position if needed
            const currentDomNode = parentDom.childNodes[currentIndex];
            if (currentDomNode !== oldDomNode) {
                parentDom.insertBefore(oldDomNode, currentDomNode || null);
            }
        }
        // No key or no matching old node, create a new one
        else {
            const newDomNode = createElement(newChild);

            // Insert at the current position
            if (currentIndex < parentDom.childNodes.length) {
                parentDom.insertBefore(newDomNode, parentDom.childNodes[currentIndex]);
            } else {
                parentDom.appendChild(newDomNode);
            }
        }

        currentIndex++;
    }

    // Remove any unused DOM nodes
    for (const domNode of oldChildDomNodes) {
        if (!usedNodes.has(domNode) && domNode.parentNode === parentDom) {
            parentDom.removeChild(domNode);
        }
    }
}

// The rest of the helper functions remain unchanged
function resolveComponentNode(vnode) {
    if (!vnode) return null;

    if (vnode.component) {
        const result = vnode.component(vnode.props || {});

        // Preserve the key from component props if the result doesn't have one
        if (vnode.props && vnode.props.key && result && result.attrs) {
            if (!result.attrs.key) {
                result.attrs.key = vnode.props.key;
            }
        }

        return result;
    }
    return vnode;
}

function isTextNode(node) {
    return typeof node === 'string' || typeof node === 'number';
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
            const oldStyle = oldAttrsMap.style || {};
            const newStyle = value;

            // Remove style properties that no longer exist
            Object.keys(oldStyle).forEach(styleProp => {
                if (newStyle[styleProp] === undefined) {
                    element.style[styleProp] = '';
                }
            });

            // Set new or changed style properties
            Object.entries(newStyle).forEach(([styleProp, styleValue]) => {
                if (oldStyle[styleProp] !== styleValue) {
                    element.style[styleProp] = styleValue;
                }
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