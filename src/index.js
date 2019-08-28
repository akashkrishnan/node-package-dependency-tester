'use strict';

const { promisify: p } = require( 'util' );
const path = require( 'path' );
const fs = require( 'fs' );
const mkdirp = p( require( 'mkdirp' ) );
const rimraf = p( require( 'rimraf' ) );

const tmp_dir = path.resolve( __dirname, '..', 'temp' );
const tmp_pkg_filename = path.resolve( tmp_dir, 'package.json' );

module.exports = cleanup( async pkg_root => {

  const src_pkg = require( path.resolve( pkg_root, 'package.json' ) );

  // Make new temporary package root to do our installing and testing in
  await mkdirp( tmp_dir );

  // Make an empty package.json file that we'll be adding to when incrementally installing deps
  await p( fs.writeFile )( tmp_pkg_filename, '{}' );

  // Yarn instance to run yarn commands
  const yarn = Yarn( { cwd: tmp_dir } );

  const results = {
    dependencies: {},
    devDependencies: {},
    peerDependencies: {},
    optionalDependencies: {},
  };

  for ( const [ name, version ] of Object.entries( src_pkg.dependencies ) ) {
    results.dependencies[ name ] = await yarn( 'add', `${name}@${version}` );
  }

  return results;

} );

function cleanup( fn ) {
  return async ( ...args ) =>
    fn( ...args )
      .catch( err => err )
      .then( err =>
        rimraf( tmp_dir )
          .catch( console.error )
          .then( () => {
            if ( err ) {
              throw err;
            }
          } ),
      );
}

function Yarn( { cwd } = {} ) {
  return async ( ...args ) => {
    return null;
  };
}
