import {
	ASTEROIDS_JAG,
	ASTEROIDS_NUM,
	ASTEROIDS_VERT,
	ASTEROID_INFO,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	COLORS,
	DEFAULT_BS_VALUE,
	FRAME_RATE,
	FRICTION,
	GAME_LIVES,
	HAS_SOUND,
	LASER_INFO,
	LINE_WIDTH,
	NUMBER_INFO,
	ROTATION_SPEED,
	SAVE_KEY_LS,
	SHIP_HEIGHT,
	SHIP_INFO,
	SHIP_THRUST,
	SHOW_BOUNDING,
	SHOW_CENTER_DOT,
	TEXT_INFO,
} from './constants/constants.js'

/**
 * @typedef {Object} Laser
 * @property {number} x - The x-coordinate of the laser.
 * @property {number} y - The y-coordinate of the laser.
 * @property {number} xSpeed - The speed of the laser along the x-axis.
 * @property {number} ySpeed - The speed of the laser along the y-axis.
 * @property {number} explodeTime - Time of the explosion when hit an asteroid
 */

/**
 * @typedef {Object} Ship
 * @property {number} x - The x-coordinate of the ship.
 * @property {number} y - The y-coordinate of the ship.
 * @property {number} r - The radius of the ship.
 * @property {number} a - The angle of the ship.
 * @property {number} rot - The rotation speed of the ship.
 * @property {number} blinkNum - The number of blinks.
 * @property {number} blinkTime - The duration of each blink.
 * @property {number} explosionTime - The duration of the explosion.
 * @property {boolean} canShoot - Indicates if the ship can shoot.
 * @property {Laser[]} lasers - An array containing information about the ship's lasers.
 * @property {boolean} isThrusting - Indicates if the ship is thrusting.
 * @property {Object} thrust - The thrust vector of the ship.
 * @property {number} thrust.x - The x-component of the thrust vector.
 * @property {number} thrust.y - The y-component of the thrust vector.
 * @property {boolean} isDead - The ship has no more lives
 */

/**
 * @typedef {Object} Asteroid
 * @property {number} x - The x-coordinate of the asteroid.
 * @property {number} y - The y-coordinate of the asteroid.
 * @property {number} xSpeed - The speed of the asteroid along the x-axis.
 * @property {number} ySpeed - The speed of the asteroid along the y-axis.
 * @property {number} radius - The radius of the asteroid.
 * @property {number} a - The angle of the asteroid.
 * @property {number} vert - The number of vertices of the asteroid.
 * @property {number[]} vertOffs - The offset of each vertex of the asteroid.
 */

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

// Set up sounds sound effects
const fxLaser = new Audio('/sounds/laser.m4a')
const fxExplosion = new Audio('/sounds/explode.m4a')
const fxHit = new Audio('/sounds/hit.m4a')
const fxThrust = new Audio('/sounds/thrust.m4a')
fxLaser.volume = 0.02
fxExplosion.volume = 0.2
fxHit.volume = 0.2
fxThrust.volume = 0.4

// Game parameters
let level, text, textAlpha, lives, score, bestScore

/**
 * @type {Ship}
 */
// Ship creation
const ship = {}

/**
 * @type {Asteroid[]}
 */
// Asteroids creation
const asteroidsArray = []

// Create new Game
newGame()

// Event handlers
document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

/**
 *
 * @param {HTMLAudioElement} sound
 * @param {boolean} hasMultiplePlays
 */
function playSound(sound, hasMultiplePlays) {
	if (HAS_SOUND) {
		if (hasMultiplePlays) {
			sound.currentTime = 0
		}
		sound.play()
	}
}

/**
 *
 * @param {HTMLAudioElement} sound
 */
function stopSound(sound) {
	if (HAS_SOUND) {
		sound.pause()
		sound.currentTime = 0
	}
}

function createAllAsteroids() {
	let xAsteroidPos, yAsteroidPos
	for (let i = 0; i < ASTEROIDS_NUM + level; i++) {
		do {
			xAsteroidPos = Math.floor(Math.random() * CANVAS_WIDTH)
			yAsteroidPos = Math.floor(Math.random() * CANVAS_HEIGHT)
		} while (
			distanceBetweenTwoPoints(ship.x, ship.y, xAsteroidPos, yAsteroidPos) <
			ASTEROID_INFO.size * 2 + ship.r
		)
		asteroidsArray.push(
			createNewAsteroid(
				xAsteroidPos,
				yAsteroidPos,
				Math.ceil(ASTEROID_INFO.size / 2)
			)
		)
	}
}

function destroyAsteroid(index) {
	const { x, y, radius } = asteroidsArray[index]
	// Split asteroid if necessary
	if (radius === Math.ceil(ASTEROID_INFO.size / 2)) {
		asteroidsArray.push(
			createNewAsteroid(x, y, Math.ceil(ASTEROID_INFO.size / 4))
		)
		asteroidsArray.push(
			createNewAsteroid(x, y, Math.ceil(ASTEROID_INFO.size / 4))
		)
		score += ASTEROID_INFO.pointsBig
	} else if (radius === Math.ceil(ASTEROID_INFO.size / 4)) {
		asteroidsArray.push(
			createNewAsteroid(x, y, Math.ceil(ASTEROID_INFO.size / 8))
		)
		asteroidsArray.push(
			createNewAsteroid(x, y, Math.ceil(ASTEROID_INFO.size / 8))
		)
		asteroidsArray.push(
			createNewAsteroid(x, y, Math.ceil(ASTEROID_INFO.size / 8))
		)
		score += ASTEROID_INFO.pointsMedium
	} else {
		score += ASTEROID_INFO.pointsSmall
	}

	// Update the best score if needed
	if (score > bestScore) {
		bestScore = score
		localStorage.setItem(SAVE_KEY_LS, bestScore)
	}

	// Destroy the original asteroid
	asteroidsArray.splice(index, 1)

	// Sound Effect
	playSound(fxHit, true)

	// Check if no more asteroids to create a new level
	if (asteroidsArray.length === 0) {
		level++
		newLevel()
	}
}

function distanceBetweenTwoPoints(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function drawShip(x, y, a) {
	// Draw ship
	ctx.strokeStyle = COLORS.shipColor
	ctx.lineWidth = adjustedLineWidth // Adjusted for pixel ratio

	ctx.beginPath()
	ctx.moveTo(
		// Top point
		x + (4 / 3) * ship.r * Math.cos(a),
		y - (4 / 3) * ship.r * Math.sin(a)
	)
	ctx.lineTo(
		// Rear left
		x - ship.r * ((2 / 3) * Math.cos(a) + Math.sin(a)),
		y + ship.r * ((2 / 3) * Math.sin(a) - Math.cos(a))
	)
	ctx.lineTo(
		// Rear right
		x - ship.r * ((2 / 3) * Math.cos(a) - Math.sin(a)),
		y + ship.r * ((2 / 3) * Math.sin(a) + Math.cos(a))
	)
	ctx.closePath()
	ctx.stroke()
}

function createNewAsteroid(x, y, radius) {
	const lvlMulti = 1 + 0.1 * level
	const newAsteroid = {
		x: x,
		y: y,
		xSpeed:
			((Math.random() * ASTEROID_INFO.speed * lvlMulti) / FRAME_RATE) *
			(Math.random() < 0.5 ? 1 : -1),
		ySpeed:
			((Math.random() * ASTEROID_INFO.speed * lvlMulti) / FRAME_RATE) *
			(Math.random() < 0.5 ? 1 : -1),
		radius: radius * PIXEL_RATIO,
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
	// Avoid doing anything if ship is dead
	if (ship.isDead) return

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
	// Avoid doing anything if ship is dead
	if (ship.isDead) return

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
	playSound(fxExplosion, false)
}

function newGame() {
	level = 0
	lives = GAME_LIVES
	score = 0

	// Initialize the ship
	Object.assign(ship, newShip())

	// Reset asteroids array
	asteroidsArray.length = 0

	// Handle local storage
	let storedStr = localStorage.getItem(SAVE_KEY_LS)
	bestScore = storedStr !== null ? parseInt(storedStr) : DEFAULT_BS_VALUE

	newLevel()
}

function newLevel() {
	text = 'Level ' + (level + 1)
	textAlpha = 1.0
	createAllAsteroids()
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
		isDead: false,
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
			ySpeed: -(LASER_INFO.speed * Math.sin(ship.a)) / FRAME_RATE,
			explodeTime: 0,
		})
		playSound(fxLaser, true)
	}
	// Prevent spam shooting
	ship.canShoot = false
}

function gameOver() {
	ship.isDead = true
	text = 'Game Over'
	textAlpha = 1.0
}

function update() {
	window.requestAnimationFrame(update)

	const isShipExploding = ship.explosionTime > 0
	const isBlinkOn = ship.blinkNum % 2 === 0

	// Draw bg (this should be at the Top)
	ctx.fillStyle = COLORS.canvasColor
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	// Thrust the ship
	if (ship.isThrusting && !isShipExploding && !ship.isDead) {
		ship.thrust.x += (SHIP_THRUST * Math.cos(ship.a)) / FRAME_RATE
		ship.thrust.y -= (SHIP_THRUST * Math.sin(ship.a)) / FRAME_RATE

		// Sound effect
		playSound(fxThrust, false)

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

		stopSound(fxThrust)
	}

	// Draw the lasers
	ship.lasers.map((laser) => {
		if (laser.explodeTime === 0) {
			ctx.fillStyle = 'white'
			ctx.beginPath()
			ctx.arc(laser.x, laser.y, SHIP_HEIGHT / 5, 0, Math.PI * 2, false)
			ctx.fill()
		} else {
			// Draw the lasers explosions
			ctx.fillStyle = 'navy'
			ctx.beginPath()
			ctx.arc(laser.x, laser.y, ship.r * 0.75, 0, Math.PI * 2, false)
			ctx.fill()
			ctx.fillStyle = 'cyan'
			ctx.beginPath()
			ctx.arc(laser.x, laser.y, ship.r * 0.5, 0, Math.PI * 2, false)
			ctx.fill()
			ctx.fillStyle = 'white'
			ctx.beginPath()
			ctx.arc(laser.x, laser.y, ship.r * 0.25, 0, Math.PI * 2, false)
			ctx.fill()
		}
	})

	// Detect if lasers hit an asteroid
	asteroidsArray.forEach(({ x, y, radius }, asteroidIndex) => {
		const laserIndex = ship.lasers.findIndex(
			(laser) => distanceBetweenTwoPoints(x, y, laser.x, laser.y) < radius
		)
		if (laserIndex !== -1 && ship.lasers[laserIndex].explodeTime === 0) {
			// Remove asteroid
			destroyAsteroid(asteroidIndex)
			// Make the explosion
			ship.lasers[laserIndex].explodeTime = Math.ceil(
				LASER_INFO.explodeDuration * FRAME_RATE
			)
		}
	})

	// Handle ship drawing
	if (!isShipExploding) {
		if (isBlinkOn && !ship.isDead) {
			drawShip(ship.x, ship.y, ship.a)
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

		// Show asteroids impact circle
		if (SHOW_BOUNDING) {
			ctx.strokeStyle = COLORS.impactCircleColor

			ctx.beginPath()
			ctx.arc(x, y, radius, 0, Math.PI * 2, false)
			ctx.stroke()
		}
	})

	// Draw the level text
	if (textAlpha >= 0) {
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`
		ctx.font = `small-caps ${TEXT_INFO.textSize}px system-ui`
		ctx.fillText(text, canvas.width / 2, canvas.height * 0.75)
		textAlpha -= 1.0 / TEXT_INFO.textFadeTime / FRAME_RATE
	} else if (ship.isDead) {
		newGame()
	}

	// Draw the lives
	for (let i = 0; i < lives; i++) {
		drawShip(
			SHIP_HEIGHT * 1.5 + i * SHIP_HEIGHT * 2.5,
			SHIP_HEIGHT * 2,
			0.5 * Math.PI
		)
	}

	// Draw the score
	ctx.textAlign = 'right'
	ctx.textBaseline = 'middle'
	ctx.fillStyle = 'white'
	ctx.font = `${NUMBER_INFO.textSize}px system-ui`
	ctx.fillText(score, canvas.width - SHIP_HEIGHT / 2, NUMBER_INFO.marginTop)

	// Draw the high score
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillStyle = 'white'
	ctx.font = `${NUMBER_INFO.textSize}px system-ui`
	ctx.fillText(`Best ${bestScore}`, canvas.width / 2, NUMBER_INFO.marginTop)

	// Check for collisions
	if (!isShipExploding && !ship.isDead) {
		if (ship.blinkNum === 0) {
			asteroidsArray.map((asteroid, asteroidIndex) => {
				if (
					distanceBetweenTwoPoints(ship.x, ship.y, asteroid.x, asteroid.y) <
					ship.r + asteroid.radius
				) {
					makeShipExplode()
					destroyAsteroid(asteroidIndex)
					return
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
			lives--
			if (lives === 0) {
				gameOver()
			} else {
				// Modify ship properties instead of reassigning the entire object
				// to avoid type error
				Object.assign(ship, newShip())
			}
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

	// Move the lasers
	for (let i = ship.lasers.length - 1; i >= 0; i--) {
		// Handle laser explosion
		if (ship.lasers[i].explodeTime > 0) {
			ship.lasers[i].explodeTime--

			if (ship.lasers[i].explodeTime === 0) {
				ship.lasers.splice(i, 1)
				continue
			}
		} else {
			ship.lasers[i].x += ship.lasers[i].xSpeed
			ship.lasers[i].y += ship.lasers[i].ySpeed
		}
		// If the lasers go over edges, delete them
		if (ship.lasers[i].x < 0 || ship.lasers[i].x > canvas.width) {
			ship.lasers.splice(i, 1)
			continue
		}

		if (ship.lasers[i].y < 0 || ship.lasers[i].y > canvas.height) {
			ship.lasers.splice(i, 1)
			continue
		}
	}

	/**
	 * Update the position of asteroids based on their speed.
	 * @param {Asteroid} - An array of asteroids to update.
	 */
	// Move all the asteroids
	asteroidsArray.forEach((asteroid) => {
		let newX = asteroid.x + asteroid.xSpeed
		let newY = asteroid.y + asteroid.ySpeed

		// Handle asteroid going over the edges
		if (newX < 0 - asteroid.radius) {
			newX = canvas.width + asteroid.radius
		} else if (newX > canvas.width + asteroid.radius) {
			newX = 0 - asteroid.radius
		}

		if (newY < 0 - asteroid.radius) {
			newY = canvas.height + asteroid.radius
		} else if (newY > canvas.height + asteroid.radius) {
			newY = 0 - asteroid.radius
		}

		// Update the asteroid properties directly
		asteroid.x = newX
		asteroid.y = newY
	})

	// Ship impact circle
	if (SHOW_BOUNDING) {
		ctx.strokeStyle = COLORS.impactCircleColor

		ctx.beginPath()
		ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false)
		ctx.stroke()
	}

	// Centre dot
	if (SHOW_CENTER_DOT) {
		ctx.fillStyle = 'red'
		ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)
	}
}

update()
