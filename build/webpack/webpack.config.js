switch(process.env.NODE_ENV) {
  case 'prod':
  case 'production':
    module.exports = require('./webpack.prod');
    break;
  default:
    module.exports = require('./webpack.dev');
}
