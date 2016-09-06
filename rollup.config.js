//rollup hack
import * as path from 'path'
import nodeResolve from 'rollup-plugin-node-resolve'

class RollupNG2 {
  constructor(options){
    this.options = options;
  }
  resolveId(id, from){

    if(id.startsWith('rxjs/')){
      return `${__dirname}/node_modules/rxjs-es/${id.split('rxjs/').pop()}.js`;
    }

    if(id.startsWith('@angular/core')){
      if(id === '@angular/core'){
        return `${__dirname}/node_modules/@angular/core/index.js`;
      }
      return `${__dirname}/node_modules/@angular/core/${id.split('@angular/core').pop()}.js`;
    }
    if(id.startsWith('@angular/common')){
      if(id === '@angular/common'){
        return `${__dirname}/node_modules/@angular/common/index.js`;
      }
      return `${__dirname}/node_modules/@angular/common/${id.split('@angular/common').pop()}.js`;
    }
  }
}


const rollupNG2 = (config) => new RollupNG2(config);


export default {
  entry: '.ngc/app/main.js',
  sourceMap: true,
  plugins: [
    rollupNG2(),
    /*nodeResolve({
      module: true, jsnext: true
    })*/
    nodeResolve()
  ]
}
