import { Mountain  } from "./Mountain.js";
import { Tree } from "./Tree.js"; 
import { Orb } from "./Orb.js"; 

export class LandscapesGrid {
  constructor(p) {
    this.p = p;
    this.cols = 3;
    this.rows = 2;

    this.fullDisplay = false;

    this.colorsGrid = [];
    this.elements = [];
    
    
    this.generateElements();
    this.updateGridForOrientation();
  }

  init(duration) {
    this.duration = duration * 1000 * 0.95;
    this.birthTime = this.p.song.currentTime() * 1000;
    this.progress = 0;
  }

  setFullDisplayMode() {
    this.fullDisplay = true;
  }

  generateElements() {
    const p = this.p;
    this.cols = Math.floor(p.random(1, 5));
    this.rows = (this.cols === 1) ? Math.floor(p.random(1, 3)) : 
            (this.cols === 4) ? Math.floor(p.random(2, 4)) : 
                               Math.floor(p.random(1, 4)); 
    

    const palette = p.colorPalette || [p.color(180, 50, 100)];

    this.colorsGrid = [];
    
    let skyArray = [];
    let orbsArray = [];
    let mountainArray = [];
    let treeArray = [];

    for (let i = 0; i < this.cols; i++) {
      this.colorsGrid[i] = [];
      for (let j = 0; j < this.rows; j++) {
        // Get all colors that haven't been used yet
        const usedColors = [];
        for (let x = 0; x < this.cols; x++) {
          for (let y = 0; y < this.rows; y++) {
            if (this.colorsGrid[x] && this.colorsGrid[x][y]) {
              usedColors.push(this.colorsGrid[x][y]);
            }
          }
        }
        
        // Filter out used colors
        const availableColors = palette.filter(c => !usedColors.includes(c));
        
        // If we run out of colors, start over with the full palette
        const colorsToChooseFrom = availableColors.length > 0 ? availableColors : palette;
        let chosenColor = colorsToChooseFrom[p.floor(p.random(colorsToChooseFrom.length))];
    
        this.colorsGrid[i][j] = chosenColor;
      }
    }

    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        
        // Add sky element
        skyArray.push({
          elementType: 'sky',
          gridI: i,
          gridJ: j,
          color: this.colorsGrid[i][j]
        });

        let currentSkyColor = this.colorsGrid[i][j];

        const orb = new Orb({
          p,
          gridI: i,
          gridJ: j,
          rows: this.rows,
          cols: this.cols,
          skyColorForComplement: currentSkyColor
        });

        orbsArray.push(orb);

        // Add mountains
        const skyColor = this.colorsGrid[i][j];
        const mountainColor = this.getMountainColor(skyColor, palette);
        const mountainCount = p.int(p.random(2, 4));

        for (let m = 0; m < mountainCount; m++) {
          const mw = p.random(p.width / this.cols * 0.15, p.width / this.cols * 0.3);
          const mh = p.random(p.height / this.rows * 0.12, p.height / this.rows * 0.27); 
          const mx = p.random(0.1, 0.9);
          const my = p.random(0.3, 1.0);

          const mountain = new Mountain(
            p, 
            { 
              gridI: i, 
              gridJ: j, 
              cols: this.cols, 
              color: mountainColor, 
              mw, 
              mh, 
              mx, 
              my 
            }
          );
          mountainArray.push(mountain);
        }

        // Add trees
        const treeCount = p.int(p.random(5, 10));
        for (let t = 0; t < treeCount; t++) {
          const tree = new Tree({
            p,
            gridI: i,
            gridJ: j,
            tw: p.random(6, 12),
            tx: p.random(0.1, 0.9),
          });
          treeArray.push(tree);
        }
      }
    }

    // Shuffle each group
    skyArray = p.shuffle(skyArray);
    orbsArray = p.shuffle(orbsArray);
    mountainArray = p.shuffle(mountainArray);
    treeArray = p.shuffle(treeArray);

    // Concatenate groups in order
    this.elements = skyArray.concat(orbsArray, mountainArray, treeArray);
  }

  getMountainColor(skyColor, palette) {
    const p = this.p;
    const blackColor = p.color(0);
    const whiteColor = p.color(255);
    
    // Filter out colors that are too similar to sky, black, or white
    const validColors = palette.filter(color => {
      const colorDistanceFromSky = this.colorDistance(color, skyColor);
      const colorDistanceFromBlack = this.colorDistance(color, blackColor);
      const colorDistanceFromWhite = this.colorDistance(color, whiteColor);
      
      return colorDistanceFromSky > 50 && colorDistanceFromBlack > 50 && colorDistanceFromWhite > 50;
    });
    
    // If no valid colors found, create a modified version of a palette color
    if (validColors.length === 0) {
      const baseColor = palette[p.floor(p.random(palette.length))];
      const r = p.constrain(p.red(baseColor) + p.random(-50, 50), 50, 200);
      const g = p.constrain(p.green(baseColor) + p.random(-50, 50), 50, 200);
      const b = p.constrain(p.blue(baseColor) + p.random(-50, 50), 50, 200);
      return p.color(r, g, b);
    }
    
    return validColors[p.floor(p.random(validColors.length))];
  }

  colorDistance(color1, color2) {
    const p = this.p;
    const r1 = p.red(color1), g1 = p.green(color1), b1 = p.blue(color1);
    const r2 = p.red(color2), g2 = p.green(color2), b2 = p.blue(color2);
    
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  }

  update() {
    const currentTime = this.p.song.currentTime() * 1000;
    const elapsed = currentTime - this.birthTime;
    const rawProgress = elapsed / this.duration;
    this.progress = this.p.constrain(rawProgress, 0, 1);
  }

  updateGridForOrientation() {
    const p = this.p;
    if (p.height > p.width) {
      const tmp = this.cols;
      this.cols = this.rows;
      this.rows = tmp;
    }
  }

  draw() {
    const p = this.p;
    const cellWidth = p.width / this.cols;
    const cellHeight = p.height / this.rows;
  
    p.push();
  
    // Corrected property name for full display mode
    const elementsToShow = this.fullDisplay ?
      this.elements.length : // Show all elements if fullDisplay is true
      Math.floor(this.elements.length * this.progress); // Otherwise, show based on progress
  
    for (let i = 0; i < elementsToShow; i++) {
      const element = this.elements[i];
  
      let effectiveGridI = element.gridI;
      let effectiveGridJ = element.gridJ;
  
      // Adjust grid indices if screen is in portrait orientation
      if (p.height > p.width) {
        effectiveGridI = element.gridJ;
        effectiveGridJ = element.gridI;
      }
  
      const x = effectiveGridI * cellWidth;
      const y = effectiveGridJ * cellHeight;
  
      if (element.elementType === 'sky') {
        this.drawSky(x, y, cellWidth, cellHeight, element);
      } else {
        element.draw(x, y, cellWidth, cellHeight);
      }
    }
  
    // Draw grid borders
    for (let i = 0; i < this.cols; i++) {
      for (let j = 0; j < this.rows; j++) {
        const x = i * cellWidth;
        const y = j * cellHeight;
        p.noFill();
        p.stroke(0);
        p.strokeWeight(4);
        p.rect(x + cellWidth / 2, y + cellHeight / 2, cellWidth, cellHeight);
      }
    }
  
    p.pop();
  }

  drawSky(x, y, w, h, element) {
    const p = this.p;
    const { color } = element;
    
    p.noStroke();
    p.fill(color);
    p.rect(x + w / 2, y + h / 2, w, h);
  }
}