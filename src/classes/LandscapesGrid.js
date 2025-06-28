export class LandscapesGrid {
  constructor(p) {
    this.p = p;
    this.cols = 3;
    this.rows = 2;

    this.colorsGrid = [];
    this.elements = [];

    this.updateGridForOrientation();
    this.generateElements();
  }

  init(duration) {
    this.duration = duration * 1000 * 0.9;
    this.birthTime = this.p.song.currentTime() * 1000;
    this.progress = 0;
  }

  generateElements() {
    const p = this.p;
    this.cols = Math.floor(p.random(2, 5));
    this.rows = Math.floor(p.random(2, 4));

    const palette = p.colorPalette || [p.color(180, 50, 100)];

    this.colorsGrid = [];
    
    let skyArray = [];
    let orbsArray = [];
    let mountainArray = [];
    let treeArray = [];

    for (let i = 0; i < this.cols; i++) {
      this.colorsGrid[i] = [];
      for (let j = 0; j < this.rows; j++) {
        this.colorsGrid[i][j] = palette[p.floor(p.random(palette.length))];
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

        // Add orb
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

        orbsArray.push({
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

        // Add mountains
        const mountainColor = palette[p.floor(p.random(palette.length))];
        const mountainCount = p.int(p.random(3, 8));
        for (let m = 0; m < mountainCount; m++) {
          mountainArray.push({
            elementType: 'mountain',
            gridI: i,
            gridJ: j,
            color: mountainColor,
            mw: p.random(p.width / this.cols * 0.15, p.width / this.cols * 0.3),
            mh: p.random(p.height / this.rows * 0.15, p.height / this.rows * 0.25),
            mx: p.random(0.1, 0.9),
            my: p.random(0.6, 1.0),
          });
        }

        // Add trees
        const treeColor = palette[p.floor(p.random(palette.length))];
        const treeCount = p.int(p.random(20, 30));
        for (let t = 0; t < treeCount; t++) {
          treeArray.push({
            elementType: 'tree',
            gridI: i,
            gridJ: j,
            color: treeColor,
            tw: p.random(6, 12),
            thRatio: p.random(0.1, 0.3),
            tx: p.random(0.1, 0.9),
            ty: p.random(0.7, 1.0),
          });
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

    console.log(this.elements);
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
    const w = p.width / this.cols;
    const h = p.height / this.rows;

    p.push();

    const elementsToShow = Math.floor(this.elements.length * this.progress);

    for (let i = 0; i < elementsToShow; i++) {
      const element = this.elements[i];
      const x = element.gridI * w;
      const y = element.gridJ * h;

      if (element.elementType === 'sky') {
        this.drawSky(x, y, w, h, element);
      } else if (element.elementType === 'orb') {
        this.drawOrb(x, y, w, h, element);
      } else if (element.elementType === 'mountain') {
        this.drawMountain(x, y, w, h, element);
      } else if (element.elementType === 'tree') {
        this.drawTree(x, y, w, h, element);
      }
    }

    // Grid borders
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

  drawSky(x, y, w, h, element) {
    const p = this.p;
    const { color } = element;
    
    p.noStroke();
    p.fill(color);
    p.rect(x + w / 2, y + h / 2, w, h);
  }

  drawOrb(x, y, w, h, element) {
    const p = this.p;
    const { color, type, size, ox, oy, craterData } = element;

    let orbSize = size;
    let posX = x + ox * w;
    let posY = y + oy * h;

    let c = p.color(color);
    c.setAlpha(0.2);
    p.noStroke();
    p.fill(c);
    let glow = orbSize * 0.3;
    p.circle(posX, posY, orbSize + glow);

    c.setAlpha(1);
    p.fill(c);
    p.stroke(9);
    p.strokeWeight(1.5);
    p.circle(posX, posY, orbSize);

    if (type === "moon") {
      p.noStroke();
      p.fill(150, 150, 150, 50);
      craterData.forEach(({ cxOffset, cyOffset, cr }) => {
        p.circle(posX + cxOffset * orbSize, posY + cyOffset * orbSize, cr);
      });
    }
  }

  drawMountain(x, y, w, h, element) {
    const p = this.p;
    const { mw, mh, mx, my, color } = element;

    p.push();
    p.rectMode(p.CENTER);
    p.fill(color);
    p.stroke(9);
    p.strokeWeight(1.5);

    const posX = x + mx * w + w / 2;
    const posY = y + h - (1 - my) * mh;

    p.beginShape();
    p.vertex(posX + mw, y + h);
    p.vertex(posX, posY - mh);
    p.vertex(posX - mw, y + h);
    p.endShape(p.CLOSE);

    p.pop();
  }

  drawTree(x, y, w, h, element) {
    const p = this.p;
    const { tw, thRatio, tx, ty, color } = element;

    p.push();
    p.noStroke();
    p.fill(color);

    const th = tw * thRatio * 0.3;
    const posX = x + tx * w;
    const posY = y + h - (1 - ty) * h * 0.3;

    p.beginShape();
    p.vertex(posX + tw, y + h);
    p.vertex(posX, posY - th);
    p.vertex(posX - tw, y + h);
    p.endShape(p.CLOSE);

    p.pop();
  }
}