const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

// Constants declarations
const SHIP_HEIGHT = 15
const ROTATION_SPEED = 360 // Ship rotation speed in degrees per second
const FRAME_RATE = 100
const SHIP_THRUST = 5 // Acceleration of the ship in pixels per second per second
const FRICTION = 0.7 // 0 = no friction, 1 = lots of friction

// Constants to correct the pixels
const PIXEL_RATIO = window.devicePixelRatio || 1
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

// Set canvas width and height to be multiplied by pixel ratio
canvas.width = CANVAS_WIDTH * PIXEL_RATIO
canvas.height = CANVAS_HEIGHT * PIXEL_RATIO
canvas.style.width = `${CANVAS_WIDTH}px`
canvas.style.height = `${CANVAS_HEIGHT}px`

let ship = {
	x: canvas.width / 2,
	y: canvas.height / 2,
	r: SHIP_HEIGHT * PIXEL_RATIO, // Adjusted for pixel ratio
	a: (90 / 180) * Math.PI,
	rot: 0,
	isThrusting: false,
	thrust: {
		x: 0,
		y: 0,
	},
}

// Event handlers
document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

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

	// Thrust the ship
	if (ship.isThrusting) {
		ship.thrust.x += (SHIP_THRUST * Math.cos(ship.a)) / FRAME_RATE
		ship.thrust.y -= (SHIP_THRUST * Math.sin(ship.a)) / FRAME_RATE
	} else {
		ship.thrust.x -= (FRICTION * ship.thrust.x) / FRAME_RATE
		ship.thrust.y -= (FRICTION * ship.thrust.y) / FRAME_RATE
	}

	// Draw bg
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	// Draw ship
	ctx.strokeStyle = 'white'
	ctx.lineWidth = 2 * PIXEL_RATIO // Adjusted for pixel ratio

	ctx.beginPath()
	ctx.moveTo(
		ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
		ship.y - (4 / 3) * ship.r * Math.sin(ship.a)
	)
	ctx.lineTo(
		ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + Math.sin(ship.a)),
		ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - Math.cos(ship.a))
	)
	ctx.lineTo(
		ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - Math.sin(ship.a)),
		ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + Math.cos(ship.a))
	)
	ctx.closePath()
	ctx.stroke()

	// Rotate the ship
	ship.a += ship.rot

	// Move the ship
	ship.x += ship.thrust.x
	ship.y += ship.thrust.y

	// centre dot
	ctx.fillStyle = 'red'
	ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)
}

update()
