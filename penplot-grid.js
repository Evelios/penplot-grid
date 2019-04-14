import { PaperSize, Orientation } from 'penplot';
import { polylinesToSVG } from 'penplot/util/svg';
import { clipPolylinesToBox } from 'penplot/util/geom';
import { randomFloat } from 'penplot/util/random';
import flattenLineTree from 'flatten-line-tree';
import optimizePaths from 'optimize-paths';
import polygonCrosshatching from 'polygon-crosshatching';
import SimplexNoise from 'simplex-noise';
import grid from './grid'

export const orientation = Orientation.LANDSCAPE;
export const dimensions = PaperSize.LETTER;

export default function createPlot (context, dimensions) {
  console.log(grid);
  const margin        = 2;
  const cell_size     = 1;
  const min_padding   = 0.1;
  const pen_width     = 0.02;
  const min_spacing   = 1 * pen_width;
  const simplex       = new SimplexNoise();

  const noise = pos => {
    const scale = 20;
    return simplex.noise2D(scale * pos[0], scale * pos[1]);
  }

  const crosshatch = (pos, dim) => {
    const redistribute = x => Math.pow(x, 0.5);
    const noise_ammount = (noise(pos) + 1) / 2;
    const polygon = box(pos, dim);
    const angle = noise_ammount * 2*Math.PI;
    const max_spacing = min_spacing + 20 * min_spacing * noise_ammount;
    return polygonCrosshatching(
      polygon,
      angle,
      min_spacing,
      max_spacing,
      redistribute
    );
  }

  const lines = flattenLineTree(grid({
    dimensions,
    margin,
    cell_size,
    min_padding,
    algorithm : crosshatch
  }));

  return {
    draw,
    print,
    background: 'black',
    animate: false,
    clear: true
  };

  // ---- Main Functions -------------------------------------------------------

  function draw() {
    context.strokeStyle = '#FFF';

    lines.forEach(points => {
      context.beginPath();
      context.lineWeight = pen_width;
      points.forEach(p => context.lineTo(p[0], p[1]));
      context.stroke();
    });
  }

  function print() {
    return polylinesToSVG(optimizePaths(lines), {
      dimensions,
      lineWeight  : pen_width,
    });
  }

  // ---- Helper Functions -----------------------------------------------------

  function box(pos, dimensions) {
    const [x, y] = pos;
    const [width, height] = dimensions;

    let points = [
      [x, y], [x + width, y], [x + width, y + height], [x, y + height]
    ];

    return points;
  }
}
