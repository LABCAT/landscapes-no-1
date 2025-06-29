/**
 * @param {object} p - The p5.js instance.
 * @param {number} x - The x-coordinate of the glyph's center.
 * @param {number} y - The y-coordinate of the glyph's center.
 * @param {number} size - The overall size of the glyph.
 * @param {p5.Color} color - The base color for the glyph.
 * @param {number} type - An integer determining the glyph's shape variation.
 * @param {number} rotation - Initial rotation for the glyph.
 */
export class OrbGlyph {
    constructor(p, x, y, size, color, type, rotation) {
      this.p = p;
      this.x = x;
      this.y = y;
      this.size = size;
      this.color = color;
      this.type = type; // 0 for star/snowflake, 1 for gear-like, 2 for simple circle with detail
      this.rotation = rotation;
      this.initialRotation = p.random(p.TWO_PI); // Random initial rotation for variety
    }
  
    /**
     * Draws the glyph.
     */
    draw() {
      const p = this.p;
  
      p.push(); // Isolate transformations for this glyph
      p.translate(this.x, this.y);
      p.rotate(this.initialRotation + p.frameCount * 0.005); // Slowly rotate over time
  
      p.noStroke();
      p.fill(this.color);
  
      const s = this.size;
  
      if (this.type === 0) {
        // Star/Snowflake-like glyph
        const numPoints = p.int(p.random(6, 12));
        const innerRadius = s * p.random(0.3, 0.5);
        const outerRadius = s * p.random(0.8, 1.0);
  
        p.beginShape();
        for (let a = 0; a < p.TWO_PI; a += p.TWO_PI / (numPoints * 2)) {
          let radius = a % (p.TWO_PI / numPoints) < p.PI / numPoints ? outerRadius : innerRadius;
          p.vertex(p.cos(a) * radius, p.sin(a) * radius);
        }
        p.endShape(p.CLOSE);
  
        // Add a central circle for more detail
        p.fill(p.red(this.color) * 0.8, p.green(this.color) * 0.8, p.blue(this.color) * 0.8, p.alpha(this.color));
        p.circle(0, 0, s * 0.4);
  
      } else if (this.type === 1) {
        // Gear-like glyph
        const teeth = p.int(p.random(8, 16));
        const gearOuterR = s * p.random(0.8, 1.0);
        const gearInnerR = s * p.random(0.6, 0.75);
        const toothDepth = s * p.random(0.1, 0.2);
  
        p.beginShape();
        for (let i = 0; i < teeth; i++) {
          let angle = p.TWO_PI / teeth * i;
          let nextAngle = p.TWO_PI / teeth * (i + 0.5);
  
          // Outer point of tooth
          p.vertex(p.cos(angle) * gearOuterR, p.sin(angle) * gearOuterR);
          // Inner point of tooth
          p.vertex(p.cos(nextAngle) * (gearOuterR - toothDepth), p.sin(nextAngle) * (gearOuterR - toothDepth));
        }
        p.endShape(p.CLOSE);
  
        // Inner circle cut-out
        p.fill(p.red(this.color) * 1.2, p.green(this.color) * 1.2, p.blue(this.color) * 1.2, p.alpha(this.color)); // Lighter shade
        p.circle(0, 0, gearInnerR * 1.5);
      } else {
          // Simple circle with inner detail if no specific type
          p.circle(0, 0, s);
          p.fill(p.red(this.color) * 0.8, p.green(this.color) * 0.8, p.blue(this.color) * 0.8);
          p.circle(0, 0, s * 0.6);
      }
  
      p.pop(); // Restore previous transformations
    }
  }