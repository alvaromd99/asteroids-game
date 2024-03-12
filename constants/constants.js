export const CANVAS_WIDTH = 860
export const CANVAS_HEIGHT = 660

export const FRAME_RATE = 100
export const LINE_WIDTH = 2 // Width of the ship draw

export const SHIP_HEIGHT = 15
export const ROTATION_SPEED = 360 // Ship rotation speed in degrees per second
export const SHIP_THRUST = 5 // Acceleration of the ship in pixels per second per second
export const FRICTION = 0.4 // 0 = no friction
export const SHIP_INFO = {
	explosionDuration: 0.3, // In seconds
	respawnInvulnerabilityDuration: 1,
	blinkingDuration: 0.1,
}

export const ASTEROIDS_NUM = 3 // Starting number of asteroids
export const ASTEROIDS_VERT = 10 // Average number of vertices on the asteroids
export const ASTEROIDS_JAG = 0.3 // To modify the vert so its not a perfect polygon, range [0, 1]
export const ASTEROID_INFO = {
	speed: 50, // Max starting speed
	size: 100, // Starting size of asteroids in px
}

export const SHOW_BOUNDING = false
export const SHOW_CENTER_DOT = false

export const COLORS = {
	canvasColor: 'black',
	shipColor: 'white',
	shipFlame1: 'red',
	shipFlame2: 'yellow',
	asteroidColor: 'gray',
	impactCircleColor: 'lime',
}
