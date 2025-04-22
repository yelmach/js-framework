import { render, useState } from '../src/index.js';

// TodoItem component
function TodoItem(props) {
    return {
        tag: 'div',
        attrs: { 
            class: 'card',
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
                            class: props.completed ? 'btn btn-secondary' : 'btn btn-primary',
                            onClick: () => props.onToggle(props.id),
                            style: { marginRight: '5px' }
                        },
                        children: [props.completed ? 'Undo' : 'Complete']
                    },
                    {
                        tag: 'button',
                        attrs: {
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

// TodoList component with state
function TodoList() {
    const [todos, setTodos] = useState([
        { id: 1, text: 'Learn the framework', completed: true },
        { id: 2, text: 'Build a todo app', completed: false },
        { id: 3, text: 'Add state management', completed: false }
    ]);
    
    const [newTodo, setNewTodo] = useState('');
    
    // Add a new todo
    const addTodo = () => {
        if (newTodo.trim() === '') return;
        
        const newId = todos.length > 0 
            ? Math.max(...todos.map(todo => todo.id)) + 1 
            : 1;
            
        setTodos([...todos, { id: newId, text: newTodo, completed: false }]);
        setNewTodo('');
    };
    
    // Toggle todo completion status
    const toggleTodo = (id) => {
        setTodos(todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };
    
    // Delete a todo
    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };
    
    // Handle input change
    const handleInputChange = (e) => {
        setNewTodo(e.target.value);
    };
    
    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    };
    
    return {
        tag: 'div',
        attrs: { class: 'card' },
        children: [
            {
                tag: 'h3',
                attrs: { class: 'card-title' },
                children: ['Todo List']
            },
            {
                tag: 'div',
                attrs: { style: { marginBottom: '15px' } },
                children: [
                    {
                        tag: 'div',
                        attrs: { style: { display: 'flex', gap: '10px' } },
                        children: [
                            {
                                tag: 'input',
                                attrs: {
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
                attrs: {},
                children: todos.length === 0 
                    ? [{
                        tag: 'div',
                        attrs: { class: 'alert alert-info' },
                        children: ['No todos yet! Add one to get started.']
                    }]
                    : todos.map(todo => ({
                        component: TodoItem,
                        props: {
                            id: todo.id,
                            text: todo.text,
                            completed: todo.completed,
                            onToggle: toggleTodo,
                            onDelete: deleteTodo
                        }
                    }))
            },
            {
                tag: 'div',
                attrs: { style: { marginTop: '15px' } },
                children: [
                    {
                        tag: 'p',
                        attrs: {},
                        children: [`${todos.filter(t => t.completed).length} of ${todos.length} tasks completed`]
                    }
                ]
            }
        ]
    };
}

// App component
function App() {
    return {
        tag: 'div',
        attrs: { class: 'app' },
        children: [
            {
                tag: 'h1',
                attrs: {},
                children: ['Todo List Example']
            },
            {
                tag: 'div',
                attrs: { class: 'alert alert-info' },
                children: ['This example demonstrates complex state management with arrays and objects.']
            },
            {
                component: TodoList,
                props: {}
            }
        ]
    };
}

// Render the app
document.addEventListener('DOMContentLoaded', () => {
    render(App, document.getElementById('app'));
});