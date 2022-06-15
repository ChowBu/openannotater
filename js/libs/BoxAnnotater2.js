
import {
    EventDispatcher, 
    Vector3, 
    Vector2, 
    Frustum, 
    Matrix4, 
    BoxHelper, 
    BufferGeometry,
    Float32BufferAttribute,
    Raycaster
} from 'three';

import { UIElement } from './ui.js';
import { intersectionBy, minBy, maxBy } from '../libs/utils.js';
import { AddObjectCommand } from '../Commands/AddObjectCommand.js';

class BoxAnnotater extends EventDispatcher {

    constructor( editor ){
        super();

        this.editor = editor;
        this.signals = editor.signals;
        this.renderer = editor.renderer;

        this.width = this.renderer.domElement.offsetWidth;
        this.height = this.renderer.domElement.offsetHeight;

        this.canvas = this.createCanvas();

        this.ctx = this.canvas.dom.getContext('2d');

        this.raycaster = new Raycaster();

        this.mouse = new Vector2();

        this.pointCloudPositionInWorld = [];

        this.screenPositionArray = [];

        this.tempVector3 = new Vector3(0, 0, 0);

        this.enabled = true;
        this.enable = true;

        this.canvas.dom.addEventListener('mousedown',( e ) => {

            if( this.enable ){
                /**
                 * left mouse button clicked
                 */
                if( e.button === 0 ){

                    const { x, y } = this.getMousePosition( e );
                    const pointCloud = this.editor.scene.getObjectByProperty( 'type', 'Points' )
                    this.drawCircle( x, y, 2);

                    this.mouse.fromArray([x, y]);
                    this.raycaster.setFromCamera( this.mouse, this.editor.camera );
                    const result = this.raycaster.intersectObject( pointCloud, false );
                    this.hightLightPoints( result );
                    console.log( result );

                } 

            } 

        });
    }
    /**
     * @param {boolean} v
     */
    set enabled(v){

        this.enable = v;

    }
    getMousePosition(e){

        const scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        const scrollY = document.documentElement.scrollTop || document.body.scrollTop;
        const rect = this.canvas.dom.getBoundingClientRect();
        const top = document.documentElement.clientTop;
        const left = document.documentElement.clientLeft;
    
        let x = e.pageX || e.clientX + scrollX;
        let y = e.pageY || e.clientY + scrollY;
    
        x -= (rect.left - left);
        y -= (rect.top - top);
    
        return { x: x || 0, y: y || 0 };
    }

    /**
     * create canvas container
     * @returns 
     */
    createCanvas(){

        const dom = document.createElement('canvas');
        const container = new UIElement(dom);

        container.setId('box-annotater');
        container.setPosition('absolute');
        container.setLeft('0px');
        container.setTop('0px');

        container.dom.width = `${this.width}`;
        container.dom.height = `${this.height}`;

        document.getElementById( 'viewport' ).appendChild( container.dom );
    
        return container;
    }
    hightLightPoints( intersects ){
        const points = this.editor.scene.getObjectByProperty('type','Points');
        if( points ) {
           
            const positionLength = points.geometry.attributes.position.count;
            const color = Array(positionLength*3);
            color.fill( 0.0001, 0 );
            intersects.forEach( ( item ) => { 

            } );


            const geometry = points.geometry.setAttribute( 'color', new Float32BufferAttribute( color, 3 ) );
            points.material.vertexColors = true;
        }

    }
    /**
     * draw circle in canvas 
     * @param {*} x 
     * @param {*} y 
     * @param {*} radius 
     */
    drawCircle(x, y, radius, color='red') {

        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    getBBoxBySelectedPoints( selectedPoints ){

        const geometry = new BufferGeometry();
        const verticesArray = [];
        selectedPoints.forEach(( point ) => {
            verticesArray.push(point.x, point.y, point.z);
        });
        const vertices = new Float32Array( verticesArray );

        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

        const mesh = new THREE.Mesh( geometry );
        return new BoxHelper( mesh, '#ff0000' );

    }

    clearCanvas(){
        this.ctx.clearRect( 0, 0, this.canvas.dom.width, this.canvas.dom.height );
        this.screenPositionArray = [];
    }
    clear(){
        this.clearCanvas();
        this.pointCloudPositionInWorld = [];
    }


}

export { BoxAnnotater }