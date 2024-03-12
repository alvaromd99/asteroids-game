import {
	ASTEROIDS_JAG,
	ASTEROIDS_NUM,
	ASTEROIDS_VERT,
	ASTEROID_INFO,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	COLORS,
	FRAME_RATE,
	FRICTION,
	LASER_INFO,
	LINE_WIDTH,
	ROTATION_SPEED,
	SHIP_HEIGHT,
	SHIP_INFO,
	SHIP_THRUST,
	SHOW_BOUNDING,
	SHOW_CENTER_DOT,
} from './constants/constants.js'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

// Constant to correct the pixels
const PIXEL_RATIO = window.devicePixelRatio || 1

// Set canvas width and height to be multiplied by pixel ratio
canvas.width = CANVAS_WIDTH * PIXEL_RATIO
canvas.height = CANVAS_HEIGHT * PIXEL_RATIO
canvas.style.width = `${CANVAS_WIDTH}px`
canvas.style.height = `${CANVAS_HEIGHT}px`

const adjustedLineWidth = LINE_WIDTH * PIXEL_RATIO

const ship = newShip()

// Asteroids creation
let asteroidsArray = []
createAllAsteroids()

// Event handlers
document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

function createAllAsteroids() {
	asteroidsArray = []
	let xAsteroidPos, yAsteroidPos
	for (let i = 0; i < ASTEROIDS_NUM; i++) {
		do {
			xAsteroidPos = Math.floor(Math.random() * CANVAS_WIDTH)
			yAsteroidPos = Math.floor(Math.random() * CANVAS_HEIGHT)
		} while (
			distanceBetweenTwoPoints(ship.x, ship.y, xAsteroidPos, yAsteroidPos) <
			ASTEROID_INFO.size * 2 + ship.r
		)
		asteroidsArray.push(createNewAsteroid(xAsteroidPos, yAsteroidPos))
	}
}

function distanceBetweenTwoPoints(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function createNewAsteroid(x, y) {
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
		vertOffs: [],
	}

	// Create the vertices offset array
	for (let i = 0; i < newAsteroid.vert; i++) {
		newAsteroid.vertOffs.push(
			Math.random() * ASTEROIDS_JAG * 2 + 1 - ASTEROIDS_JAG
		)
	}

	return newAsteroid
}

function handleKeyDown(/** @type {KeyboardEvent} */ e) {
	switch (e.code) {
		case 'Space':
			shootLaser()
			break
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

function handleKeyUp(/** @type {KeyboardEvent} */ e) {
	switch (e.code) {
		case 'Space':
			ship.canShoot = true
			break
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

function makeShipExplode() {
	ship.explosionTime = Math.ceil(SHIP_INFO.explosionDuration * FRAME_RATE)
}

function newShip() {
	const newShip = {
		x: canvas.width / 2, // X position
		y: canvas.height / 2, // Y position
		r: SHIP_HEIGHT * PIXEL_RATIO, // Adjusted for pixel ratio
		a: (90 / 180) * Math.PI, // Angle
		rot: 0,
		blinkNum: Math.ceil(
			SHIP_INFO.respawnInvulnerabilityDuration / SHIP_INFO.blinkingDuration
		),
		blinkTime: Math.ceil(SHIP_INFO.blinkingDuration * FRAME_RATE),
		explosionTime: 0,
		canShoot: true,
		lasers: [],
		isThrusting: false,
		thrust: {
			x: 0,
			y: 0,
		},
	}

	return newShip
}

function shootLaser() {
	// Create laser object
	if (ship.canShoot && ship.lasers.length < LASER_INFO.maxNumber) {
		// Shoot lase from the nose of the ship
		ship.lasers.push({
			x: ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
			y: ship.y - (4 / 3) * ship.r * Math.sin(ship.a),
			xSpeed: (LASER_INFO.speed * Math.cos(ship.a)) / FRAME_RATE,
			ySpeed: (LASER_INFO.speed * Math.sin(ship.a)) / FRAME_RATE,
		})
	}
	// Prevent spam shooting
	ship.canShoot = false
}

function update() {
	window.requestAnimationFrame(update)

	const isShipExploding = ship.explosionTime > 0
	const isBlinkOn = ship.blinkNum % 2 === 0

	// Draw bg (this should be at the Top)
	ctx.fillStyle = COLORS.canvasColor
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	// Thrust the ship
	if (ship.isThrusting && !isShipExploding) {
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

	// Draw the lasers
	ship.lasers.map((laser) => {
		ctx.fillStyle = 'salmon'
		ctx.beginPath()
		ctx.arc(laser.x, laser.y, SHIP_HEIGHT / 5, 0, Math.PI * 2, false)
		ctx.fill()
	})

	if (!isShipExploding) {
		if (isBlinkOn) {
			// Draw ship
			ctx.strokeStyle = COLORS.shipColor
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
		}
		// HandleBlinking
		if (ship.blinkNum > 0) {
			// Reduce the blinking time
			ship.blinkTime--

			// Reduce the blink num
			if (ship.blinkTime === 0) {
				ship.blinkTime = Math.ceil(SHIP_INFO.blinkingDuration * FRAME_RATE)
				ship.blinkNum--
			}
		}
	} else {
		// Draw the explosion
		ctx.fillStyle = 'darkred'
		ctx.beginPath()
		ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false)
		ctx.fill()

		ctx.fillStyle = 'red'
		ctx.beginPath()
		ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false)
		ctx.fill()

		ctx.fillStyle = 'orange'
		ctx.beginPath()
		ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false)
		ctx.fill()

		ctx.fillStyle = 'yellow'
		ctx.beginPath()
		ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false)
		ctx.fill()

		ctx.fillStyle = 'white'
		ctx.beginPath()
		ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false)
		ctx.fill()
	}

	if (SHOW_BOUNDING) {
		ctx.strokeStyle = COLORS.impactCircleColor

		ctx.beginPath()
		ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false)
		ctx.stroke()
	}

	// Draw the asteroids
	asteroidsArray.forEach(({ x, y, radius, a, vert, vertOffs }) => {
		ctx.strokeStyle = COLORS.asteroidColor
		ctx.lineWidth = LINE_WIDTH

		// Draw the asteroid
		ctx.beginPath()
		ctx.moveTo(
			x + radius * vertOffs[0] * Math.cos(a),
			y + radius * vertOffs[0] * Math.sin(a)
		)
		for (let i = 1; i < vert; i++) {
			ctx.lineTo(
				x + radius * vertOffs[i] * Math.cos(a + (i * Math.PI * 2) / vert),
				y + radius * vertOffs[i] * Math.sin(a + (i * Math.PI * 2) / vert)
			)
		}
		ctx.closePath()
		ctx.stroke()

		// Show impact circle
		if (SHOW_BOUNDING) {
			ctx.strokeStyle = COLORS.impactCircleColor

			ctx.beginPath()
			ctx.arc(x, y, radius, 0, Math.PI * 2, false)
			ctx.stroke()
		}
	})

	// Check for collisions
	if (!isShipExploding) {
		if (ship.blinkNum === 0) {
			asteroidsArray.map((asteroid) => {
				if (
					distanceBetweenTwoPoints(ship.x, ship.y, asteroid.x, asteroid.y) <
					ship.r + asteroid.radius
				) {
					makeShipExplode()
				}
			})
		}

		// Rotate the ship
		ship.a += ship.rot

		// Move the ship
		ship.x += ship.thrust.x
		ship.y += ship.thrust.y
	} else {
		ship.explosionTime--

		if (ship.explosionTime == 0) {
			// Modify ship properties instead of reassigning the entire object
			// to avoid type error
			Object.assign(ship, newShip())
		}
	}

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

	// Move the asteroids
	asteroidsArray = asteroidsArray.map(
		({ x, y, radius, a, vert, vertOffs, xSpeed, ySpeed }) => {
			x += xSpeed
			y += ySpeed

			// Handle asteroid going over the edges
			if (x < 0 - radius) {
				x = canvas.width + radius
			} else if (x > canvas.width + radius) {
				x = 0 - radius
			}

			if (y < 0 - radius) {
				y = canvas.height + radius
			} else if (y > canvas.height + radius) {
				y = 0 - radius
			}

			// Return the updated asteroid
			return { x, y, radius, a, vert, vertOffs, xSpeed, ySpeed }
		}
	)

	// centre dot
	if (SHOW_CENTER_DOT) {
		ctx.fillStyle = 'red'
		ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)
	}
}

update()
