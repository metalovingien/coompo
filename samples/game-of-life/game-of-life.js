"use strict"

const dead = 0
const alive = 1
const born = 2
const dying = 3

const worldWidth = 64
const worldHeight = 32

const isAlive = (cell) => cell === alive || cell === born

const howManyNeighborsAlive = (world, index) => {
    const hasWest = index % worldWidth > 0
    const hasNorth = index >= worldWidth
    const hasEast = index % worldWidth < worldWidth - 1
    const hasSouth = index < worldWidth * (worldHeight - 1)

    const nw = hasWest && hasNorth ? isAlive(world[index - worldWidth - 1]) ? 1 : 0 : 0
    const n = hasNorth ? isAlive(world[index - worldWidth]) ? 1 : 0 : 0
    const ne = hasNorth && hasEast ? isAlive(world[index - worldWidth + 1]) ? 1 : 0 : 0
    const w = hasWest ? isAlive(world[index - 1]) ? 1 : 0 : 0
    const e = hasEast ? isAlive(world[index + 1]) ? 1 : 0 : 0
    const sw = hasWest && hasSouth && hasNorth ? isAlive(world[index + worldWidth - 1]) ? 1 : 0 : 0
    const s = hasSouth ? isAlive(world[index + worldWidth]) ? 1 : 0 : 0
    const se = hasEast && hasSouth ? isAlive(world[index + worldWidth + 1]) ? 1 : 0 : 0

    return nw + n + ne + w + e + sw + s + se
}

const state = {
    init: () =>
    {
        state.world = []
        for (let i = 0; i < worldWidth * worldHeight; i++)
        {
            state.world.push(dead)
        }
        state.ticks = 0;
    },
    setNextState: () =>
    {
        const previousState = [...state.world]
        for (let i = 0; i < worldWidth * worldHeight; i++)
        {
            const n = howManyNeighborsAlive(previousState, i)
            state.world[i] = n === 2 ?
                (isAlive(previousState[i]) ?
                    alive :
                    dead
                ) :
                    n < 2 || n > 3 ?
                        (isAlive(previousState[i]) ?
                            dying :
                            dead
                         ) :
                         isAlive(previousState[i]) ?
                            alive :
                            born
        }
        state.ticks++;
    }
}

state.init()


const cell = Coompo.Component({
    name: 'cell',
    props: {
        index: { required: true },
        value: { default: undefined }
    },
    render: (props) =>

`<div class="cell ${
    props.value === dead ?
        'dead' :
        props.value === alive ?
            'alive' :
            props.value === born ?
                'born' :
                'dying'
}"></div>`,

    on: {
        click: (props) => {
            props.value = isAlive(props.value) ? dying : born
            state.world[props.index] = props.value
        },
        '@update': (props) => props.value = state.world[props.index]
    },
    memoKey: (props) => props.value
})


const makeCells = () => {
    let cells = ''
    for (let i = 0; i < worldWidth * worldHeight; i++)
    {
        cells +=  cell.of({ index: i, value: state.world[i] })
        if (i % worldWidth === worldWidth - 1)
        {
            cells += '<br />'
        }
    }
    return cells
}

const world = Coompo.Component({
    name: 'world',
    props: {},
    render: () => 
    
`<div id="world">
    ${ makeCells() }
</div>`

})


const play = Coompo.Component({
    name: 'app',
    props: {
        playing: { default: false }
    },
    render: (props) =>

`<button id="play" class="${ props.playing ? 'pause' : 'play' }">
    ${ props.playing ? '⏸️ Pause' : '▶️ Play' }
</button>`,

    on: {
        click: (props) =>
        {
            if (props.playing)
            {
                clearInterval(state.interval)
                props.playing = false
            }
            else
            {
                state.interval = setInterval(() =>
                {
                    state.setNextState()
                    Coompo.emit('update')
                }, 250)
                props.playing = true
            }
        },
        '@pause': (props) =>
        {
            clearInterval(state.interval)
            props.playing = false
        }
    }
})


const ticks = Coompo.Component({
    name: 'ticks',
    props: {
        value: { default: 0 }
    },
    render: (props) =>
    
`<input id="ticks" value="Step ${ props.value }">`,

    on: {
        '@update': (props) => props.value = state.ticks
    }
})


const clear = Coompo.Component({
    name: 'clear',
    props: {},
    render: () =>
    
'<button id="clear">❌ Clear</button>',

    on: {
        click: () =>
        {
            state.init()
            Coompo.emit('pause')
            Coompo.emit('update')
        }
    }
})


const app = Coompo.Component({
    name: 'app',
    props: {},
    render: () =>

`<div id="app">
    ${ world.of() }
    ${ play.of() }
    ${ ticks.of() }
    ${ clear.of() }
</div>`

})


Coompo.compose(app)
