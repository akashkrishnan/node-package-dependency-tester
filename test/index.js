'use strict';

const test = require( '../src' );
const { promisify: p } = require( 'util' );
const path = require( 'path' );
const fs = require( 'fs' );
const yaml = require( 'js-yaml' );

if ( require.main === module ) {
  main().catch( console.error );
}

async function main() {
  const package_root = path.resolve( __dirname, '..' );
  const results = await test( package_root );
  return p( fs.writeFile )( 'results.yaml', yaml.dump( results ) );
}
