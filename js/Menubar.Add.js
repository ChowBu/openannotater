import { UIPanel } from './libs/ui.js';
import { BoxAnnotater } from './libs/BoxAnnotater.js';

function MenubarAdd( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	let isAnnotate = false;

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/add' ) );

	this.boxAnnotater = null; 
	title.onClick( () => {

		if ( isAnnotate === false ) {

			isAnnotate = true;

			if( !this.boxAnnotater ){
				this.boxAnnotater = new BoxAnnotater( editor );
			}

			title.setTextContent( strings.getKey( 'menubar/add/cancel' ) );
			this.boxAnnotater.enabled = true;


		} else {

			isAnnotate = false;
			title.setTextContent( strings.getKey( 'menubar/add' ) );
			this.boxAnnotater.enabled = false;
			this.boxAnnotater.clear();

		}

	} );
	container.add( title );

	return container;

}

export { MenubarAdd };