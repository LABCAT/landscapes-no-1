import { OrbGlyph } from './OrbGlyph.js';

export class Orb {
  /**
   * Represents an "Orb" composed of multiple intricate glyphs,
   * inspired by the psychedelic tree image.
   *
   * @param {object} p - The p5.js instance.
   * @param {number} gridI - Grid row index.
   * @param {number} gridJ - Grid column index.
   * @param {number} rows - The total number of rows in the grid.
   * @param {number} cols - The total number of columns in the grid.
   * @param {string} type - Unused for now, but kept for compatibility.
   * @param {p5.Color} skyColorForComplement - The color of the sky to ensure the orb's color is distinct from.
   */
  constructor({ p, gridI, gridJ, rows, cols, type = 'glyphOrb', skyColorForComplement }) {
    this.p = p;
    this.gridI = gridI;
    this.gridJ = gridJ;
    this.rows = rows; // Store rows for size calculation
    this.cols = cols; // Store cols for size calculation
    this.type = type;

    // Calculate size and offsets within the Orb class
    this.ox = p.random(0.25, 0.75);
    this.oy = p.random(0.25, 0.75);
    this.size = this._calculateOrbSize();

    // Generate a random vibrant color that is significantly different from the sky color
    this.color = this.generateDistinctVibrantColor(skyColorForComplement);

    // This orb will now have a main OrbGlyph and a collection of smaller detail glyphs
    this.mainOrbGlyph = null;
    this.detailGlyphs = this.generateDetailGlyphs();
  }

  /**
   * Calculates the appropriate size for the orb based on canvas dimensions and grid.
   * Ensures the orb remains proportionally sized in both landscape and portrait orientations.
   * @returns {number} The calculated size of the orb.
   */
  _calculateOrbSize() {
    const p = this.p;
    
    // Calculate cell dimensions
    const cellWidth = p.width / this.cols;
    const cellHeight = p.height / this.rows;
    
    // Calculate the maximum safe orb radius based on position
    // We need to ensure the orb doesn't extend beyond cell boundaries
    const maxRadiusX = cellWidth * Math.min(this.ox, 1 - this.ox) * 0.8; // 80% of available space
    const maxRadiusY = cellHeight * Math.min(this.oy, 1 - this.oy) * 0.8; // 80% of available space
    
    // Use the smaller of the two to ensure it fits in both dimensions
    const maxSafeRadius = Math.min(maxRadiusX, maxRadiusY);
    
    // Set orb size as a random percentage of the maximum safe radius
    // This ensures orbs are always contained within their cells
    const minSizeRatio = 0.4; // 40% of max safe radius
    const maxSizeRatio = 0.7; // 70% of max safe radius
    
    return p.random(maxSafeRadius * minSizeRatio, maxSafeRadius * maxSizeRatio) * 2; // *2 for diameter
  }

  /**
   * Calculates the Euclidean distance between two p5.Color objects in RGB space.
   * @param {p5.Color} color1 - The first color.
   * @param {p5.Color} color2 - The second color.
   * @returns {number} The distance between the two colors.
   */
  _colorDistance(color1, color2) {
    const p = this.p;
    const r1 = p.red(color1),
      g1 = p.green(color1),
      b1 = p.blue(color1);
    const r2 = p.red(color2),
      g2 = p.green(color2),
      b2 = p.blue(color2);

    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  }

  /**
   * Generates a random vibrant color that is significantly different from the provided sky color.
   * It attempts to generate a color with high saturation and brightness and retries if it's too similar to the sky.
   * @param {p5.Color} skyColor - The sky color to ensure the generated color is distinct from.
   * @returns {p5.Color} A new p5.Color object.
   */
  generateDistinctVibrantColor(skyColor) {
    const p = this.p;
    let newColor;
    let attempts = 0;
    const maxAttempts = 100; // Limit attempts to prevent infinite loops
    const minDistance = 100; // Minimum color distance to consider it "significantly different"

    // Temporarily switch to HSB for color generation to control vibrancy
    p.colorMode(p.HSB);

    do {
      // Generate a random color with high saturation and brightness for vibrancy
      let h = p.random(360); // Full range of hue
      let s = p.random(70, 100); // High saturation (70-100%)
      let b = p.random(70, 100); // High brightness (70-100%)
      newColor = p.color(h, s, b);

      attempts++;

      // Convert back to RGB temporarily to measure distance, as p.colorMode affects p.color() output
      p.colorMode(p.RGB);
      const distance = this._colorDistance(newColor, skyColor);
      p.colorMode(p.HSB); // Switch back for the next iteration if needed

      if (distance > minDistance || attempts >= maxAttempts) {
        // Break if a sufficiently different color is found or max attempts reached
        break;
      }
    } while (true);

    // Ensure we switch back to RGB mode before returning to avoid affecting other drawing
    p.colorMode(p.RGB);
    return newColor;
  }


  /**
   * Generates the collection of smaller OrbGlyphs that form the intricate details
   * on top of the main orb shape.
   *
   * @returns {Array<OrbGlyph>} An array of OrbGlyph instances.
   */
  generateDetailGlyphs() {
    const p = this.p;
    const glyphs = [];
    const orbRadius = this.size / 2;

    // Determine the number of smaller glyphs based on orb size
    const numGlyphs = p.int(p.map(this.size, 50, 200, 15, 30, true)); // More glyphs for larger orbs

    for (let i = 0; i < numGlyphs; i++) {
      // Random position within the orb's circle
      const angle = p.random(p.TWO_PI);
      // Increased the maximum distance for glyphs to spread them out more
      const dist = p.random(orbRadius * 0.95); // Glyphs can now spread further, up to 95% of orb radius

      const glyphX = p.cos(angle) * dist;
      const glyphY = p.sin(angle) * dist;

      // Random size for each smaller glyph
      const glyphSize = p.random(orbRadius * 0.15, orbRadius * 0.3); // Glyphs are a fraction of the orb size

      // Derive a varied color from the base color for smaller glyphs
      let baseColor = p.color(this.color);
      let r = p.red(baseColor) + p.random(-50, 50);
      let g = p.green(baseColor) + p.random(-50, 50);
      let b = p.blue(baseColor) + p.random(-50, 50);
      r = p.constrain(r, 0, 255);
      g = p.constrain(g, 0, 255);
      b = p.constrain(b, 0, 255);
      const glyphColor = p.color(r, g, b, 200); // Semi-transparent for overlapping effect

      // Random glyph type (0 for star/snowflake, 1 for gear-like, 2 for simple circle with detail)
      const glyphType = p.int(p.random(3));
      const glyphRotation = p.random(p.TWO_PI);

      glyphs.push(new OrbGlyph(p, glyphX, glyphY, glyphSize, glyphColor, glyphType, glyphRotation));
    }
    return glyphs;
  }

  /**
   * Draws the Orb. This includes:
   * 1. The original transparent glow circle.
   * 2. A large OrbGlyph acting as the main body of the orb.
   * 3. A layer of smaller, intricate OrbGlyphs for details.
   *
   * @param {number} cellX - The x-coordinate of the top-left of the containing grid cell.
   * @param {number} cellY - The y-coordinate of the top-left of the containing grid cell.
   * @param {number} cellW - The width of the containing grid cell.
   * @param {number} cellH - The height of the containing grid cell.
   */
  draw(cellX, cellY, cellW, cellH) {
    const p = this.p;

    const posX = cellX + this.ox * cellW;
    const posY = cellY + this.oy * cellH;
    const orbSize = this.size;

    // 1. Draw the original transparent glow circle
    let c = p.color(this.color);
    c.setAlpha(0.2); // Glow transparency
    p.stroke(255);
    p.strokeWeight(1);
    p.fill(c);
    const bgSize = orbSize + orbSize * 0.3;
    p.stroke(255, 255, 255, 50);
    p.circle(posX, posY, bgSize);
    p.stroke(255, 255, 255, 75);
    p.circle(posX, posY, bgSize * 0.66);
    p.stroke(0, 0, 0, 50);
    p.circle(posX, posY, bgSize * 0.33);

    // 2. Create and draw the main OrbGlyph if it hasn't been created yet
    // This glyph will act as the solid base of the orb, replacing the second p.circle
    if (!this.mainOrbGlyph) {
      let mainOrbColor = p.color(this.color);
      mainOrbColor.setAlpha(255); // Fully opaque for the main body
      this.mainOrbGlyph = new OrbGlyph(p, 0, 0, orbSize * 0.9, mainOrbColor, 1, 0);
    }

    // Isolate transformations for the main OrbGlyph and detail glyphs
    p.push();
    p.translate(posX, posY); // Move to the center for drawing glyphs

    // Draw the main OrbGlyph
    this.mainOrbGlyph.draw();

    // 3. Draw each individual detail OrbGlyph on top of the main OrbGlyph
    this.detailGlyphs.forEach(glyph => {
      glyph.draw();
    });

    p.pop(); // Restore previous transformations
  }
}
