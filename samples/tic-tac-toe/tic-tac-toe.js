"use strict"

const player = ['❌', '⭕']

const state = {
	getNextPlayer: () =>
	{
		const p = player[state.nextPlayer]
		state.nextPlayer = (state.nextPlayer + 1) % 2
		return p
	},
	getScore: (index) => state.grid[index] === '❌' ?
		1 :
		state.grid[index] === '⭕' ?
			-1 :
			0,
	getWinner: () =>
	{
		const lineSum = [0, 0, 0]
		const colSum = [0, 0, 0]
		let diag1Sum = 0
		let diag2Sum = 0
		for (let index = 0; index < 9; index++)
		{
			lineSum[Math.floor(index / 3)] += state.getScore(index)
			colSum[index % 3] += state.getScore(index)
			if (index % 4 == 0)
			{
				diag1Sum += state.getScore(index)
			}
			if (index === 2 || index === 4 || index === 6)
			{
				diag2Sum += state.getScore(index)
			}
		}
		if (lineSum.some(e =>  e === 3) || colSum.some(e =>  e === 3) || diag1Sum === 3 || diag2Sum === 3)
		{
			return '❌'
		}
		if (lineSum.some(e =>  e === -3) || colSum.some(e =>  e === -3) || diag1Sum === -3 || diag2Sum === -3)
		{
			return '⭕'
		}
		if (state.grid.every(e => e !== ''))
		{
			return '☯️'
		}
		return null
	},
	init: () =>
	{
		state.grid = ['', '', '', '', '', '', '', '', '']
		state.nextPlayer = 0
	}
}

state.init()


const cell = Coompo.Component({
	name: 'cell',
	props: {
		index: { required: true },
		value: { default: '' }
	},
	render: (props) =>

`<div class="cell ${(props.value === '❌' ?
	'player-x' :
	props.value === '⭕' ?
		'player-o' :
		'no-player')
}">
	${ props.value }
</div>`,

	on: {
		click: (props) =>
		{
			if (state.nextPlayer !== null && props.value === '')
			{
				props.value = state.grid[props.index] = state.getNextPlayer()
				Coompo.emit('checkWinner', state.getWinner())
			}
		},
		'@restart': (props) => props.value = ''
	}
})


const grid = Coompo.Component({
	name: 'grid',
	props: {},
	render: () =>
	
`<div id="grid">
	${cell.of({ index: 0 })}${cell.of({ index: 1 })}${cell.of({ index: 2 })}<br />
	${cell.of({ index: 3 })}${cell.of({ index: 4 })}${cell.of({ index: 5 })}<br />
	${cell.of({ index: 6 })}${cell.of({ index: 7 })}${cell.of({ index: 8 })}
</div>`

})


const restart = Coompo.Component({
	name: 'restart',
	props: {},
	render: () =>
	
'<button id="restart">Restart</button>',

	on: {
		click: () => Coompo.emit('restart')
	}
})


const app = Coompo.Component({
	name: 'app',
	props: {
		history: { default: '🏆 ' },
		winner: { default: null }
	},
	render: (props) =>
		
`<div id="app">
	<div id="winner">${
		props.winner !== null && props.winner !== '☯️' ?
			`Player ${ props.winner } wins !` :
			'Nobody wins.'
	}</div>
	<div id="history"> ${ props.history }</div>
	${ grid.of() }
	${ restart.of() }
</div>`,

	on: {
		'@checkWinner': (props, winner) => {
			props.winner = winner
			if (winner !== null)
			{
				props.history += winner
				state.nextPlayer = null
			}
		},
		'@restart': (props) => {
			props.winner = null
			state.init()
		}
	}
})


Coompo.compose(app)
