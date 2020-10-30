"use strict"


const input = Coompo.Component({
    name: 'input',
    props: {
        id: { required: true }
    },
    render: (props) =>

`<input id="${ props.id }" />`,

    on: {
        input: (props, e) =>
        {
            Coompo.emit(`update:${ props.id }`, e.target.value)
        },
        '@reset': (props) => props.value = ''
    }
})


const labeledInput = Coompo.Component({
    name: 'input',
    props: {
        id: { required: true }
    },
    render: (props) =>

`<div>
    <label for="${ props.id }">${ props.label }</label>
    ${ input.of({ id: props.id }) }
</div>`

})


const nameLabel = Coompo.Component({
    name: 'nameLabel',
    props: {
        firstname: { default: '' },
        lastname: { default: '' }
    },
    render: (props) =>

`<div>${ props.firstname } ${ props.lastname }</div>`,

    on: {
        '@update:firstname': (props, firstname) => props.firstname = firstname,
        '@update:lastname': (props, lastname) => props.lastname = lastname
    }
})


const resetButton = Coompo.Component({
    name: 'resetButton',
    props: {},
    render: (props) =>

`<button>Reset</button>`,

    on: {
        click: (props) => Coompo.emit('reset')
    }
})


const form = Coompo.Component({
    name: 'form',
    props: {},
    render: () =>

`<form>
    ${ labeledInput.of({ id: 'firstname', label: 'First name' }) }
    ${ labeledInput.of({ id: 'lastname', label: 'Last name' }) }
    <br/ >
    ${ nameLabel.of() }
    <br />
    ${ resetButton.of() }
</form>`

})


Coompo.compose(form)