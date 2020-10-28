"use strict"

const fs = require('fs')
const path = require('path')
const coompo = fs.readFileSync(path.resolve(__dirname, '../coompo.js'), 'utf-8').replace(/const Coompo/m, 'global.Coompo')
global.eval(coompo)

describe("[Coompo.js]", () =>
{
    beforeEach(() =>
    {
        // reinitialize Compo
        Coompo.components = {}
        Coompo.instances = {}
        Coompo.nextInstance = 0
    })

    describe("[Props]", () =>
    {
        describe("should handle props' default values well", () =>
        {
            const title = Coompo.Component({
                name: 'title',
                render: (props) => `<h1>${ props.text }</h1>`
            })

            it("in case of initialized value", () =>
            {
                title.props = { text: { default: '(Untitiled)' } }
                
                expect(title.of({ text: 'Hello world'})).toBe('<h1 coompo-id="0">Hello world</h1>')
            })
        
            it("in case of defined non-null default value", () =>
            {
                title.props = { text: { default: '(Untitiled)' } }

                expect(title.of()).toBe('<h1 coompo-id="0">(Untitiled)</h1>')
            })

            it("in case of defined null default value", () =>
            {
                title.props = { text: { default: null } }

                expect(title.of()).toBe('<h1 coompo-id="0">null</h1>')
            })

            it("in case of undefined default value", () =>
            {
                title.props = { text: { default: undefined } }

                expect(title.of()).toBe('<h1 coompo-id="0">undefined</h1>')
            })

            it("and required:false has no effect with a default value", () =>
            {
                title.props = { text: { required: false, default: '(Untitiled)' } }

                expect(title.of()).toBe('<h1 coompo-id="0">(Untitiled)</h1>')
            })
        })

        describe("should handle props' required values well", () =>
        {
            it("in case of initialized value", () =>
            {
                const title = Coompo.Component({
                    name: 'title',
                    props: {
                        text: { required: true }
                    },
                    render: (props) => `<h1>${ props.text }</h1>`
                })
                
                expect(title.of({ text: 'Hello world'})).toBe('<h1 coompo-id="0">Hello world</h1>')
            })
            
            it("in case of uninitialized value", () =>
            {
                const title = Coompo.Component({
                    name: 'title',
                    props: {
                        text: { required: true }
                    },
                    render: (props) => `<h1>${ props.text }</h1>`
                })
                
                expect(() => title.of()).toThrow(Coompo.Exception('prop_required',
                    `The prop 'text' of the component 'title' is required.`))
            })
        })
        
        it("should forbid misdefined props", () =>
        {
            const title = Coompo.Component({
                name: 'title',
                props: {
                    text: ''
                },
                render: (props) => `<h1>${ props.text }</h1>`
            })

            expect(() => title.of({ text: 'Hello world' })).toThrow(Coompo.Exception('prop_misdefined',
                `The prop 'text' of the component 'title' must be either '{ required: true }' or '{ default: ... }'.`))
        })

        it("should forbid both required and default fields on a prop", () =>
        {
            const title = Coompo.Component({
                name: 'title',
                props: {
                    text: { required: true, default: '' }
                },
                render: (props) => `<h1>${ props.text }</h1>`
            })

            expect(() => title.of({ text: 'Hello world' })).toThrow(Coompo.Exception('prop_both_default_required',
                `The prop 'text' of the component 'title' can't be both default and required.`))
        })
    })

    describe("[Rendering]", () =>
    {
        it("should render a simple component as expected", () =>
        {
            const title = Coompo.Component({
                name: 'title',
                props: {
                    text: { required: true }
                },
                render: (props) => `<h1>${ props.text }</h1>`
            })

            expect(title.of({ text: 'Hello world' })).toBe('<h1 coompo-id="0">Hello world</h1>')
        })

        it("should render a complex component as expected", () =>
        {
            const title = Coompo.Component({
                name: 'title',
                props: {
                    text: { required: true }
                },
                render: (props) => `<h1>${ props.text }</h1>`
            })
            const paragraph = Coompo.Component({
                name: 'paragraph',
                props: {
                    text: { required: true }
                },
                render: (props) => `<p>${ props.text }</p>`
            })
            const section = Coompo.Component({
                name: 'section',
                props: {
                    title: { required: true },
                    paragraphs: { default: [] }
                },
                render: (props) =>

    `<section>
        ${ title.of({ text: props.title }) }
        ${ props.paragraphs.map(e => paragraph.of({ text: e })).reduce((acc, cur) => acc + cur, '') }
    </section>`

            })

            expect(section.of({ title: 'Hello world', paragraphs: ['Firstly.', 'Secondly.'] })).toBe(

    `<section coompo-id="0">
        <h1 coompo-id="1">Hello world</h1>
        <p coompo-id="2">Firstly.</p><p coompo-id="3">Secondly.</p>
    </section>`

            )
        })
    })
})
  