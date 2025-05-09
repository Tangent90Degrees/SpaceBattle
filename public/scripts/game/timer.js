/**
 * The timer class is used to create a timer that can be started and stopped.
 */
class Timer {
    constructor(startTime, frameRate, countDown = false) {
        this._frames = startTime * frameRate
        this._frameRate = frameRate
        this._countDown = countDown
        this._interval = null
    }

    start(update) {
        let timer = this
        this._interval = setInterval(function () {
            timer._frames += timer._countDown ? -1 : 1
            update(timer._frames / timer._frameRate, 1 / timer._frameRate)

            if (timer._countDown && timer._frames <= 0) {
                clearInterval(timer._interval)
                timer._frames = 0
            }
        }, 1000 / this._frameRate)
    }

    stop() {
        clearInterval(this._interval)
        this._interval = null
    }
}