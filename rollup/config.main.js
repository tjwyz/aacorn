import buble from 'rollup-plugin-buble';

export default {
  entry: 'src/index.js',
  moduleName: 'acorn',
  sourcemap: true,
  plugins: [
    buble({
      transforms: {
        dangerousForOf: true
      }
    })
  ],
  targets: [
    { dest: 'dist/acorn.js', format: 'umd' }
  ]
};
