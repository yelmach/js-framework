import { rerender } from "./vdom.js";

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

// Effect queue for asynchronous execution
const pendingEffects = [];
let isFirstRender = true;

function useState(initialValue) {
    const currentIndex = stateIndex;

    if (states[currentIndex] === undefined) {
        states[currentIndex] = initialValue;
    }

    const currentState = states[currentIndex];

    const setState = (newValue) => {
        const updatedValue = typeof newValue === 'function'
            ? newValue(states[currentIndex])
            : newValue;

        if (states[currentIndex] !== updatedValue) {
            states[currentIndex] = updatedValue;
            rerender();
        }
    };

    stateIndex++;
    return [currentState, setState];
}

function useEffect(callback, dependencies) {
    const currentIndex = effectIndex;
    const prevDependencies = effectDependencies[currentIndex];

    let shouldRunEffect = false;

    // Always run if no dependencies array is provided (runs on every render)
    if (dependencies === undefined) {
        shouldRunEffect = true;
    }
    // First render, always run
    else if (prevDependencies === undefined) {
        shouldRunEffect = true;
    }
    // Empty dependencies array means run once (on mount)
    else if (dependencies.length === 0 && prevDependencies.length === 0) {
        shouldRunEffect = isFirstRender || prevDependencies === undefined;
    }
    // Different dependency array length
    else if (dependencies.length !== prevDependencies.length) {
        shouldRunEffect = true;
    } else {
        shouldRunEffect = dependencies.some((dep, i) => !Object.is(dep, prevDependencies[i]));
    }

    if (shouldRunEffect) {
        pendingEffects.push(() => {
            // Clean up previous effect if exists
            if (typeof effectCleanups[currentIndex] === 'function') {
                effectCleanups[currentIndex]();
            }

            // Run the effect and store any cleanup function
            const cleanup = callback();

            // Store cleanup function for next time
            effectCleanups[currentIndex] = typeof cleanup === 'function' ? cleanup : undefined;
        });
    }

    // Store dependencies for next comparison
    effectDependencies[currentIndex] = dependencies;
    effectIndex++;
}

function useRef(initialValue) {
    const currentIndex = refIndex;

    // Create ref object if it doesn't exist
    if (refs[currentIndex] === undefined) {
        refs[currentIndex] = { current: initialValue };
    }

    refIndex++;
    return refs[currentIndex];
}

// Reset hook indices for next render
function resetHookIndex() {
    stateIndex = 0;
    effectIndex = 0;
    refIndex = 0;
}

function runEffects() {
    // Make a copy to avoid issues if new effects are added during execution
    const effectsToRun = [...pendingEffects];
    pendingEffects.length = 0;

    // Run all effects
    effectsToRun.forEach(effect => effect());

    isFirstRender = false;
}

// Clean up all effects and state
function cleanupEffects() {
    effectCleanups.forEach(cleanup => {
        if (typeof cleanup === 'function') {
            cleanup();
        }
    });

    // Reset all state
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