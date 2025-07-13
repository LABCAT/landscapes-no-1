import { Midi } from '@tonejs/midi';
import { LandscapesGrid } from './classes/LandscapesGrid.js';
/** 
 * Inspiration:
 * https://openprocessing.org/sketch/1763409
 * https://codepen.io/KilledByAPixel/pen/BawBKqP
 * https://psychedelicscene.com/wp-content/uploads/2022/03/234-123-29078_1024x1024.webp
 */

// Use the Vite base URL for compatibility with dev, GitHub Pages, and fxhash
const base = import.meta.env.BASE_URL || './';
const audio = base + 'audio/landscapes-no-1.ogg';
const midi = base + 'audio/landscapes-no-1.mid';

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
        // Use $fx from fxhash.min.js
        let seed = 12345;
        let fxhash = null;
        if (typeof window !== 'undefined' && window.$fx && window.$fx.hash) {
            fxhash = window.$fx.hash;
            // Use the first 16 characters of the hash as a hex seed, or hashCode fallback
            seed = parseInt(fxhash.slice(2, 16), 16) || Array.from(fxhash).reduce((acc, c) => acc + c.charCodeAt(0), 0);
        }
        p.randomSeed(seed);
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.colorPalette = p.generatePalette(6);
        p.rectMode(p.CENTER);
        p.landscapes = Array.from({ length: 46 }, () => new LandscapesGrid(p));
        p.showingStatic = true;
    };

    p.draw = () => {
        if (p.showingStatic) {
            p.background(255);
            if (p.landscapes.length > 0) {
                p.landscapes[0].fullDisplay = true;
                p.landscapes[0].draw();
            }
        } else if(p.currentLandscapes && p.audioLoaded && p.song.isPlaying()){
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

        if(currentCue % 9 > 5) {
            p.currentLandscapes.setFullDisplayMode();
        }
        else {
            p.currentLandscapes.fullDisplay = false;
            p.currentLandscapes.init(duration);
        }
    };

    p.generatePalette = () => {
        p.colorMode(p.HSB, 360, 100, 100);
        const palette = [];
        
        // Base colors: pink/red, blue, yellow, green, purple, orange
        const baseColors = [
            { h: p.random(340, 360), s: p.random(20, 50), b: p.random(85, 95) },  // soft pink
            { h: p.random(0, 20), s: p.random(50, 80), b: p.random(80, 90) },     // warm red
            { h: p.random(190, 210), s: p.random(50, 80), b: p.random(75, 85) },  // blue
            { h: p.random(50, 70), s: p.random(60, 90), b: p.random(80, 90) },    // yellow
            { h: p.random(100, 140), s: p.random(40, 70), b: p.random(70, 85) },  // green
            { h: p.random(270, 290), s: p.random(40, 70), b: p.random(70, 85) },  // purple
            { h: p.random(20, 40), s: p.random(60, 90), b: p.random(80, 90) },    // orange
            { h: p.random(160, 180), s: p.random(30, 60), b: p.random(75, 85) },  // teal
        ];
        
        // Push base colors
        baseColors.forEach(c => palette.push(p.color(c.h, c.s, c.b)));
        
        // Add 4 more varied colors
        for(let i=0; i<4; i++){
            const h = p.random(360);
            const s = p.random(30, 80);
            const b = p.random(60, 90);
            palette.push(p.color(h, s, b));
        }
        
        // Shuffle the palette to randomize order
        p.shuffle(palette);
        
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
                p.showingStatic = false;
                p.currentLandscapes = p.landscapes[0];
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