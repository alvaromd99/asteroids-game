const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

// Constants declarations
const FRAME_RATE = 100
const SHIP_HEIGHT = 15
const LINE_WIDTH = 2 // Width of the ship draw
const ROTATION_SPEED = 360 // Ship rotation speed in degrees per second
const SHIP_THRUST = 3 // Acceleration of the ship in pixels per second per second
const FRICTION = 1.4 // 0 = no friction
const ASTEROIDS_NUM = 3 // Starting number of asteroids
const ASTEROIDS_VERT = 10 // Average number of vertices on the asteroids
const ASTEROID_INFO = {
	speed: 50, // Max starting speed
	size: 100, // Starting size of asteroids in px
}

// Constants to correct the pixels
const PIXEL_RATIO = window.devicePixelRatio || 1
const CANVAS_WIDTH = 860
const CANVAS_HEIGHT = 660

// Set canvas width and height to be multiplied by pixel ratio
canvas.width = CANVAS_WIDTH * PIXEL_RATIO
canvas.height = CANVAS_HEIGHT * PIXEL_RATIO
canvas.style.width = `${CANVAS_WIDTH}px`
canvas.style.height = `${CANVAS_HEIGHT}px`

const adjustedLineWidth = LINE_WIDTH * PIXEL_RATIO

const ship = {
	x: canvas.width / 2, // X position
	y: canvas.height / 2, // Y position
	r: SHIP_HEIGHT * PIXEL_RATIO, // Adjusted for pixel ratio
	a: (90 / 180) * Math.PI, // Angle
	rot: 0,
	isThrusting: false,
	thrust: {
		x: 0,
		y: 0,
	},
}

let asteroidsArray = []
createAllAsteroids()

// Event handlers
document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

function createAllAsteroids() {
	asteroidsArray = []

	for (let i = 0; i < ASTEROIDS_NUM; i++) {
		const xAsteroidPos = Math.floor(Math.random() * CANVAS_WIDTH)
		const yAsteroidPos = Math.floor(Math.random() * CANVAS_HEIGHT)

		asteroidsArray.push(createNewAsteroid(xAsteroidPos, yAsteroidPos))
	}
}

function createNewAsteroid(x, y) {
	console.log('hello')
	const newAsteroid = {
		x: x,
		y: y,
		xSpeed:
			((Math.random() * ASTEROID_INFO.speed) / FRAME_RATE) *
			(Math.random() < 0.5 ? 1 : -1),
		ySpeed:
			((Math.random() * ASTEROID_INFO.speed) / FRAME_RATE) *
			(Math.random() < 0.5 ? 1 : -1),
		radius: (ASTEROID_INFO.size / 2) * PIXEL_RATIO,
		a: Math.random() * Math.PI * 2, // In radians
		vert: Math.floor(Math.random() * (ASTEROIDS_VERT + 1) + ASTEROIDS_VERT / 2),
	}
	console.log(newAsteroid)

	return newAsteroid
}

/**
 * Handle keydown event
 * @param {KeyboardEvent} e
 */
function handleKeyDown(e) {
	switch (e.code) {
		case 'ArrowLeft':
			ship.rot = (ROTATION_SPEED / FRAME_RATE) * (Math.PI / 180)
			break
		case 'ArrowRight':
			ship.rot = (-ROTATION_SPEED / FRAME_RATE) * (Math.PI / 180)
			break
		case 'ArrowUp':
			ship.isThrusting = true
			break
	}
}

/**
 * Handle keyup event
 * @param {KeyboardEvent} e
 */
function handleKeyUp(e) {
	switch (e.code) {
		case 'ArrowLeft':
			ship.rot = 0
			break
		case 'ArrowRight':
			ship.rot = 0
			break
		case 'ArrowUp':
			ship.isThrusting = false

			break
	}
}

function update() {
	window.requestAnimationFrame(update)

	// Draw bg (this should be at the Top)
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	// Thrust the ship
	if (ship.isThrusting) {
		ship.thrust.x += (SHIP_THRUST * Math.cos(ship.a)) / FRAME_RATE
		ship.thrust.y -= (SHIP_THRUST * Math.sin(ship.a)) / FRAME_RATE

		// Draw flame
		ctx.fillStyle = 'red'
		ctx.strokeStyle = 'yellow'
		ctx.lineWidth = 2
		ctx.beginPath()
		ctx.moveTo(
			// Rear left
			ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
			ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
		)
		ctx.lineTo(
			// Top point
			ship.x - ((ship.r * 5) / 3) * Math.cos(ship.a),
			ship.y + ((ship.r * 5) / 3) * Math.sin(ship.a)
		)
		ctx.lineTo(
			// Rear right
			ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
			ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
		)
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
	} else {
		ship.thrust.x -= (FRICTION * ship.thrust.x) / FRAME_RATE
		ship.thrust.y -= (FRICTION * ship.thrust.y) / FRAME_RATE
	}

	// Draw ship
	ctx.strokeStyle = 'white'
	ctx.lineWidth = adjustedLineWidth // Adjusted for pixel ratio

	ctx.beginPath()
	ctx.moveTo(
		// Top point
		ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
		ship.y - (4 / 3) * ship.r * Math.sin(ship.a)
	)
	ctx.lineTo(
		// Rear left
		ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + Math.sin(ship.a)),
		ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - Math.cos(ship.a))
	)
	ctx.lineTo(
		// Rear right
		ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - Math.sin(ship.a)),
		ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + Math.cos(ship.a))
	)
	ctx.closePath()
	ctx.stroke()

	// Draw the asteroids
	ctx.strokeStyle = 'gray' // TODO Make variables for this
	ctx.lineWidth = 2 // TODO Make variables for this
	asteroidsArray.map(({ x, y, xSpeed, ySpeed, radius, a, vert }) => {
		// Draw the asteroid
		ctx.beginPath()
		ctx.moveTo(x + radius * Math.cos(a), y + radius * Math.sin(a))
		for (let i = 0; i < vert; i++) {
			ctx.lineTo(
				x + radius * Math.cos(a + (i * Math.PI * 2) / vert),
				y + radius * Math.sin(a + (i * Math.PI * 2) / vert)
			)
		}
		ctx.closePath()
		ctx.stroke()
	})

	// Rotate the ship
	ship.a += ship.rot

	// Move the ship
	ship.x += ship.thrust.x
	ship.y += ship.thrust.y

	// Handle going over the edges
	if (ship.x < 0 - ship.r) {
		ship.x = canvas.width + ship.r
	} else if (ship.x > canvas.width + ship.r) {
		ship.x = 0 - ship.r
	}

	if (ship.y < 0 - ship.r) {
		ship.y = canvas.height + ship.r
	} else if (ship.y > canvas.height + ship.r) {
		ship.y = 0 - ship.r
	}

	// centre dot
	ctx.fillStyle = 'red'
	ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)
}

update()
