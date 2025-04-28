import { render, useState, useEffect } from '../../src/index.js';
import { TodoHeader } from './components/todoHeader.js';
import { TodoList } from './components/todoList.js';
import { TodoFooter } from './components/todoFooter.js';

export const FILTERS = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed'
};

const generateId = () => Math.random().toString(36).substring(2, 9);

function TodoApp() {
    const [todos, setTodos] = useState([])
    const [filter, setFilter] = useState(FILTERS.ALL)

    // Set up routing based on hash changes
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '') || FILTERS.ALL;
            if (Object.values(FILTERS).includes(hash)) {
                console.log(`Hash changed to: ${hash}`);
                
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

    useEffect(() => {
        const hash = filter === FILTERS.ALL ? '' : filter;
        window.location.hash = hash ? `#/${hash}` : '#/';
    }, [filter]);

    const handleAddTodo = (text) => {
        setTodos([...todos, {
            id: generateId(),
            text,
            completed: false,
            editing: false
        }]);
    };

    const handleToggle = (id) => {
        setTodos(todos.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const handleToggleAll = (completed) => {
        setTodos(todos.map(todo => ({ ...todo, completed })));
    };

    const handleDeleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const handleToggleEditing = (id, editing) => {
        setTodos(todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, editing };
            }
            return todo;
        }));
    };

    const handleEditTodo = (id, text, editing = false) => {
        // First, make sure only one todo is in edit mode at a time
        setTodos(todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, text, editing };
            }
            // Ensure other todos are not in edit mode
            return { ...todo, editing: false };
        }));
    };

    const handleClearCompleted = () => {
        setTodos(todos.filter(todo => !todo.completed));
    };

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

    return {
        tag: 'fragment',
        attrs: {},
        children: [
            {
                tag: 'section',
                attrs: {
                    class: 'todoapp',
                    id: 'root'
                },
                children: [
                    {
                        component: TodoHeader,
                        props: {
                            addTodo: handleAddTodo
                        }
                    },
                    filteredTodos.length > 0 ? {
                        component: TodoList,
                        props: {
                            todos,
                            filteredTodos,
                            toggleTodo: handleToggle,
                            toggleAll: handleToggleAll,
                            deleteTodo: handleDeleteTodo,
                            editTodo: handleEditTodo,
                            toggleEditing: handleToggleEditing
                        }
                    } : null,
                    todos.length > 0 ? {
                        component: TodoFooter,
                        props: {
                            todos,
                            filter,
                            clearCompleted: handleClearCompleted
                        }
                    }: null
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
                        children: [
                            'Double-click to edit a todo'
                        ]
                    }
                ]
            } 
        ]
    }
}

document.addEventListener('DOMContentLoaded', () => {
    render(TodoApp, document.body);
});