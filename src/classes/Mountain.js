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
  }

  draw(x, y, w, h) {
    this.drawVertex(x, y, w, h); // Calls the sharp vertex drawing method
  }

  drawVertex(x, y, w, h) { // Renamed from drawCurvedVertex
    const p = this.p;

    p.push();

    // Fill with mountain color
    p.fill(this.color);

    // Cell Shading: Thick black stroke
    p.stroke(0); // Black outline
    p.strokeWeight(4); // Set stroke weight to 4 as requested

    const mountainCenterX = x + this.mx * w;
    const mountainBaseY = y + h;
    const mountainPeakY = mountainBaseY - this.mh;

    p.beginShape();
    // Left base point
    p.vertex(mountainCenterX - this.mw, mountainBaseY);
    // Peak point
    p.vertex(mountainCenterX, mountainPeakY);
    // Right base point
    p.vertex(mountainCenterX + this.mw, mountainBaseY);
    p.endShape(p.CLOSE);

    p.pop();
  }
}