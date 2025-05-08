/**
 * The timer class is used to create a timer that can be started and stopped.
 */
class Timer {

    /**
     * The constructor of the timer class.
     * @param start The start time in seconds.
     * @param frameRate The frame rate of the timer.
     * @param countDown If true, the timer will count down from the start time.
     */
    constructor(start, frameRate, countDown = false) {
        self._frames = start * frameRate
        self._frameRate = frameRate
        self._countDown = countDown
    }

    /**
     * Starts the timer.
     * @param update The function to call when the timer is updated.
     */
    start(update) {
        self.interval = setInterval(function () {
            self._frames += self._countDown ? -1 : 1
            update(self._frames / self._frameRate)

            if (self._countDown && self._frames <= 0) {
                clearInterval(self.interval)
                self._frames = 0
            }
        }, 1000 / self._frameRate)
    }
}