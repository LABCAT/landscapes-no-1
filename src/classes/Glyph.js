export class Glyph {
    constructor({ p, color, size, gx, gy, gridI, gridJ }) {
      this.p = p;
      this.col = color;
      this.size = size;
      this.gx = gx; // relative x inside cell (0 to 1)
      this.gy = gy; // relative y inside cell (0 to 1)
      this.gridI = gridI; // optional, for reference
      this.gridJ = gridJ; // optional, for reference
    }
  
    draw(cellX, cellY, cellW, cellH) {
      const p = this.p;
      p.push();
      // Calculate absolute position in canvas
      const absX = cellX + this.gx * cellW;
      const absY = cellY + this.gy * cellH;
  
      p.translate(absX, absY);
      p.fill(this.col);
      p.circle(0, 0, this.size);
      p.pop();
    }
  }
  