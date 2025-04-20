function component(componentFn, props = {}) {
    return {
        _isComponent: true,
        component: componentFn,
        props: props
    };
}

export { component }