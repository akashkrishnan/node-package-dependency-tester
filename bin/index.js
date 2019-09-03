#!/usr/bin/env node

'use strict';

const test = module.exports = require( '../src' );

if ( require.main === module ) {
  main().catch( console.error );
}

async function main() {
  const [ , , root_dir ] = process.argv;
  console.log( root_dir );
  return test( root_dir );
}
