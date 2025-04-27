export function TodoHeader({ addTodo }) {
    const handleSubmit = (e) => {
        if (e.key === "Enter") {
            const value = e.target.value.trim();
            if (value.length > 2) {
                addTodo(value);
                e.target.value = '';
            }
        }
    };

    return {
        tag: 'header',
        attrs: {
            class: 'header',
            'data-testid': 'header'
        },
        children: [
            {
                tag: 'h1',
                attrs: {},
                children: ['todos']
            },
            {
                tag: 'div',
                attrs: {
                    class: 'input-container'
                },
                children: [
                    {
                        tag: 'input',
                        attrs: {
                            class: 'new-todo',
                            id: 'todo-input',
                            type: 'text',
                            autoFocus: true,
                            'data-testid': 'text-input',
                            placeholder: 'What needs to be done?',
                            onkeydown: handleSubmit,
                        },
                        children: []
                    },
                    {
                        tag: 'label',
                        attrs: {
                            class: 'visually-hidden',
                            htmlFor: 'todo-input'
                        },
                        children: ['New Todo Input']
                    }
                ]
            }
        ]
    };
}