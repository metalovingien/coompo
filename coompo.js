"use strict"


const Coompo = {
	components: {},
	instances: {},
	nextInstance: 0
}


Coompo.Exception = (name, message) => ({
	name,
	message
})


const getElement = (instance) => document.querySelector(`[coompo-id="${instance.id}"]`)



const forAllInstances = (action) =>
{
	for (const id in Coompo.instances)
	{
		action(Coompo.instances[id])
	}
}


const forSelfAndChildren = (instance, action) =>
{
	Array.from(getElement(instance).outerHTML.matchAll(/coompo-id="(\d+)"/gm))
		.forEach(match => action(Coompo.instances[match[1]]))
}


const isCoompoEvent = (eventName) => eventName === 'propChange' || eventName.startsWith('@')


const attachEventHandlers = (instance) =>
{
	if (instance.component.on)
	{
		for (const eventName in instance.component.on)
		{
			if (!isCoompoEvent(eventName))
			{
				getElement(instance)[`on${eventName}`] = (eventData) =>
					instance.component.on[eventName](instance.props, eventData)
			}
		}
	}
}


const detachEventHandlers = (instance) =>
{
	if (instance.component.on)
	{
		for (const eventName in instance.component.on)
		{
			if (!isCoompoEvent(eventName))
			{
				getElement(instance)[`on${eventName}`] = null
			}
		}
	}
}


const render = (instance) =>
{
	const html = String(instance.component.render(instance.props))
	const el = document.createElement('div')
	el.innerHTML = html
	if (el.childNodes.length !== 1 || el.childNodes[0].nodeType !== Node.ELEMENT_NODE)
	{
		throw Coompo.Exception(
			'render_not_one_root',
			`The component '${instance.component.name}' must have one root element.`
		)
	}
	return html.replace(/^([^<]*<\w+)(\W.*)$/m, (_match, p1, p2) =>
		p1 + ` coompo-id="${instance.id}"` + p2
	)
}


const rerender = (instance) =>
{
	Coompo.nextInstance = instance.id + 1
	forSelfAndChildren(instance, detachEventHandlers)
	getElement(instance).outerHTML = render(instance)
	forSelfAndChildren(instance, attachEventHandlers)
}


Coompo.Component = (component) =>
{
	Coompo.components[component.name] = component

	component.of = (props = {}) =>
	{
		const id = Coompo.nextInstance++
		if (Coompo.instances[id] === undefined)
		{
			for (const p in component.props)
			{
				if (!component.props[p].hasOwnProperty('default') && !component.props[p].hasOwnProperty('required'))
				{
					throw Coompo.Exception(
						'prop_misdefined',
						`The prop '${p}' of the component '${component.name}' must be either '{ required: true }' or '{ default: ... }'.`
					)
				}
				if (component.props[p].hasOwnProperty('default') && component.props[p].required)
				{
					throw Coompo.Exception(
						'prop_both_default_required',
						`The prop '${p}' of the component '${component.name}' can't be both default and required.`
					)
				}
				if (!props.hasOwnProperty(p))
				{
					if (component.props[p].required)
					{
						throw Coompo.Exception(
							'prop_required',
							`The prop '${p}' of the component '${component.name}' is required.`
						)
					}
					else
					{
						props[p] = component.props[p].default
					}
				}
			}

			Coompo.instances[id] = {
				id,
				component,
				props,
				previousProps: {...props}
			}
		}

		return render(Coompo.instances[id])
	}

	return component
}


Coompo.compose = (component, props = {}) =>
{
	document.querySelector('[coompo-root]').outerHTML = component.of(props)
	
	forAllInstances(attachEventHandlers)

	setInterval(() =>
	{
		const changedInstances = []
		forAllInstances((instance) =>
		{
			for (const p in instance.props)
			{
				if (instance.props[p] !== instance.previousProps[p])
				{
					changedInstances.push(instance.id)

					if (instance.component.on && instance.component.on.propChange)
					{
						instance.component.on.propChange(
							p, instance.props[p], instance.previousProps[p]
						)
					}
				}
			}
			instance.previousProps = {...instance.props}
		})
		if (changedInstances.length === 1)
		{
			rerender(Coompo.instances[changedInstances[0]])
		}
		else if (changedInstances.length > 0)
		{
			rerender(Coompo.instances[0])
		}
	},
	10)
}


Coompo.emit = (name, data) =>
{
	forAllInstances((instance) =>
	{
		if (instance.component.on && instance.component.on[`@${name}`])
		{
			instance.component.on[`@${name}`](instance.props, data)
		}
	})
}
