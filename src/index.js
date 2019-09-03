'use strict';

const test = module.exports = require( './test.js' );

if ( require.main === module ) {
  main().catch( console.error );
}

async function main() {
  const [ , , root_dir ] = process.argv;
  console.log( root_dir );
  return test( root_dir );
}
