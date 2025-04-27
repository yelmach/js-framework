import { render, useState, useEffect } from '../src/index.js';

// Unique ID generator for todos
const generateId = () => Math.random().toString(36).substr(2, 9);

// Filter constants
const FILTERS = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed'
};

// localStorage key for todos
const STORAGE_KEY = 'todos-custom-framework';

// Main TodoApp component
function TodoApp() {
    // State hooks
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [filter, setFilter] = useState(FILTERS.ALL);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    // Load todos from localStorage on initial render
    useEffect(() => {
        const storedTodos = localStorage.getItem(STORAGE_KEY);
        if (storedTodos) {
            setTodos(JSON.parse(storedTodos));
        }
    }, []);

    // Save todos to localStorage when they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }, [todos]);

    // Set up routing based on hash changes
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '') || FILTERS.ALL;
            if (Object.values(FILTERS).includes(hash)) {
                setFilter(hash);
            }
        };

        // Initial filter from URL
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Cleanup
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // Handler for adding a new todo
    const handleNewTodoSubmit = (e) => {
        e.preventDefault();
        const text = newTodo.trim();

        if (text) {
            setTodos([...todos, {
                id: generateId(),
                text,
                completed: false
            }]);
            setNewTodo('');
        }
    };

    // Handler for toggling a todo's completed state
    const handleToggle = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    // Handler for toggling all todos' completed state
    const handleToggleAll = (e) => {
        const completed = e.target.checked;
        setTodos(todos.map(todo => ({ ...todo, completed })));
    };

    // Handler for deleting a todo
    const handleDelete = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    // Handler for starting edit mode
    const handleDoubleClick = (todo) => {
        setEditingId(todo.id);
        setEditText(todo.text);
    };

    // Handler for saving an edited todo
    const handleSave = (id) => {
        const text = editText.trim();

        if (text) {
            setTodos(todos.map(todo =>
                todo.id === id ? { ...todo, text } : todo
            ));
        } else {
            handleDelete(id);
        }

        setEditingId(null);
    };

    // Handler for clearing completed todos
    const handleClearCompleted = () => {
        setTodos(todos.filter(todo => !todo.completed));
    };

    // Filter todos based on current filter
    const filteredTodos = todos.filter(todo => {
        switch (filter) {
            case FILTERS.ACTIVE:
                return !todo.completed;
            case FILTERS.COMPLETED:
                return todo.completed;
            default:
                return true;
        }
    });

    // Count active (uncompleted) todos
    const activeTodoCount = todos.filter(todo => !todo.completed).length;
    const completedCount = todos.length - activeTodoCount;
    const allCompleted = todos.length > 0 && activeTodoCount === 0;

    // TodoItem component
    const TodoItem = (props) => {
        const { todo } = props;
        const isEditing = todo.id === editingId;
        const className = `${todo.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}`;

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                handleSave(todo.id);
            } else if (e.key === 'Escape') {
                setEditingId(null);
                setEditText(todo.text);
            }
        };

        return {
            tag: 'li',
            attrs: {
                class: className,
                key: todo.id
            },
            children: [
                {
                    tag: 'div',
                    attrs: {
                        class: 'view'
                    },
                    children: [
                        {
                            tag: 'input',
                            attrs: {
                                class: 'toggle',
                                type: 'checkbox',
                                checked: todo.completed,
                                onChange: () => handleToggle(todo.id)
                            },
                            children: []
                        },
                        {
                            tag: 'label',
                            attrs: {
                                onDblClick: () => handleDoubleClick(todo)
                            },
                            children: [todo.text]
                        },
                        {
                            tag: 'button',
                            attrs: {
                                class: 'destroy',
                                onClick: () => handleDelete(todo.id)
                            },
                            children: []
                        }
                    ]
                },
                isEditing ? {
                    tag: 'input',
                    attrs: {
                        class: 'edit',
                        value: editText,
                        onInput: (e) => setEditText(e.target.value),
                        onBlur: () => handleSave(todo.id),
                        onKeyDown: handleKeyDown,
                        autoFocus: true
                    },
                    children: []
                } : null
            ]
        };
    };

    // Main todo application structure
    return {
        tag: 'div',
        attrs: {},
        children: [
            {
                tag: 'section',
                attrs: {
                    class: 'todoapp'
                },
                children: [
                    // Header section
                    {
                        tag: 'header',
                        attrs: {
                            class: 'header'
                        },
                        children: [
                            {
                                tag: 'h1',
                                attrs: {},
                                children: ['todos']
                            },
                            {
                                tag: 'form',
                                attrs: {
                                    onSubmit: handleNewTodoSubmit
                                },
                                children: [
                                    {
                                        tag: 'input',
                                        attrs: {
                                            class: 'new-todo',
                                            placeholder: 'What needs to be done?',
                                            value: newTodo,
                                            onInput: (e) => setNewTodo(e.target.value),
                                            autoFocus: true
                                        },
                                        children: []
                                    }
                                ]
                            }
                        ]
                    },

                    // Main section (only show if there are todos)
                    todos.length > 0 ? {
                        tag: 'section',
                        attrs: {
                            class: 'main'
                        },
                        children: [
                            {
                                tag: 'input',
                                attrs: {
                                    id: 'toggle-all',
                                    class: 'toggle-all',
                                    type: 'checkbox',
                                    checked: allCompleted,
                                    onChange: handleToggleAll
                                },
                                children: []
                            },
                            {
                                tag: 'label',
                                attrs: {
                                    for: 'toggle-all'
                                },
                                children: ['Mark all as complete']
                            },
                            {
                                tag: 'ul',
                                attrs: {
                                    class: 'todo-list'
                                },
                                children: filteredTodos.map(todo => ({
                                    component: TodoItem,
                                    props: {
                                        todo,
                                        key: todo.id
                                    }
                                }))
                            }
                        ]
                    } : null,

                    // Footer (only show if there are todos)
                    todos.length > 0 ? {
                        tag: 'footer',
                        attrs: {
                            class: 'footer'
                        },
                        children: [
                            {
                                tag: 'span',
                                attrs: {
                                    class: 'todo-count'
                                },
                                children: [
                                    {
                                        tag: 'strong',
                                        attrs: {},
                                        children: [activeTodoCount.toString()]
                                    },
                                    ` item${activeTodoCount !== 1 ? 's' : ''} left`
                                ]
                            },
                            {
                                tag: 'ul',
                                attrs: {
                                    class: 'filters'
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
                                                    class: filter === FILTERS.ALL ? 'selected' : ''
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
                                                    class: filter === FILTERS.ACTIVE ? 'selected' : ''
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
                                                    class: filter === FILTERS.COMPLETED ? 'selected' : ''
                                                },
                                                children: ['Completed']
                                            }
                                        ]
                                    }
                                ]
                            },
                            completedCount > 0 ? {
                                tag: 'button',
                                attrs: {
                                    class: 'clear-completed',
                                    onClick: handleClearCompleted
                                },
                                children: ['Clear completed']
                            } : null
                        ]
                    } : null
                ]
            },
            {
                tag: 'footer',
                attrs: {
                    class: 'info'
                },
                children: [
                    {
                        tag: 'p',
                        attrs: {},
                        children: ['Double-click to edit a todo']
                    },
                    {
                        tag: 'p',
                        attrs: {},
                        children: [
                            'Created with ',
                            {
                                tag: 'a',
                                attrs: {
                                    href: '#'
                                },
                                children: ['Custom Framework']
                            }
                        ]
                    },
                    {
                        tag: 'p',
                        attrs: {},
                        children: [
                            'Part of ',
                            {
                                tag: 'a',
                                attrs: {
                                    href: 'http://todomvc.com'
                                },
                                children: ['TodoMVC']
                            }
                        ]
                    }
                ]
            }
        ]
    };
}

// Render the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    render(TodoApp, document.getElementById('app'));
});