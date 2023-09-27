const moduleAlias = require('module-alias');

let folder = '';

if (process.env.NODE_ENV == 'production') {
  folder = 'dist';
} else {
  folder = 'src';
}

moduleAlias.addAliases({
  '@': __dirname + '/' + folder
});