import * as path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: '.ngc/app/polyfills.js',
  sourceMap: true,
  plugins: [
    commonjs({}),
    nodeResolve()
  ]
}
