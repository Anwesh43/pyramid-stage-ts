const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.02
const sizeFactor : number = 2.9
const foreColor : string = "673AB7"
const backColor : string = "#BDBDBD"
const nodes : number = 5
const delay : number = 20

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }
}

class DrawingUtil {

    static drawPyramids(context : CanvasRenderingContext2D, total : number, w : number, size : number, scale : number) {
        const gap : number = w / (total + 1)
        for (var j = 0; j < total; j++) {
            const sc : number = ScaleUtil.divideScale(scale, j, total)
            const updatedSize : number = size * sc
            context.save()
            context.translate(gap * (j + 1), 0)
            context.rotate(Math.PI / 2 * sc)
            context.fillRect(-updatedSize, -updatedSize, 2 * updatedSize, 2 * updatedSize)
            context.restore()
        }
    }

    static drawPyramidNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const gap : number = h / (nodes + 1)
        const size : number = gap / sizeFactor
        context.fillStyle = foreColor
        context.save()
        context.translate(0, h * (i + 1))
        DrawingUtil.drawPyramids(context, i, w, size, scale)
        context.restore()
    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += this.dir * scGap
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.prevScale = this.scale
            this.dir = 0
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class PyramidNode {

    next : PyramidNode
    prev : PyramidNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new PyramidNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawPyramidNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : PyramidNode {
        var curr : PyramidNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class Pyramids {

    curr : PyramidNode = new PyramidNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
