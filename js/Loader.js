import * as THREE from 'three';

// import { TGALoader } from '../../examples/jsm/loaders/TGALoader.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { SetSceneCommand } from './commands/SetSceneCommand.js';

import { LoaderUtils } from './LoaderUtils.js';

// import { unzipSync, strFromU8 } from '../../examples/jsm/libs/fflate.module.js';

function Loader( editor ) {

	const scope = this;

	this.texturePath = '';

	this.loadItemList = function ( items ) {

		LoaderUtils.getFilesFromItemList( items, function ( files, filesMap ) {

			scope.loadFiles( files, filesMap );

		} );

	};

	this.loadFiles = function ( files, filesMap ) {

		if ( files.length > 0 ) {

			filesMap = filesMap || LoaderUtils.createFilesMap( files );

			const manager = new THREE.LoadingManager();
			manager.setURLModifier( function ( url ) {

				url = url.replace( /^(\.?\/)/, '' ); // remove './'

				const file = filesMap[ url ];

				if ( file ) {

					console.log( 'Loading', url );

					return URL.createObjectURL( file );

				}

				return url;

			} );

			// manager.addHandler( /\.tga$/i, new TGALoader() );

			for ( let i = 0; i < files.length; i ++ ) {

				scope.loadFile( files[ i ], manager );

			}

		}

	};

	this.loadFile = function ( file, manager ) {

		const filename = file.name;
		const extension = filename.split( '.' ).pop().toLowerCase();

		const reader = new FileReader();
		reader.addEventListener( 'progress', function ( event ) {

			const size = '(' + Math.floor( event.total / 1000 ).format() + ' KB)';
			const progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';

			console.log( 'Loading', filename, size, progress );

		} );

		switch ( extension ) {

			case 'pcd':

				{
	
					reader.addEventListener( 'load', async function ( event ) {
	
						const contents = event.target.result;
	
						const { PCDLoader } = await import( './libs/extra/PCDLoader.js' );
	
						const points = new PCDLoader().parse( contents );
						points.name = filename;
	
						editor.execute( new AddObjectCommand( editor, points ) );
	
					}, false );
					reader.readAsArrayBuffer( file );
	
					break;
	
			}

			default:

				console.error( 'Unsupported file format (' + extension + ').' );

				break;

		}

	};

	function handleJSON( data ) {

		if ( data.metadata === undefined ) { // 2.0

			data.metadata = { type: 'Geometry' };

		}

		if ( data.metadata.type === undefined ) { // 3.0

			data.metadata.type = 'Geometry';

		}

		if ( data.metadata.formatVersion !== undefined ) {

			data.metadata.version = data.metadata.formatVersion;

		}

		switch ( data.metadata.type.toLowerCase() ) {

			case 'buffergeometry':

			{

				const loader = new THREE.BufferGeometryLoader();
				const result = loader.parse( data );

				const mesh = new THREE.Mesh( result );

				editor.execute( new AddObjectCommand( editor, mesh ) );

				break;

			}

			case 'geometry':

				console.error( 'Loader: "Geometry" is no longer supported.' );

				break;

			case 'object':

			{

				const loader = new THREE.ObjectLoader();
				loader.setResourcePath( scope.texturePath );

				loader.parse( data, function ( result ) {

					if ( result.isScene ) {

						editor.execute( new SetSceneCommand( editor, result ) );

					} else {

						editor.execute( new AddObjectCommand( editor, result ) );

					}

				} );

				break;

			}

			case 'app':

				editor.fromJSON( data );

				break;

		}

	}

	// async function handleZIP( contents ) {

	// 	const zip = unzipSync( new Uint8Array( contents ) );

	// 	// Poly

	// 	if ( zip[ 'model.obj' ] && zip[ 'materials.mtl' ] ) {

	// 		const { MTLLoader } = await import( '../../examples/jsm/loaders/MTLLoader.js' );
	// 		const { OBJLoader } = await import( '../../examples/jsm/loaders/OBJLoader.js' );

	// 		const materials = new MTLLoader().parse( strFromU8( zip[ 'materials.mtl' ] ) );
	// 		const object = new OBJLoader().setMaterials( materials ).parse( strFromU8( zip[ 'model.obj' ] ) );
	// 		editor.execute( new AddObjectCommand( editor, object ) );

	// 	}

	// 	//

	// 	for ( const path in zip ) {

	// 		const file = zip[ path ];

	// 		const manager = new THREE.LoadingManager();
	// 		manager.setURLModifier( function ( url ) {

	// 			const file = zip[ url ];

	// 			if ( file ) {

	// 				console.log( 'Loading', url );

	// 				const blob = new Blob( [ file.buffer ], { type: 'application/octet-stream' } );
	// 				return URL.createObjectURL( blob );

	// 			}

	// 			return url;

	// 		} );

	// 		const extension = path.split( '.' ).pop().toLowerCase();

	// 		switch ( extension ) {

	// 			case 'fbx':

	// 			{

	// 				const { FBXLoader } = await import( '../../examples/jsm/loaders/FBXLoader.js' );

	// 				const loader = new FBXLoader( manager );
	// 				const object = loader.parse( file.buffer );

	// 				editor.execute( new AddObjectCommand( editor, object ) );

	// 				break;

	// 			}

	// 			case 'glb':

	// 			{

	// 				const { DRACOLoader } = await import( '../../examples/jsm/loaders/DRACOLoader.js' );
	// 				const { GLTFLoader } = await import( '../../examples/jsm/loaders/GLTFLoader.js' );

	// 				const dracoLoader = new DRACOLoader();
	// 				dracoLoader.setDecoderPath( '../examples/js/libs/draco/gltf/' );

	// 				const loader = new GLTFLoader();
	// 				loader.setDRACOLoader( dracoLoader );

	// 				loader.parse( file.buffer, '', function ( result ) {

	// 					const scene = result.scene;

	// 					scene.animations.push( ...result.animations );
	// 					editor.execute( new AddObjectCommand( editor, scene ) );

	// 				} );

	// 				break;

	// 			}

	// 			case 'gltf':

	// 			{

	// 				const { DRACOLoader } = await import( '../../examples/jsm/loaders/DRACOLoader.js' );
	// 				const { GLTFLoader } = await import( '../../examples/jsm/loaders/GLTFLoader.js' );

	// 				const dracoLoader = new DRACOLoader();
	// 				dracoLoader.setDecoderPath( '../examples/js/libs/draco/gltf/' );

	// 				const loader = new GLTFLoader( manager );
	// 				loader.setDRACOLoader( dracoLoader );
	// 				loader.parse( strFromU8( file ), '', function ( result ) {

	// 					const scene = result.scene;

	// 					scene.animations.push( ...result.animations );
	// 					editor.execute( new AddObjectCommand( editor, scene ) );

	// 				} );

	// 				break;

	// 			}

	// 		}

	// 	}

	// }

	function isGLTF1( contents ) {

		let resultContent;

		if ( typeof contents === 'string' ) {

			// contents is a JSON string
			resultContent = contents;

		} else {

			const magic = THREE.LoaderUtils.decodeText( new Uint8Array( contents, 0, 4 ) );

			if ( magic === 'glTF' ) {

				// contents is a .glb file; extract the version
				const version = new DataView( contents ).getUint32( 4, true );

				return version < 2;

			} else {

				// contents is a .gltf file
				resultContent = THREE.LoaderUtils.decodeText( new Uint8Array( contents ) );

			}

		}

		const json = JSON.parse( resultContent );

		return ( json.asset != undefined && json.asset.version[ 0 ] < 2 );

	}

}

export { Loader };