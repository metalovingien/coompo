# Coompo
v1.1.1

`npm install`: Install required packages

`npm test`: Run unit tests

`npm run build` : Translate coompo.js into old-browsers-compatible JavaScript (output directory `dist/`)

## What is Coompo ?
Coompo is a JavaScript library helping building reactive web pages with a components system handling properties (props) and events.

## Create a component with `Coompo.Component`
Needs a `name` and a `props` and a `render` fields.

```javascript
const title = Coompo.Component({
    name: 'title',
    props: {
        text: { required: true }
    },
    render: (props) => `<h1>${ props.text }</h1>`
})
```

`name` is used to identify the component.

`props` contains the names and the default values of the props.

`render` is the function describing the HTML rendering of the component. We can include sub-components there.

Components are automatically re-rendered when their props are changed.

## Props : set a required or a default value

```javascript
props: {
    title: { required: true },
    author: { default: '(Unknown)' }
}
```

## Include and initialize a component with `of(props)`
```javascript
const section = Coompo.Component({
    /* ... */
    render: (props) =>

`<section>
    ${ title.of({ text: 'Title' }) }
    ${ paragraph.of({ text: 'First paragraph' }) }
    ${ paragraph.of({ text: 'Second paragraph' }) }
    ${ nextSectionButton.of() }
</section>`

})
```

## Launch Coompo with `Coompo.compose()`

### Prepare a placeholder in the HTML document with the `coompo-root` attribute...
```html
<body>
    <!-- ... -->
    <div coompo-root></div>
    <!-- ... -->
</body>
```

### ... then `compose()` in a script after linking `compo.js`
```javascript
Coompo.compose(myRootComponent)
```

## React to HTML events with the `on` field of a component
```javascript
const title = Coompo.Component({
    /* ... */
    on: {
        click: (props) => console.log(props)
    }
})
```

## The `propChange` event
The `propChange` event is triggered when a prop's value has changed. Its arguments are :

1. the prop's name
2. the new value of the prop
3. the old value of the prop


```javascript
const game = Coompo.Component({
    /* ... */
    props: {
        winner: { default: null }
    }
    on: {
        propChange: (prop, newValue, oldValue) =>
        {
            if (prop = 'winner')
            {
                console.log(`Now the winner is ${newValue} !`)
            }
        }
    }
})

```

## Custom events

### Emit a custom event with `Coompo.emit()`...
```javascript
const startButton = Coompo.Component({
    /* ... */
    on: {
        click: () => Coompo.emit('start')
    }
})
```

### ... then react to the event with `on[@event]` 
```javascript
const app = Coompo.Component({
    /* ... */
    on: {
        '@start': (props) => props.started = true
    }
})
```

### Pass data through the event...
```javascript
Coompo.emit('my-event', { dummy: 42 })
```

### ...then get the data
```javascript
on: {
    '@my-event': (props, data) => props.dummy = data.dummy
}
```

### Memoization with `memoKey`
Memoization allow faster re-rendering of components that are often rendered with the same props' values.

It is useful with complex components, when computing a key is faster than re-computing the rendering.

An in-memory map stores for each props configuration met the rendering expected.

The optional `memoKey` field of a component is a function used to compute the keys of such a map.

It has one argument : the components's props.

And it should return a simple value (`undefined` or `null` or a boolean or a number or a string).

```javascript
const cell = Coompo.Component({
    name: 'cell',
    props: {
        active: { required: true }
    },
    render: (props) => `<div class="cell ${ props.active ? 'active' : '' }"></div>`,
    memoKey: (props) => props.active
})
```
