const Sound = (function() {
    const sounds = {};

    // Load a sound file
    const load = function(name, src) {
        sounds[name] = new Audio(src);
    };

    // Play a sound
    const play = function(name) {
        if (sounds[name]) {
            sounds[name].currentTime = 0; // Reset to the start
            sounds[name].play().catch((error) => {
                console.error(`Failed to play sound "${name}":`, error);
            });
        }
    };

    // Pause a sound
    const pause = function(name) {
        if (sounds[name]) {
            sounds[name].pause();
        }
    };

    // Stop a sound
    const stop = function(name) {
        if (sounds[name]) {
            sounds[name].pause();
            sounds[name].currentTime = 0; // Reset to the start
        }
    };

    return { load, play, pause, stop };
})();
