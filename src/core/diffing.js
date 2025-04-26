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

    // Create a map of the existing keyed nodes for quick lookup
    const keysOldDom = new Map();
    const currentDomNodes = Array.from(parentDom.childNodes);

    // Map keys to their corresponding old vnodes and DOM nodes
    oldChildren.forEach((child, i) => {
        const key = child?.attrs?.key;
        if (key && i < currentDomNodes.length) {
            keysOldDom.set(key, {
                vnode: child,
                dom: currentDomNodes[i]
            });
        }
    });

    // Track which DOM nodes we've used
    const usedNodes = new Set();
    let currentIndex = 0;

    // Process each new child in order
    newChildren.forEach(newChild => {
        const key = newChild?.attrs?.key;
        const oldChild = key && keysOldDom.get(key);

        if (oldChild) {
            // Update and reposition existing node
            const { vnode: oldVNode, dom: oldDom } = oldChild;

            // Mark as used
            usedNodes.add(oldDom);

            // Update the node and its children
            updateAttributes(oldDom, oldVNode.attrs, newChild.attrs);
            diffChildren(oldDom, oldVNode.children || [], newChild.children || []);

            // Move if needed (to maintain order)
            const currentPosition = parentDom.childNodes[currentIndex];
            if (currentPosition !== oldDom) {
                parentDom.insertBefore(oldDom, currentPosition || null);
            }
        } else {
            // Create and insert new node
            const newDom = createElement(newChild);
            parentDom.insertBefore(newDom, parentDom.childNodes[currentIndex] || null);
        }

        currentIndex++;
    });

    // Remove any unused nodes
    currentDomNodes.forEach(domNode => {
        if (!usedNodes.has(domNode) && domNode.parentNode === parentDom) {
            parentDom.removeChild(domNode);
        }
    });
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