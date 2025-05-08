/**
 * The timer class is used to create a timer that can be started and stopped.
 */
let Timer = function (startTime, frameRate, countDown = false) {

    let frames = startTime * frameRate
    let interval = null

    /**
     * Starts the timer.
     * @param update The function to call when the timer is updated.
     */
    function start(update) {
        interval = setInterval(function () {
            frames += countDown ? -1 : 1
            update(frames / frameRate)

            if (countDown && frames <= 0) {
                clearInterval(interval)
                frames = 0
            }
        }, 1000 / frameRate)
    }

    return { start }
}