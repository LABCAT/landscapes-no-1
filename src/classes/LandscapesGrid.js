export class LandscapesGrid {
    constructor(p) {
      this.p = p;
      this.baseCols = 3;
      this.baseRows = 2;
  
      this.colorsGrid = [];
      this.orbDataGrid = [];       // will hold orb info: { color, type, size, pos, craterData }
      this.mountainDataGrid = [];  // array of mountain shapes per cell
      this.treeDataGrid = [];      // array of tree shapes per cell
  
      this.update();
    }
  
    /** Update grid size and precompute all randomness */
    update() {
      const p = this.p;
      this.baseCols = p.int(p.random(2, 5));
      this.baseRows = 2;
      this.updateGridForOrientation();
  
      const palette = p.colorPalette || [p.color(180, 50, 100)];
  
      this.colorsGrid = [];
      this.orbDataGrid = [];
      this.mountainDataGrid = [];
      this.treeDataGrid = [];
  
      for (let i = 0; i < this.cols; i++) {
        this.colorsGrid[i] = [];
        this.orbDataGrid[i] = [];
        this.mountainDataGrid[i] = [];
        this.treeDataGrid[i] = [];
  
        for (let j = 0; j < this.rows; j++) {
          // Colors
          this.colorsGrid[i][j] = palette[p.floor(p.random(palette.length))];
  
          // Orb data
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
                cxOffset: p.random(-0.5, 0.5), // relative to orbSize
                cyOffset: p.random(-0.5, 0.5),
                cr: orbSize / p.random(3, 10),
              });
            }
          }
          this.orbDataGrid[i][j] = {
            color: orbCol,
            type,
            size: orbSize,
            ox,
            oy,
            craterData,
          };
  
          // Mountain data (array of mountain shapes)
          const mountainCount = p.int(p.random(3, 8));
          let mountains = [];
          for (let m = 0; m < mountainCount; m++) {
            mountains.push({
              mw: p.random(25, p.width / this.cols * 0.35),
              mh: p.random(5, p.height / this.rows * 0.35),
              mx: p.random(1.4) - 0.2, // relative to width
              my: p.random(1.4) - 0.2, // relative to height
            });
          }
          this.mountainDataGrid[i][j] = mountains;
  
          // Tree data (array of tree shapes)
          const treeCount = p.int(p.random(20, 30));
          let trees = [];
          for (let t = 0; t < treeCount; t++) {
            trees.push({
              tw: p.random(2, 10),
              thRatio: p.random(2, 5),
              tx: p.random(1.4) - 0.2,
              ty: p.random(1.4) - 0.2,
            });
          }
          this.treeDataGrid[i][j] = trees;
        }
      }
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
  
      for (let i = 0; i < this.cols; i++) {
        for (let j = 0; j < this.rows; j++) {
          const x = i * w;
          const y = j * h;
  
          const skyColor = this.colorsGrid[i][j];
          const orbData = this.orbDataGrid[i][j];
          const mountainData = this.mountainDataGrid[i][j];
          const treeData = this.treeDataGrid[i][j];
  
          this.drawSky(x, y, w, h, skyColor);
          this.drawOrb(x, y, w, h, orbData);
          this.drawMountains(x, y, w, h, mountainData);
          this.drawTrees(x, y, w, h, treeData);
  
          p.noFill();
          p.stroke(0);
          p.rect(x + w / 2, y + h / 2, w, h);
        }
      }
  
      p.pop();
    }
  
    /** Draw an orb from precomputed data */
    drawOrb(x, y, w, h, orbData) {
      const p = this.p;
      const { color, type, size, ox, oy, craterData } = orbData;
  
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
  
    /** Draw precomputed mountain shapes */
    drawMountains(x, y, w, h, mountains) {
      const p = this.p;
      const grfx = p.createGraphics(w, h);
      grfx.rectMode(p.CENTER);
      grfx.fill(100, 100, 100); // Default mountain color or pass as param if needed
      grfx.stroke(9);
      grfx.strokeWeight(1.5);
  
      mountains.forEach(({ mw, mh, mx, my }) => {
        const posX = mx * grfx.width;
        const posY = my * grfx.height;
  
        grfx.beginShape();
        grfx.vertex(posX + mw, grfx.height);
        grfx.vertex(posX, grfx.height - mh);
        grfx.vertex(posX - mw, grfx.height);
        grfx.endShape(p.CLOSE);
      });
  
      p.image(grfx, x, y);
    }
  
    /** Draw precomputed tree shapes */
    drawTrees(x, y, w, h, trees) {
      const p = this.p;
      const grfx = p.createGraphics(w, h);
      grfx.noStroke();
      grfx.fill(50, 150, 50); // Default tree color or pass as param if needed
  
      trees.forEach(({ tw, thRatio, tx, ty }) => {
        const th = tw * thRatio;
        const posX = tx * grfx.width;
        const posY = ty * grfx.height;
  
        grfx.beginShape();
        grfx.vertex(posX + tw, grfx.height);
        grfx.vertex(posX, grfx.height - th);
        grfx.vertex(posX - tw, grfx.height);
        grfx.endShape(p.CLOSE);
      });
  
      p.image(grfx, x, y);
    }
  }
  