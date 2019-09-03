'use strict';

const { promisify: p } = require( 'util' );
const { spawn } = require( 'child_process' );
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
  const yarn = new Yarn( { cwd: tmp_dir } );

  const results = {
    dependencies: {},
    devDependencies: {},
    // peerDependencies: {},
    // optionalDependencies: {},
  };

  for ( const depType of Object.keys( results ) ) {
    for ( const [ name, version ] of Object.entries( src_pkg[ depType ] || {} ) ) {

      const isDev = depType.startsWith( 'dev' );

      // Try to install dependency
      let err = await yarn.add( isDev ? '--dev' : '', resolveDepName( name, version ) );

      if ( err ) {
        results[ depType ][ name ] = { add: err };
        continue;
      }

      continue;

      // Run dependency's tests
      const dep_dir = path.resolve( tmp_dir, 'node_modules', name );
      err = await new Yarn( { cwd: dep_dir } ).test();

      if ( err ) {
        results[ depType ][ name ] = { test: err };
      }

    }
  }

  return results;

} );

function cleanup( fn ) {
  return async ( ...args ) => {

    let err;
    const results = await fn( ...args ).catch( e => err = e );

    await rimraf( tmp_dir ).catch( () => 0 );

    if ( err ) {
      throw err;
    }

    return results;

  };
}

function resolveDepName( name, version ) {
  try {
    new URL( version );
    return version;
  }
  catch ( err ) {
    return `${name}@${version}`;
  }
}

class Yarn {

  constructor( { cwd } = {} ) {
    this.cwd = cwd;
  }

  async spawn( ...args ) {
    return new Promise( ( resolve, reject ) => {

      const lines = [];

      const done = () => {
        const error = lines.filter( l => !l.startsWith( 'warning' ) ).join( '' );
        resolve( error );
      };

      console.log( 'yarn', ...args );

      const yarn = spawn( 'yarn', args, { cwd: this.cwd } );

      // yarn.stdout.on( 'data', data => console.log( data.toString() ) );
      yarn.stderr.on( 'data', data => lines.push( data.toString() ) );

      yarn.on( 'error', err => reject( err ) );
      yarn.on( 'exit', () => done() );

    } );
  }

  async add( ...args ) {
    return this.spawn( 'add', ...args );
  }

  async test( ...args ) {
    return this.spawn( 'test', ...args );
  }

}
