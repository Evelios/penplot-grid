import array from 'new-array';

export function grid(opts) {
/**
 * @param {Object}    opts
 * @param {number[2]} opts.dimensions
 * @param {number}    opts.margin
 * @param {number}    opts.cell_size
 * @param {number}    opts.min_padding
 * @param {function}  opts.algorithm
 */
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

      const cell_dim = [opts.cell_size, opts.cell_size];
      const pos = [
        x_pad + x * opts.cell_size,
        y_pad + y * opts.cell_size
      ];

      return opts.algorithm(pos, cell_dim);
    });
  });
}

export function grid2(opts) {
/**
 * @param {Object}    opts
 * @param {number[2]} opts.grid_count
 * @param {number[2]} opts.dimensions
 * @param {number}    opts.padding
 * @param {number}    opts.margin
 * @param {function}  opts.algorithm
 */
  const [ nx, ny ] = opts.grid_count;
  const [ w , h  ] = opts.dimensions;
  const cell_w     = ( w - 2*opts.margin - (nx - 1)*opts.padding ) / nx;
  const cell_h     = ( h - 2*opts.margin - (ny - 1)*opts.padding ) / ny;

  return array(nx).map((_, x) => {
    return array(ny).map((_, y) => {
      const x_pad = opts.margin + x * opts.padding;
      const y_pad = opts.margin + y * opts.padding;

      const cell_dim = [cell_w, cell_h];
      const pos = [
        x_pad + x * cell_w,
        y_pad + y * cell_h
      ];
      
      return opts.algorithm(pos, cell_dim);
    });
  });
}
