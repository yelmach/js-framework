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

const effects = [];
let effectIndex = 0;

function useEffect(callback, dependencies) {
    const oldDependencies = effects[effectIndex];
    let hasChanged = true;

    if (oldDependencies) {
        hasChanged = dependencies.some((dep, i) => !Object.is(dep, oldDependencies[i]));
    }

    if (hasChanged) {
        callback();
    }

    effects[effectIndex] = dependencies;
    effectIndex++;
}

function resetHookIndex() {
    stateIndex = 0;
}

export { useState, resetHookIndex, useEffect };