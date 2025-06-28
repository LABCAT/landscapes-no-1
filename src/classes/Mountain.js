import { Glyph } from "./Glyph.js";

export class Mountain {
  constructor(p, options) {
    this.p = p;
    this.gridI = options.gridI;
    this.gridJ = options.gridJ;
    this.color = options.color;
    this.mw = options.mw; // half width in px
    this.mh = options.mh; // height in px
    this.mx = options.mx; // relative x inside cell
    this.my = options.my; // relative y inside cell
    this.cols = options.cols;

    this.glyphs = [];

    this.generateGlyphs();
  }

  generateGlyphs() {
    const p = this.p;
    const glyphs = [];
  
    const minSize = this.mw * 0.05;
    const step = minSize / p.width; // relative grid step size
  
    const v0 = { x: this.mx - this.mw / p.width, y: this.my + this.mh / p.height };
    const v1 = { x: this.mx + this.mw / p.width, y: this.my + this.mh / p.height };
    const v2 = { x: this.mx, y: this.my - this.mh / p.height };
  
    const occupied = [];
  
    for (let gy = 1; gy >= 0; gy -= step) {
      for (let gx = 0; gx <= 1; gx += step) {
        const cx = gx + step / 2;
        const cy = gy - step / 2;
  
        if (!this.pointInTriangle({ x: cx, y: cy }, v0, v1, v2)) continue;
  
        const sizeFactor = p.random([1, 2, 3]);
        const s = minSize * sizeFactor;
  
        const relRadius = (s / 2) / p.width;
        const collides = occupied.some(pt =>
          p.dist(pt.x, pt.y, cx, cy) < (pt.r + relRadius)
        );
        if (collides) continue;
  
        occupied.push({ x: cx, y: cy, r: relRadius });
  
        glyphs.push(new Glyph({
          p,
          color: this.color,
          size: s,
          gx: cx,
          gy: cy,
          gridI: this.gridI,
          gridJ: this.gridJ,
        }));
      }
    }
  
    this.glyphs = glyphs;
  }
  
  
  
  pointInTriangle(p, a, b, c) {
    const area = 0.5 * (-b.y * c.x + a.y * (-b.x + c.x) + a.x * (b.y - c.y) + b.x * c.y);
    const s = (1 / (2 * area)) * (a.y * c.x - a.x * c.y + (c.y - a.y) * p.x + (a.x - c.x) * p.y);
    const t = (1 / (2 * area)) * (a.x * b.y - a.y * b.x + (a.y - b.y) * p.x + (b.x - a.x) * p.y);
    return s >= 0 && t >= 0 && s + t <= 1;
  }
  
  
  
  

  draw(x, y, w, h) {
  const p = this.p;
  p.push();
  p.stroke(255, 0, 0);
  p.noFill();
  const posX = x + this.mx * w;
  const posY = y + this.my * h;
  p.beginShape();
  p.vertex(posX + this.mw, y + h);
  p.vertex(posX, posY - this.mh);
  p.vertex(posX - this.mw, y + h);
  p.endShape(p.CLOSE);
  p.pop();

//   console.log(this.glyphs);
  

  this.glyphs.forEach(glyph => glyph.draw(x, y, w, h));
}

}
