import { PaperSize, Orientation } from 'penplot';
import { polylinesToSVG } from 'penplot/util/svg';
import { clipPolylinesToBox } from 'penplot/util/geom';
import array from 'new-array';
import flattenLineTree from 'flatten-line-tree';
import optimizePaths from 'optimize-paths';

export const orientation = Orientation.LANDSCAPE;
export const dimensions = PaperSize.LETTER;

export default function createPlot (context, dimensions) {
  const [ width, height ] = dimensions;
  const margin = 2;
  const working_width = width - 2*margin;
  const working_height = height - 2*margin;
  const cell_size = 2;
  const min_padding = 0.25;

  const n_v = Math.floor( (working_height + min_padding) / (cell_size + min_padding) );
  const n_h = Math.floor( (working_width  + min_padding) / (cell_size + min_padding) );

  const v_padding = (height - (2*margin + n_v*cell_size)) / (n_v - 1);
  const h_padding = (width  - (2*margin + n_h*cell_size)) / (n_h - 1);

  const padding = Math.min(v_padding, h_padding);

  const lines = flattenLineTree(array(n_v).map((_, y) => {
    return array(n_h).map((_, x) => {
      const x_pad = margin + x * h_padding;
      const y_pad = margin + y * v_padding;
      const x_min = x_pad + x * cell_size;
      const x_max = x_pad + (x+1) * cell_size;
      const y_min = y_pad + y * cell_size;
      const y_max = y_pad + (y+1) * cell_size;
      const points = [
        [x_min, y_min], [x_max, y_min],
        [x_max, y_max], [x_min, y_max]
      ];

      points.push(points[0]);
      return points;
    });
  }));

  console.log(lines);

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

  function grid() {

  }
}
