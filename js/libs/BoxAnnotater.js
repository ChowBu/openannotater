
import {
    EventDispatcher, Vector3, Vector2, Frustum, Matrix4
} from 'three';

import { UIElement } from './ui.js';
import { intersectionBy } from '../libs/utils.js';

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
                    this.drawCircle( x, y, 10 );
    
                    if( this.screenPositionArray.length > 0 ){

                        const endPos = this.screenPositionArray[this.screenPositionArray.length - 1];
                        this.drawLine(endPos.x, endPos.y, x, y );

                    }
    
                    this.screenPositionArray.push( { x, y } );

                 /**
                 * right mouse button clicked
                 */
                } else if( e.button === 2 ){
                    const startPos = this.screenPositionArray[0];
                    const endPos = this.screenPositionArray[this.screenPositionArray.length - 1];
                    this.drawLine(endPos.x, endPos.y, startPos.x, startPos.y );
                    
                    if( this.screenPositionArray.length > 2 ){

                        const points2dInScreen = this.get2DPointsInScreen();
                        const selectedPoints = [];
                        points2dInScreen.forEach( ( point ) => {
                            const isInside = this.isPointInPolygon( point, this.screenPositionArray );
                            
                            if( isInside ){
                                selectedPoints.push( point );
                            }

                        } );
                        const selectedPoints3D = this.get3DPointsFrom2DPoints( this.pointCloudPositionInWorld, points2dInScreen );
                                                

                    }
                }

            } 

        });
        // this.canvas.dom.addEventListener('mouseup', ( e ) => {
        //     console.log('box-annotater mouseup');
        // });
        // this.canvas.dom.addEventListener('mousemove',( e ) => {
        //     console.log('box-annotater mousemove');
        // });
        // this.canvas.dom.addEventListener('mouseleave',( e ) => {
        //     console.log('box-annotater mouseleave'); 
        // });
        // this.canvas.dom.addEventListener('contextmenu',( e ) => {
        //     console.log('box-annotater contextmenu');
        // });
        

    }
    /**
     * @param {boolean} v
     */
    set enabled(v){

        if( v === true ){
            this.getAll3DPoints();
        }
        this.enable = v;

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
    drawLine(x1, y1, x2, y2, lineWidth=2) {

        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.closePath();

    }
    /**
     * 
     * @param {*} e 
     * @returns 
     */
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
    getAll3DPoints(){

        const points = this.editor.scene.getObjectByProperty( 'type', 'Points' );
        
        if( points ){

            const position = points.geometry.getAttribute('position')
            const pointsArray = position.array;
            const length = position.count;
            const pointMatrixWorld = points.matrixWorld;

            for ( let i = 0; i < length; i++ ) {
                let x = pointsArray[i * 3];
                let y = pointsArray[i * 3 + 1];
                let z = pointsArray[i * 3 + 2];
                let v = new Vector3( x, y, z );
                v.applyMatrix4( pointMatrixWorld );
                v.index=i;
                this.pointCloudPositionInWorld.push( v );

            }
        }
        return this.pointCloudPositionInWorld;
    }
    get2DPointsInScreen(){
        const reusult = [];
        const point3D = this.pointCloudPositionInWorld;
        if( point3D ){
            const frustum = new Frustum();
            const camera = this.editor.camera;
            frustum.setFromProjectionMatrix( new Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
    
            point3D.forEach( ( point ) => {
                if( frustum.containsPoint( point ) ){
                    const point2d = this.pointsInWorldToScreen( point, camera, {height: this.height, width: this.width} );
                    point2d.index = point.index;
                    reusult.push(point2d);
                }
            } );
        }
        return reusult;
    }
    get3DPointsFrom2DPoints(pointsOf3d, pointsOf2d){
        let intersects = [];
        if( Array.isArray( pointsOf2d ) && Array.isArray( pointsOf3d )){
            intersects = intersectionBy(pointsOf3d, pointsOf2d, (point) => point.index);
        }
        intersects
        return intersects;
    }
    pointsInWorldToScreen( point, camera, plane ){
        this.tempVector3.x = point.x;
        this.tempVector3.y = point.y;
        this.tempVector3.z = point.z;
        
        const { height, width } = plane;
            
        this.tempVector3.project(camera);
    
        return new Vector2((0.5 + this.tempVector3.x / 2) * width, (0.5 - this.tempVector3.y / 2) * height);
    }
    isPointInPolygon( point, polygon ){

        let inside = false;
        const { x, y } = point;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x;
            const yi = polygon[i].y;
            const xj = polygon[j].x;
            const yj = polygon[j].y;

            const intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

            if (intersect) {
                inside = true;
            }
        }
        return inside;

    }
    hightLightPoints(){

    }
    clear(){
        this.ctx.clearRect( 0, 0, this.canvas.dom.width, this.canvas.dom.height );
        this.screenPositionArray = [];
        this.pointCloudPositionInWorld = [];
    }


}

export { BoxAnnotater }