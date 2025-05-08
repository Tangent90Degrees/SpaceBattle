class ObjectPool {
    constructor(create) {
        this._create = create
        this._pool = []
        this._activated = []
    }

    get(pos) {
        let obj = this._pool.length > 0 ? this._pool.pop() : this._create()
        this._activated.push(obj)
        obj.pos = pos
        obj.pool = this
        obj.enabled = true
    }

    release(obj) {
        obj.enabled = false
        let index = this._activated.indexOf(obj)
        if (index > -1) this._activated.splice(index, 1)
        this._pool.push(obj)
    }

    update(time, delta) {
        this._activated.forEach(obj => {
            obj.update(time, delta)
        })
    }

    render(time) {
        this._activated.forEach(obj => obj.render(time))
    }
}