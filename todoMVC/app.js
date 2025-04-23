import { render, useState, useEffect } from '../src/index.js';

// TodoItem component with key support
function TodoItem(props) {
    console.log("Rendering TodoItem:", props.id, props.text);
    return {
        tag: 'div',
        attrs: {
            class: 'card',
            key: `todo-${props.id}`,
            style: {
                marginBottom: '8px',
                padding: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }
        },
        children: [
            {
                tag: 'span',
                attrs: {
                    style: {
                        textDecoration: props.completed ? 'line-through' : 'none',
                        color: props.completed ? '#888' : '#000'
                    }
                },
                children: [props.text]
            },
            {
                tag: 'div',
                attrs: {},
                children: [
                    {
                        tag: 'button',
                        attrs: {
                            key: `complete-btn-${props.id}`,
                            class: props.completed ? 'btn btn-secondary' : 'btn btn-primary',
                            onClick: () => props.onToggle(props.id),
                            style: { marginRight: '5px' }
                        },
                        children: [props.completed ? 'Undo' : 'Complete']
                    },
                    {
                        tag: 'button',
                        attrs: {
                            key: `delete-btn-${props.id}`,
                            class: 'btn btn-secondary',
                            onClick: () => props.onDelete(props.id)
                        },
                        children: ['Delete']
                    }
                ]
            }
        ]
    };
}

// TodoList component with proper keys
function TodoList() {
    console.log("Rendering TodoList");

    const [todos, setTodos] = useState([
        { id: 1, text: 'Learn the framework', completed: true },
        { id: 2, text: 'Build a todo app', completed: false },
        { id: 3, text: 'Add state management', completed: false }
    ]);

    const [newTodo, setNewTodo] = useState('');

    // Add a new todo
    const addTodo = () => {
        console.log("Add todo triggered with value:", newTodo);
        if (newTodo.trim() === '') {
            console.log("Empty todo, not adding");
            return;
        }

        const newId = todos.length > 0
            ? Math.max(...todos.map(todo => todo.id)) + 1
            : 1;

        console.log("Current todos:", todos);
        console.log("Adding new todo with ID:", newId);

        setTodos([...todos, { id: newId, text: newTodo, completed: false }]);
        console.log("Todos updated, now setting newTodo to empty");
        setNewTodo('');
    };

    // Toggle todo completion status
    const toggleTodo = (id) => {
        console.log("Toggling todo:", id);
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    // Delete a todo
    const deleteTodo = (id) => {
        console.log("Deleting todo:", id);
        setTodos(todos.filter(todo => todo.id !== id));
    };

    // Handle input change
    const handleInputChange = (e) => {
        console.log("Input value changed:", e.target.value);
        setNewTodo(e.target.value);
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            console.log("Enter key pressed, adding todo");
            addTodo();
        }
    };

    // Monitor state changes
    useEffect(() => {
        console.log("Todos state changed:", todos);
    }, [todos]);

    useEffect(() => {
        console.log("newTodo state changed:", newTodo);
    }, [newTodo]);

    return {
        tag: 'div',
        attrs: { class: 'card', key: 'todo-list-container' },
        children: [
            {
                tag: 'h3',
                attrs: { class: 'card-title', key: 'todo-list-title' },
                children: ['Todo List']
            },
            {
                tag: 'div',
                attrs: { style: { marginBottom: '15px' }, key: 'todo-input-container' },
                children: [
                    {
                        tag: 'div',
                        attrs: { style: { display: 'flex', gap: '10px' }, key: 'todo-input-row' },
                        children: [
                            {
                                tag: 'input',
                                attrs: {
                                    key: 'todo-input',
                                    type: 'text',
                                    value: newTodo,
                                    onInput: handleInputChange,
                                    onKeyPress: handleKeyPress,
                                    placeholder: 'Add a new todo',
                                    style: {
                                        flex: 1,
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc'
                                    }
                                },
                                children: []
                            },
                            {
                                tag: 'button',
                                attrs: {
                                    key: 'add-todo-button',
                                    class: 'btn btn-primary',
                                    onClick: addTodo
                                },
                                children: ['Add Todo']
                            }
                        ]
                    }
                ]
            },
            {
                tag: 'div',
                attrs: { key: 'todo-items-container' },
                children: todos.length === 0
                    ? [{
                        tag: 'div',
                        attrs: { class: 'alert alert-info', key: 'no-todos-message' },
                        children: ['No todos yet! Add one to get started.']
                    }]
                    : todos.map(todo => ({
                        component: TodoItem,
                        props: {
                            id: todo.id,
                            text: todo.text,
                            completed: todo.completed,
                            onToggle: toggleTodo,
                            onDelete: deleteTodo,
                            key: `todo-item-${todo.id}`
                        }
                    }))
            },
            {
                tag: 'div',
                attrs: { style: { marginTop: '15px' }, key: 'todo-summary' },
                children: [
                    {
                        tag: 'p',
                        attrs: { key: 'todo-count' },
                        children: [`${todos.filter(t => t.completed).length} of ${todos.length} tasks completed`]
                    }
                ]
            }
        ]
    };
}

// App component
function App() {
    console.log("Rendering App");
    return {
        tag: 'div',
        attrs: { class: 'app', key: 'app-root' },
        children: [
            {
                tag: 'h1',
                attrs: { key: 'app-title' },
                children: ['Todo List Example']
            },
            {
                tag: 'div',
                attrs: { class: 'alert alert-info', key: 'app-info' },
                children: ['This example demonstrates reconciliation with debug logs.']
            },
            {
                component: TodoList,
                props: { key: 'todo-list-component' }
            }
        ]
    };
}

// Render the app
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, rendering app");
    render(App, document.getElementById('app'));
});