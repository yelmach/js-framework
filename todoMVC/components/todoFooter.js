import { FILTERS } from "../app.js";

export function TodoFooter({ todos, filter, clearCompleted }) {
    const activeTodoCount = todos.filter(todo => !todo.completed).length;

    return {
        tag: 'footer',
        attrs: {
            class: 'footer',
            "data-testid": "footer"
        },
        children: [
            {
                tag: 'span',
                attrs: {
                    class: 'todo-count'
                },
                children: [
                    `${activeTodoCount.toString()} item${activeTodoCount !== 1 ? 's' : ''} left`
                ]
            },
            {
                tag: 'ul',
                attrs: {
                    class: 'filters',
                    "data-testid": "footer-navigation"
                },
                children: [
                    {
                        tag: 'li',
                        attrs: {},
                        children: [
                            {
                                tag: 'a',
                                attrs: {
                                    href: '#/',
                                    class: filter === FILTERS.ALL ? 'selected' : '',
                                },
                                children: ['All']
                            }
                        ]
                    },
                    {
                        tag: 'li',
                        attrs: {},
                        children: [
                            {
                                tag: 'a',
                                attrs: {
                                    href: '#/active',
                                    class: filter === FILTERS.ACTIVE ? 'selected' : '',
                                },
                                children: ['Active']
                            }
                        ]
                    },
                    {
                        tag: 'li',
                        attrs: {},
                        children: [
                            {
                                tag: 'a',
                                attrs: {
                                    href: '#/completed',
                                    class: filter === FILTERS.COMPLETED ? 'selected' : '',
                                },
                                children: ['Completed']
                            }
                        ]
                    }
                ]
            },
            {
                tag: 'button',
                attrs: {
                    class: 'clear-completed',
                    onClick: clearCompleted,
                    disabled: activeTodoCount === todos.length,
                },
                children: ['Clear completed']
            }
        ]
    };
}
