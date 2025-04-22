import { rerender } from "./component.js";

const states = [];
let stateIndex = 0;

function useState(initialValue) {
    const currentIndex = stateIndex;
    states[currentIndex] = states[currentIndex] !== undefined ? states[currentIndex] : initialValue;

    function setState(newValue) {
        const updatedValue = typeof newValue === 'function'
            ? newValue(states[currentIndex])
            : newValue;

        if (states[currentIndex] !== updatedValue) {
            states[currentIndex] = updatedValue;
            rerender();
        }
    }

    stateIndex++;

    return [states[currentIndex], setState];
}

function resetHookIndex() {
    stateIndex = 0;
}

export { useState, resetHookIndex };