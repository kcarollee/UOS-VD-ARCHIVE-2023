import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


function map(value, min1, max1, min2, max2) {
	return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

function main(){



	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
	


	// CAMERA 
	const fov = 75;
	const aspect = 2; // display aspect of the canvas
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 0, 20);

	// RAYCASTER
	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	pointer.x = ( window.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( window.clientY / window.innerHeight ) * 2 + 1;
	

	// CONTROLS
	const controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.screenSpacePanning = false;
	controls.update();

	// SCENE
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xFFFFFF);
	renderer.render(scene, camera);

	// TEXTURES
	const textureLoader = new THREE.TextureLoader();
	const textureNum = 24;
	const spriteTextureArr = [];
	for (let i = 0; i < textureNum; i++){
		let url = "./assets/sprites/sprite (" + (i + 1).toString() + ").png";
		let textureTemp = textureLoader.load(url);
		spriteTextureArr.push(textureTemp); 
	}
	
	// GEOMETRY & MESH
	const instanceNum = 24;
	const sphereGeom = new THREE.SphereGeometry(3, 50, 50);
	// const sphereMat = new THREE.MeshBasicMaterial();
	
	
	const posRange = 10;
	const color = new THREE.Color();


	// SPRTIES VER
	const spritesArr = [];
	for (let i = 0; i < instanceNum; i++){
		let x = map(Math.random(), 0, 1, -posRange, posRange);
		let y = map(Math.random(), 0, 1, -posRange, posRange);
		let z = map(Math.random(), 0, 1, -posRange, posRange);

		let scaleCoef = map(Math.random(), 0, 1, 5,  5);
		let tempSpriteMaterial= new THREE.SpriteMaterial({map: spriteTextureArr[i]});
		let sprite = new THREE.Sprite(tempSpriteMaterial);
		sprite.position.set(x, y, z);
		sprite.scale.set(scaleCoef, scaleCoef);
		spritesArr.push(sprite);
		scene.add(sprite);
	}



	
	// GUI
	// const gui = new dat.GUI();
	// const controls = new function(){
	// 	this.outputObj = function(){
	// 		scene.children.forEach(c => console.log(c));
	// 	}
	// }
	// gui.add(controls, 'outputObj');



	function render(time){
		time *= 0.001;
		controls.update();
		
		
		if (resizeRenderToDisplaySize(renderer)){
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		raycaster.setFromCamera( pointer, camera );
		updateRaycaster();
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	function resizeRenderToDisplaySize(renderer){
		const canvas = renderer.domElement;
		const pixelRatio = window.devicePixelRatio;
		const width = canvas.clientWidth * pixelRatio | 0; // or 0
		const height = canvas.clientHeight * pixelRatio | 0; // 0
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize){
			renderer.setSize(width, height, false);
		}
		return needResize;
	}
	requestAnimationFrame(render);

	function onPointerMove( event ) {

		// calculate pointer position in normalized device coordinates
		// (-1 to +1) for both components
	
		pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	}


	window.addEventListener( 'pointermove', onPointerMove );

	let intersects;
	function updateRaycaster(){
		// calculate objects intersecting the picking ray
		intersects = raycaster.intersectObjects( scene.children );
		if (intersects.length > 0){
			let firstIntersectMesh = intersects[0].object;
			//console.log(firstIntersectMesh.name)
		}
	}

	function onPointerDown( event ){
		if (intersects.length > 0){
			let firstIntersectMesh = intersects[0].object;
			window.open('./students/student_1/index.html', '_self');
			controls.enabled = false;
		}
	}
	window.addEventListener('pointerdown', onPointerDown);

	function onPointerUp(event){
		controls.enabled = true;
	}
	window.addEventListener('pointerup', onPointerUp);
}

main();