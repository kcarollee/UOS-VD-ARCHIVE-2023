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
	
	

	// CONTROLS
	const controls = new OrbitControls( camera, renderer.domElement );
	camera.position.set(0, 0, 20);
	controls.update();

	// SCENE
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xCCCCCC);
	renderer.render(scene, camera);

	// GEOMETRY & MESH
	const instanceNum = 30;
	const sphereGeom = new THREE.SphereGeometry(3, 50, 50);
	const sphereMat = new THREE.MeshBasicMaterial();
	const spheresInstancedMesh = new THREE.InstancedMesh(sphereGeom, sphereMat, instanceNum);

	const matrix = new THREE.Matrix4();
	const posRange = 10;
	const color = new THREE.Color();

	const sphereProxy = new THREE.Object3D();
	for (let i = 0; i < instanceNum; i++){
		let x = map(Math.random(), 0, 1, -posRange, posRange);
		let y = map(Math.random(), 0, 1, -posRange, posRange);
		let z = map(Math.random(), 0, 1, -posRange, posRange);

		let scaleCoef = map(Math.random(), 0, 1, 0.8, 1.2);
		sphereProxy.position.set(x, y, z);
		sphereProxy.scale.setScalar(scaleCoef);
		sphereProxy.updateMatrix();

		spheresInstancedMesh.setMatrixAt(i, sphereProxy.matrix);
		spheresInstancedMesh.setColorAt(i, color.setHex(map(Math.random(), 0, 1, 0.5, 1.0) * 0xFFFFFF));
	}

	scene.add(spheresInstancedMesh);
	

	
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
}

main();