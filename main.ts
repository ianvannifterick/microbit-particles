function addParticle() {
    particles.push(new Particle(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 360
    ))
    colAdd = 255 / numParticles
}
function constrain(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max)
}
function distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}
const bounciness = 0.9
let colAdd = 0
let numParticles = 1
let particles: Particle[] = []
let gravityX = 0
let gravityY = 0
let width = 100
let height = 100
let displayWidth = 5
let displayHeight = 5
let buffer: number[][];
let defaultRadius = 2
let defaultSpeed = 10

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

    constructor(x: number, y: number, dir: number) {
        this.x = x;
        this.y = y;
        this.radius = defaultRadius;
        this.speed = defaultSpeed;
        this.dir = dir;
        this.xspeed = this.speed * Math.cos(this.dir);
        this.yspeed = this.speed * Math.sin(this.dir);
    }

    paint() {
        let x = Math.floor(this.x / width * displayWidth);
        let y = Math.floor(this.y / height * displayHeight);
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > 4) x = 4;
        if (y > 4) y = 4;
        if (buffer[x][y] === 0)
            buffer[x][y] = 64;
        buffer[x][y] *= 1.5;
    }

    update() {
        this.xspeed *= 0.99;
        this.yspeed *= 0.99;
        this.xspeed += gravityX;
        this.yspeed += gravityY;
        this.x += this.xspeed;
        this.y += this.yspeed;
        if (this.x > width) {
            this.x = width;
            this.xspeed *= -bounciness;
        }
        if (this.x < 0) {
            this.x = 0;
            this.xspeed *= -bounciness;
        }
        if (this.y > height) {
            this.y = height;
            this.yspeed *= -bounciness;
        }
        if (this.y < 0) {
            this.y = 0;
            this.yspeed *= -bounciness;
        }

        for (let p of particles) {
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
        this.x = constrain(this.x, 0, width);
        this.y = constrain(this.y, 0, height);
    }

    run() {
        this.update();
        this.paint();
    }
}
for (let index = 0; index < numParticles; index++) {
    addParticle()
}

function showBuffer() {
    for (let x2 = 0; x2 <= displayWidth - 1; x2++) {
        for (let y2 = 0; y2 <= displayHeight - 1; y2++) {
            led.plotBrightness(x2, y2, buffer[x2][y2])
        }
    }
}

function clearBuffer() {
    buffer = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ]
}


basic.forever(function () {
    gravityX = (input.acceleration(Dimension.X) / 1024 - 0.5) * 3
    gravityY = (input.acceleration(Dimension.Y) / 1024 - 0.5) * 3
    clearBuffer()
    for (let k = 0; k <= particles.length - 1; k++) {
        particles[k].run();
    }
    showBuffer()
})

input.onButtonPressed(Button.A, function () {
    addParticle()
})
input.onButtonPressed(Button.B, function () {
    for (let i = 0; i < 10; i++)
        addParticle()
})

input.onGesture(Gesture.Shake, function () {
    particles.forEach(p => {
        p.dir = Math.random() * 360
        p.x = Math.random() * width;
        p.y = Math.random() * height;
        p.xspeed = p.speed * Math.cos(p.dir)
        p.yspeed = p.speed * Math.sin(p.dir)
    })

})
