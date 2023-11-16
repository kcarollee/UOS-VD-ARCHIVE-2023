import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

class HyperlinkSprite{
	constructor(posVec, texture, link, index, scale = 1){
		this.posVec = posVec;
		this.texture = texture;
		this.link = link;
		this.scale = scale;
		this.spriteMat = new THREE.SpriteMaterial({map: this.texture});
		this.sprite = new THREE.Sprite(this.spriteMat);
		this.sprite.position.copy(this.posVec);
		this.sprite.scale.set(this.scale, this.scale, this.scale);
		this.id = index;
		this.sprite.name = index;

		// animation triggers 
		this.clickAnimationTriggered = false;
		this.centerTranslationTriggered = false;
		this.scaleUpTriggered = false;
		this.scaleDownTriggered = false;

		this.posBeforeTriggered = new THREE.Vector3();
		this.scaleBeforeClickTriggered = new THREE.Vector3();
	}

	addToScene(scene){
		scene.add(this.sprite);
	}

	moveTo(destPosVec){

	}

	clickAnimationZoom(){
		// move sprite to center
		if (this.centerTranslationTriggered){
			let centerVec = new THREE.Vector3(0, 0, 0);
			this.posVec.add(centerVec.sub(this.posVec).multiplyScalar(0.1));
			this.sprite.position.copy(this.posVec);
			if (centerVec.distanceTo(this.posVec) < 0.1){
				this.centerTranslationTriggered = false;
				this.scaleUpTriggered = true;
			}
		}
		
		// scale sprite so it fills up the page
		if (this.scaleUpTriggered){
			this.scale += 2;
			this.sprite.scale.set(this.scale, this.scale);
			if (this.scale > 100) {
				//this.clickAnimationTriggered = false;
				this.scaleUpTriggered = false;
				this.scaleDownTriggered = true;
				// move to student detail page when the animation is done
				this.moveToLink();
				//this.sprite.scale.set(1, 1, 1);
			}
		}

		if (this.scaleDownTriggered){
			this.scale += (this.scaleBeforeClickTriggered - this.scale) * 0.1;
			this.sprite.scale.set(this.scale, this.scale);

			let originalPosVec = new THREE.Vector3();
			originalPosVec.copy(this.posBeforeTriggered);
			this.posVec.add(originalPosVec.sub(this.posVec).multiplyScalar(0.2));
			this.sprite.position.copy(this.posVec);

			let scaleDiff = Math.abs(this.scale - this.scaleBeforeClickTriggered);
			let posDiff = this.posVec.distanceTo(this.posBeforeTriggered);
			//console.log(posDiff);
			if (scaleDiff < 0.01 && posDiff < 0.01){
				//console.log("ANIMATION OVER");
				this.scaleDownTriggered = false;
				this.clickAnimationTriggered = false;
				HyperlinkSprite.animationTriggered = false;
			}
		}

		
		

	}

	clickAnimationFallback(){

	}

	moveToLink(){
		window.open(this.link, '_self');
		THREE.Cache.clear();
	}
}

HyperlinkSprite.centerVec = new THREE.Vector3(0, 0, 0);
HyperlinkSprite.animationTriggered = false;

function map(value, min1, max1, min2, max2) {
	return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

function main(){
	const canvas = document.querySelector('#c');
	const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
	const studentNames = [
		"강지현", "권나경", "권채현", "김로영", "김민서", "김민주", "김성희", "김승희", "김예영", "김용규", "나미", "변민경", "박언진", "김성현", "안지민", "오예지", "이덕원", "이연호", "정서윤", "이주희", "한세흔", "황예인", "Irene", "Maria"
	]
	const studentAdjectives = [
		"바글바글","뒹굴댕굴","포롱포롱","오잉또잉","몽글몽글","헤롱헤롱","희죽희죽","허둥지둥","소복소복","두두두두","두근두근","둥실둥실","보잉보잉","얼렁뚱땅","새콤달콤","가릉가릉","산만산만","피융피융","소곤소곤","데구르르","버블버블","또랑또랑","","딩동댕동"
	]


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
	const hyperlinkSpritesArr = [];
	for (let i = 0; i < instanceNum; i++){
		let x = map(Math.random(), 0, 1, -posRange, posRange);
		let y = map(Math.random(), 0, 1, -posRange, posRange);
		let z = map(Math.random(), 0, 1, -posRange, posRange);

		let scaleCoef = map(Math.random(), 0, 1, 5,  5);
		// let tempSpriteMaterial= new THREE.SpriteMaterial({map: spriteTextureArr[i]});
		// let sprite = new THREE.Sprite(tempSpriteMaterial);
		// sprite.position.set(x, y, z);
		// sprite.scale.set(scaleCoef, scaleCoef);
		// spritesArr.push(sprite);
		// scene.add(sprite);

		let hyperlinkSprite = new HyperlinkSprite(
			new THREE.Vector3(x, y, z), 
			spriteTextureArr[i],
			'./students/student_1/index.html',
			i,
			scaleCoef
		);

		hyperlinkSprite.addToScene(scene);
		hyperlinkSpritesArr.push(hyperlinkSprite);
	}



	
	// GUI
	// const gui = new dat.GUI();
	// const controls = new function(){
	// 	this.outputObj = function(){
	// 		scene.children.forEach(c => console.log(c));
	// 	}
	// }
	// gui.add(controls, 'outputObj');
	let clickedSprite;
	let globalOpacity = 1.0;
	function spriteAnimationHandler(){
		hyperlinkSpritesArr.forEach(function(hyperlinkSprite){
			// zoom animation for the clicked sprite
			if (hyperlinkSprite.clickAnimationTriggered){
				hyperlinkSprite.clickAnimationZoom();
			}

			// fall back animation for the rest
			else{
				// if clickedSprite gets defined upon mouse click
				if (clickedSprite != undefined){
					// if the clicked sprite is moving to center
					if (clickedSprite.centerTranslationTriggered){
						if (globalOpacity > 0) globalOpacity -= 0.01;
						hyperlinkSprite.sprite.material.opacity = globalOpacity;
					}
					// if the clicked sprite is moving back to its original pos
					if (clickedSprite.scaleDownTriggered){
						if (globalOpacity < 1) globalOpacity += 0.001;
						hyperlinkSprite.sprite.material.opacity = globalOpacity;
					}
				}
				
			}
		})
	}



	function render(time){
		time *= 0.001;
		controls.update();
		
		spriteAnimationHandler();
		
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
			console.log(firstIntersectMesh.name);
		}
	}

	
	function onPointerDown( event ){
		// the latter is needed to prevent clicking other sprites when 
		// animation is triggered
		if (intersects.length > 0 && !HyperlinkSprite.animationTriggered){
			let firstIntersectMesh = intersects[0].object;
			let index = firstIntersectMesh.name;
			clickedSprite = hyperlinkSpritesArr[index];
			clickedSprite.clickAnimationTriggered = true;
			clickedSprite.centerTranslationTriggered = true;
			HyperlinkSprite.animationTriggered = true;
			//window.open(clickedSprite.link, '_self');
			//controls.enabled = false;

			// these need to be set so the sprites can 
			// return to their original position and scale 
			// when coming back from the details page
			clickedSprite.posBeforeTriggered.copy(clickedSprite.posVec);
			clickedSprite.scaleBeforeClickTriggered = clickedSprite.scale;
		}
	}
	window.addEventListener('pointerdown', onPointerDown);

	function onPointerUp(event){
		controls.enabled = true;
	}
	window.addEventListener('pointerup', onPointerUp);
}

main();