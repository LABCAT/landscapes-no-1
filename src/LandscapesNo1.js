import { Midi } from '@tonejs/midi';
/** 
 * Inspiration:
 * https://openprocessing.org/sketch/1763409
 * https://codepen.io/KilledByAPixel/pen/BawBKqP
 * https://psychedelicscene.com/wp-content/uploads/2022/03/234-123-29078_1024x1024.webp
 */


/** 
 * Add your ogg and mid files in the audio director and update these file names
 */
// const audio = new URL("@audio/polygons-no-4.ogg", import.meta.url).href;
// const midi = new URL("@audio/polygons-no-4.mid", import.meta.url).href;

const PolygonsNo4 = (p) => {
    /** 
     * Core audio properties
     */
    p.song = null;
    p.bpm = 127;
    p.audioLoaded = false;
    p.songHasFinished = false;

    /** 
     * Preload function - Loading audio and setting up MIDI
     * This runs first, before setup()
     */
    p.preload = () => {
        // p.song = p.loadSound(audio, p.loadMidi);
        // p.song.onended(() => p.songHasFinished = true);
    };

    p.setup = () => {
        // Use WebGL for better performance
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        document.getElementById("loader").classList.add("loading--complete");
        p.noFill();
        p.colorMode(p.HSB);
        p.rectMode(p.CENTER);
    };

    p.draw = () => {
        if(p.audioLoaded && p.song.isPlaying()){

        }
    }

    /** 
     * MIDI loading and processing
     * Handles synchronization between audio and visuals
     */
    p.loadMidi = () => {
        Midi.fromUrl(midi).then((result) => {
            // console.log('MIDI loaded:', result);
            // const track1 = result.tracks[3].notes; // Combinator - Loading Screen
            // p.scheduleCueSet(track1, 'executeTrack1');
            // const track2 = result.tracks[4].notes; // Europa - Cinematic Pulse
            // p.scheduleCueSet(track2, 'executeTrack2');
            // const controlChanges = Object.assign({},result.tracks[5].controlChanges); // Cinematic Pulse Filter
            // const track3 = controlChanges[Object.keys(controlChanges)[0]];
            // p.scheduleCueSet(track3, 'executeTrack3');
            // document.getElementById("loader").classList.add("loading--complete");
            // document.getElementById('play-icon').classList.add('fade-in');
            // p.audioLoaded = true;
        });
    };

    /** 
     * Schedule MIDI cues to trigger animations
     * @param {Array} noteSet - Array of MIDI notes
     * @param {String} callbackName - Name of the callback function to execute
     * @param {Boolean} polyMode - Allow multiple notes at same time if true
     */
    p.scheduleCueSet = (noteSet, callbackName, polyMode = false) => {
        let lastTicks = -1,
            currentCue = 1;
        for (let i = 0; i < noteSet.length; i++) {
            const note = noteSet[i],
                { ticks, time } = note;
            if(ticks !== lastTicks || polyMode){
                note.currentCue = currentCue;
                p.song.addCue(time, p[callbackName], note);
                lastTicks = ticks;
                currentCue++;
            }
        }
    }

    p.executeTrack1 = (note) => {
        const { currentCue, durationTicks } = note;
        
    };

    p.bubblePolygons = [];

    /** 
     * Handle mouse/touch interaction
     * Controls play/pause and reset functionality
     */
    p.mousePressed = () => {
        if(p.audioLoaded){
            if (p.song.isPlaying()) {
                p.song.pause();
            } else {
                if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                    /** 
                     * Reset animation properties here
                     */
                }
                document.getElementById("play-icon").classList.remove("fade-in");
                p.song.play();
            }
        }
    }
};

export default PolygonsNo4;