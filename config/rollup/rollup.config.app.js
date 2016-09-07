import * as path from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';

class RollupNG2 {
  constructor(options){
    this.options = options;
  }
  resolveId(id, from){

    if(id.startsWith('rxjs/')){
      return `${process.cwd()}/node_modules/rxjs-es/${id.split('rxjs/').pop()}.js`;
    }

  }
}

const rollupNG2 = (config) => new RollupNG2(config);


export default {
  entry: '.ngc/app/main.js',
  sourceMap: true,
  plugins: [
    rollupNG2(),
    nodeResolve()
  ]
}
