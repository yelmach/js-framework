import { useState } from '../../src/index.js';

export function TodoList({ todos, filteredTodos, toggleTodo, toggleAll, deleteTodo, editTodo }) {
    const allCompleted = filteredTodos.length > 0 && filteredTodos.every(todo => todo.completed);

    return {
        tag: 'main',
        attrs: {
            class: 'main',
            'data-testid': 'main'
        },
        children: [
            todos.length > 0 && filteredTodos.length > 0 ? {
                tag: 'div',
                attrs: {
                    class: 'toggle-all-container'
                },
                children: [
                    {
                        tag: 'input',
                        attrs: {
                            class: 'toggle-all',
                            type: 'checkbox',
                            id: 'toggle-all',
                            "data-testid": "toggle-all",
                            checked: allCompleted,
                            onChange: (e) => toggleAll(e.target.checked)
                        },
                        children: ['Mark all as complete']
                    },
                    {
                        tag: 'label',
                        attrs: {
                            class: 'toggle-all-label',
                            for: 'toggle-all'
                        },
                        children: ['Toggle All Input']
                    }
                ]
            } : null,
            {
                tag: 'ul',
                attrs: {
                    class: 'todo-list',
                    'data-testid': 'todo-list'
                },
                children: filteredTodos.map(todo => ({
                    component: TodoItem,
                    props: {
                        key: todo.id,
                        todo,
                        toggleTodo,
                        deleteTodo,
                        editTodo
                    }
                }))
            },
            {
                tag: 'input',
                attrs: {
                    id: 'toggle-all',
                    class: 'toggle-all',
                    type: 'checkbox',
                    checked: allCompleted,
                    onChange: (e) => toggleAll(e.target.checked)
                },
                children: []
            },
            {
                tag: 'label',
                attrs: {
                    for: 'toggle-all'
                },
                children: ['Mark all as complete']
            }
        ]
    };
}

function TodoItem({ todo, toggleTodo, deleteTodo, editTodo }) {
    const [isEditMode, setIsEditMode] = useState(false)

    const handleToggle = () => {
        toggleTodo(todo.id);
    };

    const handleDoubleClick = () => {
        setIsEditMode(true);
        setTimeout(() => {
            const input = document.querySelector('[data-testid="todo-item-edit-input"]');
            if (input) input.focus();
        }, 0);
    }

    const handleDelete = () => {
        deleteTodo(todo.id);
    };

    const handleBlur = () => {
        if (isEditMode) setIsEditMode(false);
    }

    const handleEdit = (e) => {
        if (e.key === "Enter") {
            const value = e.target.value.trim();
            if (value.length > 2) {
                editTodo(todo.id, value);
            }
        }
    };

    return {
        tag: 'li',
        attrs: {
            class: todo.completed ? 'completed' : '',
            'data-testid': 'todo-item'
        },
        children: [
            {
                tag: 'div',
                attrs: {
                    class: 'view'
                },
                children: isEditMode ? [
                    {
                        tag: 'div',
                        attrs: {
                            class: 'input-container',
                        },
                        children: [
                            {
                                tag: 'input',
                                attrs: {
                                    class: 'new-todo',
                                    id: 'todo-edit-input',
                                    type: 'text',
                                    "data-testid": "todo-item-edit-input",
                                    autoFocus: true,
                                    placeHolder: 'Edit todo',
                                    defaultValue: todo.text,
                                    value: todo.text,
                                    onBlur: handleBlur,
                                    onKeyDown: handleEdit,
                                },
                                children: []
                            },
                            {
                                tag: 'label',
                                attrs: {
                                    class: 'visually-hidden',
                                    for: 'todo-edit-input'
                                },
                                children: ['Edit Todo Input']
                            }
                        ]
                    }
                ] : [
                    {
                        tag: 'input',
                        attrs: {
                            class: 'toggle',
                            type: 'checkbox',
                            'data-testid': "todo-item-toggle",
                            checked: todo.completed,
                            onChange: handleToggle
                        },
                        children: []
                    },
                    {
                        tag: 'label',
                        attrs: {
                            "data-testid": "todo-item-label",
                            ondblclick: handleDoubleClick,
                        },
                        children: [todo.text]
                    },
                    {
                        tag: 'button',
                        attrs: {
                            class: 'destroy',
                            "data-testid": "todo-item-button",
                            onClick: handleDelete
                        },
                        children: []
                    }
                ]
            }
        ]
    };
}