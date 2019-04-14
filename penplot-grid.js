import { PaperSize, Orientation } from 'penplot';
import { polylinesToSVG } from 'penplot/util/svg';
import { clipPolylinesToBox } from 'penplot/util/geom';
import array from 'new-array';
import flattenLineTree from 'flatten-line-tree';
import optimizePaths from 'optimize-paths';

export const orientation = Orientation.LANDSCAPE;
export const dimensions = PaperSize.LETTER;

export default function createPlot (context, dimensions) {
  const margin = 2;
  const cell_size = 2;
  const min_padding = 0.25;

  const lines = flattenLineTree(grid({
    dimensions,
    margin,
    cell_size,
    min_padding,
    algorithm : box
  }));

  return {
    draw,
    print,
    background: 'white',
    animate: false,
    clear: true
  };

  // ---- Main Functions -------------------------------------------------------

  function draw() {
    lines.forEach(points => {
      context.beginPath();
      points.forEach(p => context.lineTo(p[0], p[1]));
      context.stroke();
    });
  }

  function print() {
    return polylinesToSVG(lines, {
      dimensions
    });
  }

  // ---- Helper Functions -----------------------------------------------------

  function box(pos, dimensions) {
    const [x, y] = pos;
    const [width, height] = dimensions;

    let points = [
      [x, y], [x + width, y], [x + width, y + height], [x, y + height]
    ];

    points.push(points[0]);
    return points;
  }

  /**
   * opts:
   *  dimensions
   *  margin
   *  cell_size
   *  min_padding
   *  algorithm
   */
  function grid(opts) {
    const [ width, height ] = opts.dimensions;
    const working_width     = width  - 2*opts.margin;
    const working_height    = height - 2*opts.margin;

    const n_v = Math.floor(
      (working_height + opts.min_padding) / (opts.cell_size + opts.min_padding)
    );
    const n_h = Math.floor(
      (working_width  + opts.min_padding) / (opts.cell_size + opts.min_padding)
    );

    const v_padding = (height - (2*opts.margin + n_v * opts.cell_size)) / (n_v - 1);
    const h_padding = (width  - (2*opts.margin + n_h * opts.cell_size)) / (n_h - 1);

    const padding = Math.min(v_padding, h_padding);

    return array(n_v).map((_, y) => {
      return array(n_h).map((_, x) => {
        const x_pad = opts.margin + x * h_padding;
        const y_pad = opts.margin + y * v_padding;

        const pos = [
          x_pad + x * opts.cell_size,
          y_pad + y * opts.cell_size
        ];
        const cell_dim = [cell_size, cell_size];

        const lines = opts.algorithm(pos, cell_dim);
        return lines;
      });
    });
  }
}
