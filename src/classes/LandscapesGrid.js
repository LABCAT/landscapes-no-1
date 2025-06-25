export class LandscapesGrid {
    constructor(p, duration) {
      this.p = p;
      this.baseCols = 3;
      this.baseRows = 2;
  
      this.colorsGrid = [];
      this.elements = [];  // Single array to hold all drawable elements
      
      // Progress system
      this.duration = duration * 1000;
      this.birthTime = p.song.currentTime() * 1000;

      this.updateGridForOrientation();
      this.generateElements();
    }
  
    /** Update grid size and precompute all randomness */
    generateElements() {
      const p = this.p;
      this.baseCols = p.int(p.random(2, 5));
      this.baseRows = 2;
  
      const palette = p.colorPalette || [p.color(180, 50, 100)];
  
      this.colorsGrid = [];
      this.elements = [];
  
      // First populate the colors grid (still needed for sky backgrounds)
      for (let i = 0; i < this.cols; i++) {
        this.colorsGrid[i] = [];
        for (let j = 0; j < this.rows; j++) {
          this.colorsGrid[i][j] = palette[p.floor(p.random(palette.length))];
        }
      }
  
      // Now populate all elements into a single array
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          
          // Add orb element
          const orbCol = palette[p.floor(p.random(palette.length))];
          const orbs = ["sun", "moon"];
          const type = orbs[p.int(p.random(orbs.length))];
          const orbSize = p.random(10, p.width / this.cols * 0.3);
          const ox = p.random(0.25, 0.75);
          const oy = p.random(0.25, 0.75);
          let craterData = [];
          if (type === "moon") {
            const craterCount = p.int(p.random(5, 10));
            for (let c = 0; c < craterCount; c++) {
              craterData.push({
                cxOffset: p.random(-0.5, 0.5),
                cyOffset: p.random(-0.5, 0.5),
                cr: orbSize / p.random(3, 10),
              });
            }
          }
          
          this.elements.push({
            elementType: 'orb',
            gridI: i,
            gridJ: j,
            color: orbCol,
            type,
            size: orbSize,
            ox,
            oy,
            craterData,
          });
  
          // Add mountain elements
          const mountainCount = p.int(p.random(3, 8));
          for (let m = 0; m < mountainCount; m++) {
            this.elements.push({
              elementType: 'mountain',
              gridI: i,
              gridJ: j,
              mw: p.random(25, p.width / this.cols * 0.35),
              mh: p.random(5, p.height / this.rows * 0.35),
              mx: p.random(1.4) - 0.2,
              my: p.random(1.4) - 0.2,
            });
          }
  
          // Add tree elements
          const treeCount = p.int(p.random(20, 30));
          for (let t = 0; t < treeCount; t++) {
            this.elements.push({
              elementType: 'tree',
              gridI: i,
              gridJ: j,
              tw: p.random(2, 10),
              thRatio: p.random(2, 5),
              tx: p.random(1.4) - 0.2,
              ty: p.random(1.4) - 0.2,
            });
          }
        }
      }
    }
    
    /** Update progress based on time */
    update() {
      const currentTime = this.p.song.currentTime() * 1000;
      const elapsed = currentTime - this.birthTime;
      const rawProgress = elapsed / this.duration;

      this.progress = this.p.constrain(rawProgress, 0, 1);
    }
  
    /** Update cols and rows based on orientation */
    updateGridForOrientation() {
      const p = this.p;
      if (p.height > p.width) {
        this.cols = this.baseRows;
        this.rows = this.baseCols;
      } else {
        this.cols = this.baseCols;
        this.rows = this.baseRows;
      }
    }
  
    /** Draw the entire landscape grid */
    draw() {
      const p = this.p;
      const w = p.width / this.cols;
      const h = p.height / this.rows;
  
      p.push();
      p.resetMatrix();
      p.translate(-p.width / 2, -p.height / 2);
  
      // Draw sky backgrounds for all cells
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          const x = i * w;
          const y = j * h;
          const skyColor = this.colorsGrid[i][j];
          this.drawSky(x, y, w, h, skyColor);
        }
      }
  
      const elementsToShow = Math.floor(this.elements.length * this.progress);

      // Draw elements up to the progress limit
      for (let i = 0; i < elementsToShow; i++) {
        const element = this.elements[i];
        const x = element.gridI * w;
        const y = element.gridJ * h;
        
        if (element.elementType === 'orb') {
          this.drawOrb(x, y, w, h, element);
        } else if (element.elementType === 'mountain') {
          this.drawMountain(x, y, w, h, element);
        } else if (element.elementType === 'tree') {
          this.drawTree(x, y, w, h, element);
        }
      }
  
      // Draw grid borders
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          const x = i * w;
          const y = j * h;
          p.noFill();
          p.stroke(0);
          p.rect(x + w / 2, y + h / 2, w, h);
        }
      }
  
      p.pop();
    }
  
    /** Draw an orb from element data */
    drawOrb(x, y, w, h, element) {
      const p = this.p;
      const { color, type, size, ox, oy, craterData } = element;
  
      let orb = p.createGraphics(w, h);
  
      let orbSize = size;
      let posX = ox * orb.width;
      let posY = oy * orb.height;
  
      p.colorMode(p.RGB, 255, 255, 255, 1);
      let c = p.color(color);
      let opacity = 0.2;
      c.setAlpha(opacity);
      orb.noStroke();
      orb.fill(c);
      let glow = orbSize * 0.3;
      orb.circle(posX, posY, orbSize + glow);
  
      c.setAlpha(1);
      orb.fill(c);
      orb.stroke(9);
      orb.strokeWeight(1.5);
      orb.circle(posX, posY, orbSize);
  
      if (type === "moon") {
        let crater = p.createGraphics(w, h);
        crater.noStroke();
        crater.fill(150, 150, 150, 50);
        craterData.forEach(({ cxOffset, cyOffset, cr }) => {
          crater.circle(
            posX + cxOffset * orbSize,
            posY + cyOffset * orbSize,
            cr
          );
        });
        orb.image(crater, 0, 0);
      }
  
      p.image(orb, x, y);
    }
  
    /** Draw sky rectangle */
    drawSky(x, y, w, h, col) {
      const p = this.p;
      const g = p.createGraphics(w, h);
      g.noStroke();
      g.fill(col);
      g.rect(0, 0, w, h);
      p.image(g, x, y);
    }
  
    /** Draw a single mountain from element data */
    drawMountain(x, y, w, h, element) {
      const p = this.p;
      const { mw, mh, mx, my } = element;
      
      const grfx = p.createGraphics(w, h);
      grfx.rectMode(p.CENTER);
      grfx.fill(100, 100, 100);
      grfx.stroke(9);
      grfx.strokeWeight(1.5);
  
      const posX = mx * grfx.width;
      const posY = my * grfx.height;
  
      grfx.beginShape();
      grfx.vertex(posX + mw, grfx.height);
      grfx.vertex(posX, grfx.height - mh);
      grfx.vertex(posX - mw, grfx.height);
      grfx.endShape(p.CLOSE);
  
      p.image(grfx, x, y);
    }
  
    /** Draw a single tree from element data */
    drawTree(x, y, w, h, element) {
      const p = this.p;
      const { tw, thRatio, tx, ty } = element;
      
      const grfx = p.createGraphics(w, h);
      grfx.noStroke();
      grfx.fill(50, 150, 50);
  
      const th = tw * thRatio;
      const posX = tx * grfx.width;
      const posY = ty * grfx.height;
  
      grfx.beginShape();
      grfx.vertex(posX + tw, grfx.height);
      grfx.vertex(posX, grfx.height - th);
      grfx.vertex(posX - tw, grfx.height);
      grfx.endShape(p.CLOSE);
  
      p.image(grfx, x, y);
    }
  }