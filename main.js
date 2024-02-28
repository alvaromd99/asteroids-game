const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const SHIP_HEIGHT = 10
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
}

function update() {
	window.requestAnimationFrame(update)

	// Draw bg
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	// Draw ship
	ctx.strokeStyle = 'white'
	ctx.lineWidth = 2 * PIXEL_RATIO // Adjusted for pixel ratio

	ctx.beginPath()
	ctx.moveTo(
		ship.x + ship.r * Math.cos(ship.a),
		ship.y - ship.r * Math.sin(ship.a)
	)
	ctx.lineTo(
		ship.x - ship.r * (Math.cos(ship.a) + Math.sin(ship.a)),
		ship.y + ship.r * (Math.sin(ship.a) - Math.cos(ship.a))
	)
	ctx.lineTo(
		ship.x - ship.r * (Math.cos(ship.a) - Math.sin(ship.a)),
		ship.y + ship.r * (Math.sin(ship.a) + Math.cos(ship.a))
	)
	ctx.closePath()
	ctx.stroke()
}

update()
