import {distance, getAngle} from '../math/algebra.js'
import {clamp, exceedsLimits} from '../math/basic.js'

// setup
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


class Particle {
    constructor (effect) {
        this.effect = effect;
        this.radius = 2 + Math.random() * 5;
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);

    }

    draw (ctx) {
        // ctx.fillStyle = `hsl(${this.x * .5},100%, 50%)`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        ctx.fill()
        // ctx.stroke()
    }

    update () {
        let {mouse} = this.effect
        if (mouse.pressed) {
            let dis = distance(mouse, this)
            let force = mouse.radius / dis
            if (dis < mouse.radius) {
                let angle = getAngle(mouse, this)
                this.x += Math.cos(angle)
                this.y += Math.sin(angle)
            }
        }
        let x = {min: this.radius, max: this.effect.width - this.radius}
        let y = {min: this.radius, max: this.effect.height - this.radius}
        if (exceedsLimits(x.min, this.x, x.max)) this.vx *= -1;
        if (exceedsLimits(y.min, this.y, y.max)) this.vy *= -1;
        this.x = clamp(x.min, this.x + this.vx, x.max)
        this.y = clamp(y.min, this.y + this.vy, y.max)
    }

    reset () {
        this.x = clamp(this.radius, this.x, this.effect.width)
        this.y = clamp(this.radius, this.y, this.effect.height)

        this.vx = Math.random() * 1 - .5
        this.vy = Math.random() * 1 - .5
    }
}

class Effect {
    constructor (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.particles = [];
        this.numberOfParticles = 300;
        this.createParticles()

        this.resize(this.width, this.height);

        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            radius: 150,
        }

        window.addEventListener("resize", e => {
            let {innerWidth, innerHeight} = e.currentTarget;
            this.resize(innerWidth, innerHeight, this.ctx);
        });
        window.addEventListener("mousemove", e => {
            this.mouse.x = e.x
            this.mouse.y = e.y
        })
        window.addEventListener("mousedown", e => this.mouse.pressed = true);
        window.addEventListener("mouseup", e => this.mouse.pressed = false);
    }

    createParticles () {
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this))
        }
    }

    handleParticles (ctx) {
        this.connectParticles(ctx)
        this.particles.forEach((particle) => {
            particle.update()
            particle.draw(ctx);
        })
    }

    connectParticles (ctx) {
        var maxDistance = 100
        for (let a = 0; a < this.numberOfParticles; a++) {
            for (let b = a; b < this.particles.length; b++) {
                let pa = this.particles[a]
                let pb = this.particles[b]
                let dis = distance(pa, pb)
                if (dis < maxDistance) {
                    ctx.save()
                    ctx.globalAlpha = 1 - dis / maxDistance;
                    ctx.beginPath();
                    ctx.moveTo(pb.x, pb.y);
                    ctx.lineTo(pa.x, pa.y)
                    ctx.stroke()
                    ctx.restore()
                }
            }
        }
    }

    resize (width, height) {
        let {ctx} = this
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, 'magenta');
        gradient.addColorStop(1, 'blue');
        ctx.fillStyle = gradient;
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 1;
        this.particles.forEach((particle) => particle.reset())
    }

    reset () {

    }
}

const effect = new Effect(canvas);
effect.handleParticles(ctx)

function animation () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.handleParticles(ctx)

    /* draw circle */
    let m = effect.mouse
    if (m.pressed) {
        ctx.save()
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2, false);
        ctx.globalAlpha = 0.8;
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }
    requestAnimationFrame(animation)
}

requestAnimationFrame(animation)