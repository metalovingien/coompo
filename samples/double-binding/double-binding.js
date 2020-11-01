"use strict"


const form = Coompo.Component({
    name: 'form',
    props: {
        firstname: { default:'' },
        lastname: { default:'' }
    },
    render: (props) =>

`<form>
    <div>
        <label for="firstname">First name</label>
        <input id=firstname" coompo-is="firstname" />
    </div>
    <div>
        <label for="lastname">Last name</label>
        <input id=lastname" coompo-is="lastname" />
    </div>
    <br />
    <div>${ props.firstname } ${ props.lastname }</div>
</form>`

})


Coompo.compose(form)