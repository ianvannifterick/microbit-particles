function constrain(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max)
}

function distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

const defaultRadius = 1
const defaultSpeed = 10

class Display {
    buffer: number[][];
    displayWidth = 5
    displayHeight = 5

    constructor() {
        this.buffer = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ]
    }

    showBuffer() {
        for (let x2 = 0; x2 <= this.displayWidth - 1; x2++) {
            for (let y2 = 0; y2 <= this.displayHeight - 1; y2++) {
                led.plotBrightness(x2, y2, this.buffer[x2][y2])
            }
        }
    }

    clearBuffer() {
        for (let i = 0; i < this.displayWidth; i++) {
            this.buffer[i] = []
            for (let j = 0; j < this.displayHeight; j++) {
                this.buffer[i][j] = 0
            }
        }
    }

    plot(x: number, y: number) {
        if (this.buffer[x][y] === 0)
            this.buffer[x][y] = 16;
        this.buffer[x][y] *= 1.5;
    }

}

class Particle {
    x: number;
    y: number;
    radius: number;
    speed: number;
    dir: number;
    xspeed: number;
    yspeed: number;
    gravityX: number;
    gravityY: number;
    world: World;
    bounciness = 0.9

    constructor(world: World, x: number, y: number, dir: number) {
        this.x = x;
        this.y = y;
        this.radius = defaultRadius;
        this.speed = defaultSpeed;
        this.dir = dir;
        this.xspeed = this.speed * Math.cos(this.dir);
        this.yspeed = this.speed * Math.sin(this.dir);
        this.world = world;
    }

    paint() {
        this.world.plotVirtual(this.x, this.y);
    }

    update() {
        this.xspeed *= 0.99;
        this.yspeed *= 0.99;
        this.xspeed += world.gravityX;
        this.yspeed += world.gravityY;
        this.x += this.xspeed;
        this.y += this.yspeed;
        if (this.x > world.width) {
            this.x = world.width;
            this.xspeed *= -this.bounciness;
        }
        if (this.x < 0) {
            this.x = 0;
            this.xspeed *= -this.bounciness;
        }
        if (this.y > world.height) {
            this.y = world.height;
            this.yspeed *= -this.bounciness;
        }
        if (this.y < 0) {
            this.y = 0;
            this.yspeed *= -this.bounciness;
        }

        for (let p of world.particles) {
            if (p === this) continue;
            if (distance(this.x, this.y, p.x, p.y) < this.radius + p.radius) {
                let dx = p.x - this.x;
                let dy = p.y - this.y;
                let angle = Math.atan2(dy, dx);
                let targetX = this.x + Math.cos(angle) * this.radius;
                let targetY = this.y + Math.sin(angle) * this.radius;
                let ax = (targetX - p.x) * 0.5;
                let ay = (targetY - p.y) * 0.5;
                this.xspeed -= ax;
                this.yspeed -= ay;
                p.xspeed += ax;
                p.yspeed += ay;
            }
        }
        this.x = constrain(this.x, 0, world.width - 1);
        this.y = constrain(this.y, 0, world.height - 1);
    }

    run() {
        this.update();
        this.paint();
    }
}

class World {
    numParticles = 1
    particles: Particle[] = []
    gravityX = 0
    gravityY = 0
    width = 100
    height = 100
    display: Display

    constructor(display: Display) {
        this.display = display
        for (let i = 0; i < this.numParticles; i++) {
            this.addParticle()
        }
    }

    addParticle() {
        if (this.particles.length >= 100)
            return

        this.particles.push(new Particle(
            this,
            Math.random() * this.width,
            Math.random() * this.height,
            Math.random() * 360
        ))
    }

    addParticles(amount: number) {
        for (let i = 0; i < amount; i++) {
            this.addParticle()
        }
    }


    earthQuake() {
        this.particles.forEach(p => {
            p.dir = Math.random() * 360
            p.x = Math.random() * world.width;
            p.y = Math.random() * world.height;
            p.xspeed = p.speed * Math.cos(p.dir)
            p.yspeed = p.speed * Math.sin(p.dir)
        })
    }

    plotVirtual(vx: number, vy: number) {
        let x = Math.floor(vx * this.display.displayWidth / this.width)
        let y = Math.floor(vy * this.display.displayHeight / this.height)
        x = constrain(x, 0, this.display.displayWidth - 1)
        y = constrain(y, 0, this.display.displayHeight - 1)
        this.display.plot(x, y)
    }
}


const display = new Display()
const world = new World(display)

basic.forever(function () {
    world.gravityX = (input.acceleration(Dimension.X) / 1024 - 0.5) * 3
    world.gravityY = (input.acceleration(Dimension.Y) / 1024 - 0.5) * 3
    display.clearBuffer()
    for (let k = 0; k <= world.particles.length - 1; k++) {
        world.particles[k].run();
    }
    display.showBuffer()
})

input.onButtonPressed(Button.A, function () {
    world.addParticle()
})
input.onButtonPressed(Button.B, function () {
    world.addParticles(10)
})

input.onGesture(Gesture.Shake, function () {
    world.earthQuake()
})
