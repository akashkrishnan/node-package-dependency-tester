#!/usr/bin/env node

'use strict';

const test = module.exports = require( '../src' );
const { promisify: p } = require( 'util' );
const fs = require( 'fs' );
const yaml = require( 'js-yaml' );

if ( require.main === module ) {
  main().catch( console.error );
}

async function main() {
  const [ , , package_root ] = process.argv;
  const results = await test( package_root );
  return p( fs.writeFile )( 'results.yaml', yaml.dump( results ) );
}
