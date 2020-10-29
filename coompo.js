"use strict"


const Coompo = {
	components: {},
	instances: {},
	nextInstance: 0
}


/**
 * Any Coompo exception
 * @param {string} name 
 * @param {string} message 
 */
Coompo.Exception = (name, message) => ({
	name,
	message
})


/**
 * Get the DOM element related to this component instance
 * @param {object} instance 
 * @returns {Element} the element
 */
const getElement = (instance) => document.querySelector(`[coompo-id="${instance.id}"]`)


/**
 * Do something for all component instances
 * @param {function} action 
 */
const forAllInstances = (action) =>
{
	for (const id in Coompo.instances)
	{
		action(Coompo.instances[id])
	}
}


/**
 * Do something for a component instance and all its children
 * @param {object} instance 
 * @param {function} action 
 */
const forSelfAndChildren = (instance, action) =>
{
	Array.from(getElement(instance).outerHTML.matchAll(/coompo-id="(\d+)"/gm))
		.forEach(match => action(Coompo.instances[match[1]]))
}


/**
 * Whether an event is a Coompo event (propChange event, custom event) - not a HTML event (onclick, onmouseenter...)
 * @param {string} eventName 
 * @returns {boolean} whether it is a Coompo event
 */
const isCoompoEvent = (eventName) => eventName === 'propChange' || eventName.startsWith('@')


/**
 * Attach event handlers for HTML events (onclick, onmouseenter...)
 * @param {object} instance 
 */
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


/**
 * Detach event handlers for HTML events (onclick, onmouseenter...)
 * @param {object} instance 
 */
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


/**
 * Call the render() function of a component instance and check if it produces one root HTML element
 * @param {object} instance 
 * @returns {string} HTML produced
 */
const callRender = (instance) =>
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
	return html;
}


/**
 * Render a component instance in order to insert a new DOM element
 * @param {object} instance 
 * @returns {string} HTML produced
 */
const render = (instance) =>
{
	let html;
	if (instance.component.memo)
	{
		const memoKey = instance.component.memoKey(instance.props)
		if (instance.component.memo.hasOwnProperty(memoKey))
		{
			html = instance.component.memo[memoKey]
		}
		else
		{
			html = callRender(instance)
			instance.component.memo[memoKey] = html
		}
	}
	else
	{
		html = callRender(instance)
	}
	return html.replace(/^([^<]*<\w+)(\W.*)$/m, (_match, p1, p2) =>
		p1 + ` coompo-id="${instance.id}"` + p2
	)
}


/**
 * Re-render an exisitng DOM element related to this component instance
 * @param {object} instance 
 */
const rerender = (instance) =>
{
	Coompo.nextInstance = instance.id + 1
	forSelfAndChildren(instance, detachEventHandlers)
	getElement(instance).outerHTML = render(instance)
	forSelfAndChildren(instance, attachEventHandlers)
}


/**
 * Register a component
 * @param {object} component options of the comoponent
 * @returns {object} the component
 */
Coompo.Component = (component) =>
{
	Coompo.components[component.name] = component
	
	if (component.hasOwnProperty('memoKey'))
	{
		component.memo = {}
	}

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


/**
 * Render an instance of this root component with those props
 * at the DOM placeholder element marked with the 'coompo-root' attribute
 * @param {object} component 
 * @param {object} props 
 */
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


/**
 * Emit a custom event with this name and passing those data
 * @param {string} name 
 * @param {any} data 
 */
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
