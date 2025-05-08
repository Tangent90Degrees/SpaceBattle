class ObjectPool {
    constructor(create) {
        this._create = create
        this._pool = []
        this._activated = []
    }

    get(pos) {
        let obj = this._pool.length > 0 ? this._pool.pop() : this._create(pos)
        obj.pool = this
        obj.pos = pos
        obj.enabled = true
        this._activated.push(obj)
        console.log("ObjectPool get", obj)
    }

    release(obj) {
        obj.enabled = false
        let index = this._activated.indexOf(obj)
        if (index > -1) this._activated.splice(index, 1)
        this._pool.push(obj)
        console.log("ObjectPool release", obj)
    }

    forEach(callback) {
        this._activated.forEach(callback)
    }

    update(time, delta) {
        this._activated.forEach(obj => obj.update(time, delta))
    }

    render(time) {
        this._activated.forEach(obj => obj.render(time))
    }
}