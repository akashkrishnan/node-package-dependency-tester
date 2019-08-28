'use strict';

const test = require( '../src' );
const path = require( 'path' );

if ( require.main === module ) {
  main().catch( console.error );
}

async function main() {
  const package_root = path.resolve( __dirname, '..' );
  const results = await test( package_root );
  console.log( results );
}
