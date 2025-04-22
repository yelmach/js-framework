import { rerender } from "./component.js";

// State management
const states = [];
let stateIndex = 0;

// Effect management
const effectDependencies = [];
const effectCleanups = [];
let effectIndex = 0;

// Ref management
const refs = [];
let refIndex = 0;

let isFirstRender = true;
const pendingEffects = [];

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

function useEffect(callback, dependencies) {
    const currentIndex = effectIndex;
    const prevDependencies = effectDependencies[currentIndex];

    let shouldRunEffect = false;

    if (!dependencies) {
        shouldRunEffect = true;
    } else if (!prevDependencies) {
        shouldRunEffect = true;
    } else if (dependencies.length !== prevDependencies.length) {
        shouldRunEffect = true;
    } else {
        shouldRunEffect = dependencies.some((dep, i) => !Object.is(dep, prevDependencies[i]));
    }

    if (dependencies && dependencies.length === 0) {
        shouldRunEffect = prevDependencies === undefined;
    }

    if (shouldRunEffect) {
        pendingEffects.push(() => {
            if (typeof effectCleanups[currentIndex] === 'function') {
                effectCleanups[currentIndex]();
            }

            const cleanup = callback();
            effectCleanups[currentIndex] = typeof cleanup === 'function' ? cleanup : undefined;
        });
    }

    effectDependencies[currentIndex] = dependencies;
    effectIndex++;
}

// useRef hook implementation
function useRef(initialValue) {
    const currentIndex = refIndex;

    if (refs[currentIndex] === undefined) {
        refs[currentIndex] = { current: initialValue };
    }

    refIndex++;
    return refs[currentIndex];
}

function resetHookIndex() {
    stateIndex = 0;
    effectIndex = 0;
    refIndex = 0;
}

function runEffects() {
    pendingEffects.forEach(effect => effect());
    pendingEffects.length = 0;

    isFirstRender = false;
}

function cleanupEffects() {
    effectCleanups.forEach(cleanup => {
        if (typeof cleanup === 'function') {
            cleanup();
        }
    });

    states.length = 0;
    effectCleanups.length = 0;
    effectDependencies.length = 0;
    refs.length = 0;
    pendingEffects.length = 0;

    resetHookIndex();

    isFirstRender = true;
}

export {
    useState,
    useEffect,
    useRef,
    resetHookIndex,
    runEffects,
    cleanupEffects
};