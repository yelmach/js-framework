import { render, useState } from '../src/index.js';

// KeyedItem component
function KeyedItem(props) {
    console.log("Rendering KeyedItem:", props.id);
    return {
        tag: 'div',
        attrs: {
            class: 'card',
            key: `item-${props.id}`,
            style: {
                marginBottom: '8px',
                padding: '15px',
                backgroundColor: props.color || '#f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }
        },
        children: [
            {
                tag: 'input',
                attrs: {
                    type: 'text',
                    value: props.text,
                    placeholder: 'Type here...',
                    style: {
                        padding: '5px',
                        marginRight: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    },
                    // This will help demonstrate that element state is preserved
                    onInput: (e) => console.log(`Input from item ${props.id}: ${e.target.value}`)
                },
                children: []
            },
            {
                tag: 'div',
                attrs: {},
                children: [`Item ${props.id}`]
            }
        ]
    };
}

// Main test component
function KeyedListTest() {
    console.log("Rendering KeyedListTest");

    const [items, setItems] = useState([
        { id: 1, text: 'First Item', color: '#ffdddd' },
        { id: 2, text: 'Second Item', color: '#ddffdd' },
        { id: 3, text: 'Third Item', color: '#ddddff' }
    ]);

    // Reverse the order of items
    const reverseItems = () => {
        console.log("Reversing items");
        setItems([...items].reverse());
    };

    // Move the first item to the end
    const moveFirstToEnd = () => {
        console.log("Moving first item to end");
        const newItems = [...items];
        const first = newItems.shift();
        newItems.push(first);
        setItems(newItems);
    };

    // Shuffle the items randomly
    const shuffleItems = () => {
        console.log("Shuffling items");
        const newItems = [...items];
        for (let i = newItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newItems[i], newItems[j]] = [newItems[j], newItems[i]];
        }
        setItems(newItems);
    };

    // Add a new item
    const addItem = () => {
        console.log("Adding new item");
        const newId = items.length > 0
            ? Math.max(...items.map(item => item.id)) + 1
            : 1;

        const colors = ['#ffdddd', '#ddffdd', '#ddddff', '#ffffdd', '#ffddff', '#ddffff'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        setItems([...items, {
            id: newId,
            text: `New Item ${newId}`,
            color: randomColor
        }]);
    };

    // Remove the last item
    const removeLastItem = () => {
        if (items.length > 0) {
            console.log("Removing last item");
            const newItems = [...items];
            newItems.pop();
            setItems(newItems);
        }
    };

    return {
        tag: 'div',
        attrs: { class: 'app', style: { padding: '20px' } },
        children: [
            {
                tag: 'h2',
                attrs: {},
                children: ['Keyed Items Test']
            },
            {
                tag: 'div',
                attrs: { class: 'alert alert-info' },
                children: [
                    'This example demonstrates proper diffing with keyed elements.',
                    {
                        tag: 'br',
                        attrs: {},
                        children: []
                    },
                    'Type in the text inputs, then use the buttons to reorder items. Your input should stay with each item.'
                ]
            },
            {
                tag: 'div',
                attrs: { style: { marginBottom: '20px', marginTop: '20px' } },
                children: [
                    {
                        tag: 'button',
                        attrs: {
                            class: 'btn btn-primary',
                            onClick: reverseItems,
                            style: { marginRight: '10px' }
                        },
                        children: ['Reverse Items']
                    },
                    {
                        tag: 'button',
                        attrs: {
                            class: 'btn btn-primary',
                            onClick: moveFirstToEnd,
                            style: { marginRight: '10px' }
                        },
                        children: ['Move First to End']
                    },
                    {
                        tag: 'button',
                        attrs: {
                            class: 'btn btn-primary',
                            onClick: shuffleItems,
                            style: { marginRight: '10px' }
                        },
                        children: ['Shuffle Items']
                    },
                    {
                        tag: 'button',
                        attrs: {
                            class: 'btn btn-primary',
                            onClick: addItem,
                            style: { marginRight: '10px' }
                        },
                        children: ['Add Item']
                    },
                    {
                        tag: 'button',
                        attrs: {
                            class: 'btn btn-secondary',
                            onClick: removeLastItem
                        },
                        children: ['Remove Last Item']
                    }
                ]
            },
            {
                tag: 'div',
                attrs: { id: 'items-container' },
                children: items.map(item => ({
                    component: KeyedItem,
                    props: {
                        id: item.id,
                        text: item.text,
                        color: item.color,
                        key: `keyed-item-${item.id}`
                    }
                }))
            }
        ]
    };
}

// Render the app
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, rendering KeyedListTest");
    render(KeyedListTest, document.getElementById('app'));
});