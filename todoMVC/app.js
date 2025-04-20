import { render } from '../src/index.js';

const list = [
    { tag: 'li', children: ['Render virtual DOM to real DOM'] },
    { tag: 'li', children: ['Support for nested elements'] },
    { tag: 'li', children: ['CSS styling with objects'] },
    { tag: 'li', children: ['Event handling'] }
]

const vdom = {
    tag: 'div',
    attrs: { class: 'container' },
    children: [
        {
            tag: 'h1',
            attrs: { style: { color: '#333', marginBottom: "10px" } },
            children: ['Hello, Mini-Framework!']
        },
        {
            tag: 'p',
            attrs: {},
            children: [
                'This is a simple example using the ',
                {
                    tag: 'span',
                    attrs: { class: 'highlight' },
                    children: ['virtual DOM']
                },
                ' rendering system.'
            ]
        },
        {
            tag: 'div',
            attrs: { class: 'card name' },
            children: [
                {
                    tag: 'h3',
                    attrs: { "data-id": 55 },
                    children: ['Features:']
                },
                {
                    tag: 'ul',
                    attrs: {},
                    children: [
                        list
                    ]
                }
            ]
        },
        {
            tag: 'div',
            attrs: {
                style: {
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: '#eef6ff',
                    borderRadius: "4px",
                    border: '1px solid #cce5ff'
                }
            },
            children: ['Styled content with object-based styles']
        },
        {
            tag: 'button',
            attrs: {
                disabled: false,
                style: { marginTop: "20px" },
                onClick: () => alert('Button clicked!')
            },
            children: ['Click me']
        },
        {
            tag: 'div',
            attrs : {
                style: { backgroundColor: 'red', },
            },
            children : ['test test']
        }
    ]
};

render(vdom, document.getElementById('app'));