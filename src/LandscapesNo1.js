import { Midi } from '@tonejs/midi';
import { LandscapesGrid } from './classes/LandscapesGrid.js';
/** 
 * Inspiration:
 * https://openprocessing.org/sketch/1763409
 * https://codepen.io/KilledByAPixel/pen/BawBKqP
 * https://psychedelicscene.com/wp-content/uploads/2022/03/234-123-29078_1024x1024.webp
 */


/** 
 * Add your ogg and mid files in the audio director and update these file names
 */
const audio = new URL("@audio/landscapes-no-1.ogg", import.meta.url).href;
const midi = new URL("@audio/landscapes-no-1.mid", import.meta.url).href;

const LansacpessNo1 = (p) => {
    /** 
     * Core audio properties
     */
    p.song = null;
    p.PPQ = 3840 * 4;
    p.bpm = 127;
    p.audioLoaded = false;
    p.songHasFinished = false;

    /** 
     * Preload function - Loading audio and setting up MIDI
     * This runs first, before setup()
     */
    p.preload = () => {
        p.song = p.loadSound(audio, p.loadMidi);
        p.song.onended(() => p.songHasFinished = true);
    };

    p.colorPalette = null;

    p.landscapes = [];

    p.currentLandscapes = null;

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.colorPalette = p.generatePalette(6);
        p.rectMode(p.CENTER);
        p.landscapes = Array.from({ length: 46 }, () => new LandscapesGrid(p));
    };

    p.draw = () => {
        if(p.currentLandscapes && p.audioLoaded && p.song.isPlaying()){
            p.currentLandscapes.draw();
            p.currentLandscapes.update();
        }
    }

    /** 
     * MIDI loading and processing
     * Handles synchronization between audio and visuals
     */
    p.loadMidi = () => {
        Midi.fromUrl(midi).then((result) => {
            console.log('MIDI loaded:', result);
            const track1 = result.tracks[2].notes; // Waves Layer Edition - Multichord
            p.scheduleCueSet(track1, 'executeTrack1');
            document.getElementById("loader").classList.add("loading--complete");
            document.getElementById('play-icon').classList.add('fade-in');
            p.audioLoaded = true;
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
        const duration = (durationTicks / p.PPQ) * (60 / p.bpm);
        p.clear();
        p.currentLandscapes = p.landscapes[currentCue - 1];
        p.currentLandscapes.init(duration);
    };

    p.generatePalette = () => {
        p.colorMode(p.HSB, 360, 100, 100);
        const palette = [];
        
        // Base hues roughly matching example: pink/red, blue, yellow, dark
        const baseColors = [
            { h: p.random(340, 360), s: p.random(20, 50), b: p.random(85, 95) },  // soft pink
            { h: p.random(0, 20), s: p.random(50, 80), b: p.random(80, 90) },     // warm red
            { h: p.random(190, 210), s: p.random(50, 80), b: p.random(75, 85) },  // blue
            { h: p.random(50, 70), s: p.random(60, 90), b: p.random(80, 90) },    // yellow
        ];
        
        // Push base colors
        baseColors.forEach(c => palette.push(p.color(c.h, c.s, c.b)));
        
        // Add some dark muted colors (low brightness, medium saturation)
        for(let i=0; i<3; i++){
            const h = p.random(210, 270);
            const s = p.random(20, 40);
            const b = p.random(20, 40);
            palette.push(p.color(h, s, b));
        }
        
        // Add a couple of near-black or near-white accents
        palette.push(p.color(0, 0, 95)); // almost white
        palette.push(p.color(0, 0, 10)); // almost black
        
        p.colorMode(p.RGB, 255);
        return palette;
    };
          
      

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

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.currentLandscapes.updateGridForOrientation();
        p.redraw();
    };
};

export default LansacpessNo1;