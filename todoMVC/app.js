import { render } from '../src/index.js';

// Button component
function Button(props) {
    const className = props.primary ? 'btn btn-primary' : 'btn btn-secondary';

    return {
        tag: 'button',
        attrs: {
            class: className,
            onClick: props.onClick || (() => { })
        },
        children: [props.text || 'Button']
    };
}

// Alert component
function Alert(props) {
    const className = `alert alert-${props.type || 'info'}`;

    return {
        tag: 'div',
        attrs: {
            class: className
        },
        children: [props.message]
    };
}

// Card component
function Card(props) {
    return {
        tag: 'div',
        attrs: {
            class: 'card'
        },
        children: [
            {
                tag: 'h3',
                attrs: { class: 'card-title' },
                children: [props.title]
            },
            {
                tag: 'div',
                attrs: { class: 'card-body' },
                children: props.children || []
            },
            // Footer with button
            props.buttonText ? {
                component: Button,
                props: {
                    text: props.buttonText,
                    primary: true,
                    onClick: props.ButtonClick
                }
            } : null
        ]
    };
}

function App() {
    const handleButtonClick = () => {
        alert('Button clicked!');
    };

    return {
        tag: 'div',
        attrs: { class: 'app' },
        children: [
            {
                tag: 'h1',
                attrs: {},
                children: ['Component System Example']
            },
            {
                component: Alert,
                props: {
                    type: 'denied',
                    message: 'Welcome to the component system example! this is denied'
                }
            },
            {
                component: Card,
                props: {
                    title: 'Card with Button',
                    buttonText: 'Click Mee',
                    ButtonClick: handleButtonClick,
                    children: [
                        'This card has a button component nested inside it.'
                    ]
                }
            },
            {
                component: Card,
                props: {
                    title: 'Card without Button',
                    children: [
                        'This card does not have a button.'
                    ]
                }
            },
            {
                tag: 'div',
                attrs: { style: { marginTop: "20px" } },
                children: [
                    {
                        component: Button,
                        props: {
                            text: 'Primary Button',
                            primary: true,
                            onClick: () => alert('Primary button clicked!')
                        }
                    },
                    {
                        component: Button,
                        props: {
                            text: 'Secondary Button',
                            onClick: () => alert('Secondary button clicked!')
                        }
                    },
                ]
            },
            {
                component: Card,
                props: {
                    title: 'Nested Components',
                    children: [
                        {
                            component: Alert,
                            props: {
                                type: 'success',
                                message: 'Components can be nested within each other!'
                            }
                        }
                    ]
                }
            }
        ]
    };
}

render(App, document.getElementById('app'));