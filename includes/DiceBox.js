"use strict";
import {Teal} from './Teal.js';
import {DiceNotation} from './DiceNotation.js';
import {DiceColors} from './DiceColors.js';
export class DiceBox {

	constructor(element_container, vector2_dimensions, dice_factory, dice_favorites) {
		//private variables
		this.container = element_container;
		this.dimensions = vector2_dimensions;
		this.DiceFactory = window.DiceRoller.DiceFactory;
		this.DiceFavorites = window.DiceRoller.DiceFavorites;

		this.adaptive_timestep = false;
		this.last_time = 0;
		this.settle_time = 0;
		this.running = false;
		this.rolling = false;
		this.threadid;

		this.display = {
			currentWidth: null,
			currentHeight: null,
			containerWidth: null,
			containerHeight: null,
			aspect: null,
			scale: null
		};

		this.mouse = {
			pos: new THREE.Vector2(),
			startDrag: undefined,
			startDragTime: undefined
		}

		this.cameraHeight = {
			max: null,
			close: null,
			medium: null,
			far: null
		};

		this.scene = new THREE.Scene();
		this.world = new CANNON.World();
		this.raycaster = new THREE.Raycaster();
		this.rayvisual = null;
		this.showdebugtracer = false;
		this.dice_body_material = new CANNON.Material();
		this.desk_body_material = new CANNON.Material();
		this.barrier_body_material = new CANNON.Material();
		this.sounds_table = {};
		this.sounds_dice = [];
		this.lastSoundType = '';
		this.lastSoundStep = 0;
		this.lastSound = 0;
		this.iteration;
		this.renderer;
		this.barrier;
		this.camera;
		this.light;
		this.desk;
		this.pane;

		//public variables
		this.diceList = []; //'private' variable
		this.framerate = (1/60);
		this.sounds = true;
		this.volume = 100;
		this.soundDelay = 10; // time between sound effects in ms
		this.animstate = '';

		this.selector = {
			animate: true,
			rotate: true,
			intersected: null,
			dice: []
		};

		this.colors = {
			ambient:  0xf0f5fb,
			spotlight: 0xefdfd5
		};

		this.shadows = true;

		this.rethrowFunctions = {};
		this.afterThrowFunctions = {};
	}


	enableShadows(){
		this.shadows = true;
		if (this.renderer) this.renderer.shadowMap.enabled = this.shadows;
		if (this.light) this.light.castShadow = this.shadows;
		if (this.desk) this.desk.receiveShadow = this.shadows;
	}
	disableShadows() {
		this.shadows = false;
		if (this.renderer) this.renderer.shadowMap.enabled = this.shadows;
		if (this.light) this.light.castShadow = this.shadows;
		if (this.desk) this.desk.receiveShadow = this.shadows;
	}

	registerRethrowFunction(funcName, callback, helptext){
		this.rethrowFunctions[funcName] = {
			name: funcName,
			help: helptext,
			method: callback
		};
	}

	registerAfterThrowFunction(funcName, callback, helptext) {
		this.afterThrowFunctions[funcName] = {
			name: funcName,
			help: helptext,
			method: callback
		};
	}

	initialize() {

		let surfaces = [
			['felt', 7],
			['wood_table', 7],
			['wood_tray', 7],
			['metal', 9]
		];

		for (const [surface, numsounds] of surfaces) {
			this.sounds_table[surface] = [];
			for (let s=1; s <= numsounds; ++s) {
				this.sounds_table[surface].push(new Audio('./sounds/'+surface+'/surface_'+surface+''+s+'.wav'));
			}
		}

		for (let i=1; i <= 15; ++i) {
			this.sounds_dice.push(new Audio('./sounds/dicehit'+i+'.wav'));
		}

		Teal.bind(this.container, 'mousemove', function(ev) {
			this.onMouseMove(ev);
		}.bind(this));

		this.sounds = window.DiceRoller.DiceFavorites.settings.sounds.value == '1';
		this.volume = parseInt(window.DiceRoller.DiceFavorites.settings.volume.value);
		this.shadows = window.DiceRoller.DiceFavorites.settings.shadows.value == '1';

		this.renderer = window.WebGLRenderingContext
			? new THREE.WebGLRenderer({ antialias: true, alpha: true })
			: new THREE.CanvasRenderer({ antialias: true, alpha: true });
		this.container.appendChild(this.renderer.domElement);
		this.renderer.shadowMap.enabled = this.shadows;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.setClearColor(0x000000, 0);

		this.setDimensions(this.dimensions);

		this.world.gravity.set(0, 0, -9.8 * 800);
		this.world.broadphase = new CANNON.NaiveBroadphase();
		this.world.solver.iterations = 14;
		this.world.allowSleep = true;

		this.scene.add(new THREE.AmbientLight(this.colors.ambient, 1));

		this.world.addContactMaterial(new CANNON.ContactMaterial( this.desk_body_material, this.dice_body_material, {friction: 0.01, restitution: 0.5}));
		this.world.addContactMaterial(new CANNON.ContactMaterial( this.barrier_body_material, this.dice_body_material, {friction: 0, restitution: 1.0}));
		this.world.addContactMaterial(new CANNON.ContactMaterial( this.dice_body_material, this.dice_body_material, {friction: 0, restitution: 0.5}));
		this.world.add(new CANNON.Body({allowSleep: false, mass: 0, shape: new CANNON.Plane(), material: this.desk_body_material}));
		
		let barrier = new CANNON.Body({allowSleep: false, mass: 0, shape: new CANNON.Plane(), material: this.barrier_body_material});
		barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
		barrier.position.set(0, this.display.containerHeight * 0.93, 0);
		this.world.add(barrier);

		barrier = new CANNON.Body({allowSleep: false, mass: 0, shape: new CANNON.Plane(), material: this.barrier_body_material});
		barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
		barrier.position.set(0, -this.display.containerHeight * 0.93, 0);
		this.world.add(barrier);

		barrier = new CANNON.Body({allowSleep: false, mass: 0, shape: new CANNON.Plane(), material: this.barrier_body_material});
		barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
		barrier.position.set(this.display.containerWidth * 0.93, 0, 0);
		this.world.add(barrier);

		barrier = new CANNON.Body({allowSleep: false, mass: 0, shape: new CANNON.Plane(), material: this.barrier_body_material});
		barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
		barrier.position.set(-this.display.containerWidth * 0.93, 0, 0);
		this.world.add(barrier);

		if (this.showdebugtracer) {
			//raycaster.setFromCamera( this.mouse.pos, this.camera );
			this.rayvisual = new THREE.ArrowHelper(this.raycaster.ray.direction, this.camera.position, 1000, 0xff0000);
			this.rayvisual.headWidth = this.rayvisual.headLength * 0.005;
			this.scene.add(this.rayvisual);
		}

		this.renderer.render(this.scene, this.camera);
	}

	onMouseMove(event) {
		event.preventDefault();

		let clientX = (event.changedTouches && event.changedTouches.length) ? event.changedTouches[0].clientX : event.clientX;
		let clientY = (event.changedTouches && event.changedTouches.length) ? event.changedTouches[0].clientY : event.clientY;

		let xpercent = ( clientX / (this.display.currentWidth * 2) );
		let ypercent = ( clientY / (this.display.currentHeight * 2));

		if (xpercent <= 0.5) {
			this.mouse.pos.x = ((0.5-xpercent) * 2) *-1;
		} else {
			this.mouse.pos.x = (xpercent-0.5) * 2;
		}
		if (ypercent <= 0.5) {
			this.mouse.pos.y = (0.5-ypercent) * 2;
		} else {
			this.mouse.pos.y = ((ypercent-0.5) * 2) *-1;
		}

		if (this.raycaster && this.showdebugtracer) {
			this.raycaster.setFromCamera(this.mouse.pos, this.camera);
			this.rayvisual.setDirection(this.raycaster.ray.direction);
		}
	}

	setDimensions(dimensions) {
		this.display.currentWidth = this.container.clientWidth / 2;
		this.display.currentHeight = this.container.clientHeight / 2;
		if (dimensions) {
			this.display.containerWidth = dimensions.w;
			this.display.containerHeight = dimensions.h;
		} else {
			this.display.containerWidth = this.display.currentWidth;
			this.display.containerHeight = this.display.currentHeight;
		}
		this.display.aspect = Math.min(this.display.currentWidth / this.display.containerWidth, this.display.currentHeight / this.display.containerHeight);
		this.display.scale = Math.sqrt(this.display.containerWidth * this.display.containerWidth + this.display.containerHeight * this.display.containerHeight) / 13;

		this.renderer.setSize(this.display.currentWidth * 2, this.display.currentHeight * 2);

		this.cameraHeight.max = this.display.currentHeight / this.display.aspect / Math.tan(10 * Math.PI / 180);

		this.cameraHeight.medium = this.cameraHeight.max / 1.5;
		this.cameraHeight.far = this.cameraHeight.max;
		this.cameraHeight.close = this.cameraHeight.max / 2;

		if (this.camera) this.scene.remove(this.camera);
		this.camera = new THREE.PerspectiveCamera(20, this.display.currentWidth / this.display.currentHeight, 1, this.cameraHeight.max * 1.3);

		switch (this.animstate) {
			case 'selector':
				this.camera.position.z = this.selector.dice.length > 9 ? this.cameraHeight.far : (this.selector.dice.length < 6 ? this.cameraHeight.close : this.cameraHeight.medium);
				break;
			case 'throw': case 'afterthrow': default: this.camera.position.z = this.cameraHeight.far;

		}

		this.camera.lookAt(new THREE.Vector3(0,0,0));
		
		const maxwidth = Math.max(this.display.containerWidth, this.display.containerHeight);

		if (this.light) this.scene.remove(this.light);
		this.light = new THREE.SpotLight(this.colors.spotlight, 1.0);
		this.light.position.set(-maxwidth / 2, maxwidth / 2, maxwidth * 2);
		this.light.target.position.set(0, 0, 0);
		this.light.distance = maxwidth * 5;
		this.light.castShadow = this.shadows;
		this.light.shadow.camera.near = maxwidth / 10;
		this.light.shadow.camera.far = maxwidth * 5;
		this.light.shadow.camera.fov = 50;
		this.light.shadow.bias = 0.001;
		this.light.shadow.mapSize.width = 1024;
		this.light.shadow.mapSize.height = 1024;
		this.scene.add(this.light);

		if (this.desk) this.scene.remove(this.desk);
		let shadowplane = new THREE.ShadowMaterial();
		shadowplane.opacity = 0.5;
		this.desk = new THREE.Mesh(new THREE.PlaneGeometry(this.display.containerWidth * 6, this.display.containerHeight * 6, 1, 1), shadowplane);
		this.desk.receiveShadow = this.shadows;
		this.scene.add(this.desk);

		if (this.rayvisual && this.showdebugtracer) {
			this.rayvisual = new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 1000, 0xff0000);
			this.scene.add(this.rayvisual);
		}

		this.renderer.render(this.scene, this.camera);
	}

	vectorRand({x, y}) {
		let angle = Math.random() * Math.PI / 5 - Math.PI / 5 / 2;
		let vec = {
			x: x * Math.cos(angle) - y * Math.sin(angle),
			y: x * Math.sin(angle) + y * Math.cos(angle)
		};
		if (vec.x == 0) vec.x = 0.01;
		if (vec.y == 0) vec.y = 0.01;
		return vec;
	}

	//returns an array of vectordata objects
	getNotationVectors(notation, vector, boost, dist){

		let notationVectors = new DiceNotation(notation);

		for (let i in notationVectors.set) {

			const diceobj = window.DiceRoller.DiceFactory.get(notationVectors.set[i].type);
			let numdice = notationVectors.set[i].num;
			let operator = notationVectors.set[i].op;
			let sid = notationVectors.set[i].sid;
			let gid = notationVectors.set[i].gid;
			let glvl = notationVectors.set[i].glvl;
			let func = notationVectors.set[i].func;
			let args = notationVectors.set[i].args;

			for(let k = 0; k < numdice; k++){

				let vec = this.vectorRand(vector);

				vec.x /= dist;
				vec.y /= dist;

				let pos = {
					x: this.display.containerWidth * (vec.x > 0 ? -1 : 1) * 0.9,
					y: this.display.containerHeight * (vec.y > 0 ? -1 : 1) * 0.9,
					z: Math.random() * 200 + 200
				};

				let projector = Math.abs(vec.x / vec.y);
				if (projector > 1.0) pos.y /= projector; else pos.x *= projector;


				let velvec = this.vectorRand(vector);

				velvec.x /= dist;
				velvec.y /= dist;

				let velocity = { 
					x: velvec.x * (boost * notationVectors.boost), 
					y: velvec.y * (boost * notationVectors.boost), 
					z: -10
				};

				let angle = {
					x: -(Math.random() * vec.y * 5 + diceobj.inertia * vec.y),
					y: Math.random() * vec.x * 5 + diceobj.inertia * vec.x,
					z: 0
				};

				let axis = { 
					x: Math.random(), 
					y: Math.random(), 
					z: Math.random(), 
					a: Math.random()
				};

				notationVectors.vectors.push({ 
					type: diceobj.type, 
					op: operator,
					sid: sid,  
					gid: gid, 
					glvl: glvl,
					func: func, 
					args: args, 
					pos: pos, 
					velocity: velocity, 
					angle: angle, 
					axis: axis
				});
			}            
		}
		return notationVectors;
	}

	// swaps dice faces to match desired result
	swapDiceFace(dicemesh, result){
		const diceobj = window.DiceRoller.DiceFactory.get(dicemesh.notation.type);

		if (diceobj.shape == 'd4') {
			this.swapDiceFace_D4(dicemesh, result);
			return;
		}

		let values = diceobj.values;
		let value = parseInt(dicemesh.getLastValue().value);
		result = parseInt(result);
		
		if (dicemesh.notation.type == 'd10' && value == 0) value = 10;
		if (dicemesh.notation.type == 'd100' && value == 0) value = 100;
		if (dicemesh.notation.type == 'd100' && (value > 0 && value < 10)) value *= 10;

		if (dicemesh.notation.type == 'd10' && result == 0) result = 10;
		if (dicemesh.notation.type == 'd100' && result == 0) result = 100;
		if (dicemesh.notation.type == 'd100' && (result > 0 && result < 10)) result *= 10;

		let valueindex = diceobj.values.indexOf(value);
		let resultindex = diceobj.values.indexOf(result);

		if (valueindex < 0 || resultindex < 0) return;
		if (valueindex == resultindex) return;

		// find material index for corresponding value -> face and swap them
		// must clone the geom before modifying it
		let geom = dicemesh.geometry.clone();

		// find list of faces that use the matching material index for the given value/result
		let geomindex_value = [];
		let geomindex_result = [];

		// it's magic but not really
		// the mesh's materials start at index 2
		let magic = 2;
		// except on d10 meshes
		if (diceobj.shape == 'd10') magic = 1;

		let material_value = (valueindex+magic);
		let material_result = (resultindex+magic);

		for (var i = 0, l = geom.faces.length; i < l; ++i) {
			const matindex = geom.faces[i].materialIndex;

			if (matindex == material_value) {
				geomindex_value.push(i);
				continue;
			}
			if (matindex == material_result) {
				geomindex_result.push(i);
				continue;
			}
		}

		if (geomindex_value.length <= 0 || geomindex_result.length <= 0) return;

		//swap the materials
		for(let i = 0, l = geomindex_result.length; i < l; i++) {
			geom.faces[geomindex_result[i]].materialIndex = material_value;
		}

		for(let i = 0, l = geomindex_value.length; i < l; i++) {
			geom.faces[geomindex_value[i]].materialIndex = material_result;
		}

		dicemesh.resultReason = 'forced';
		dicemesh.geometry = geom;
	}

	swapDiceFace_D4(dicemesh, result) {
		const diceobj = window.DiceRoller.DiceFactory.get(dicemesh.notation.type);
		let value = parseInt(dicemesh.getLastValue().value);
		result = parseInt(result);

		if (!(value >= 1 && value <= 4)) return;

		let num = result - value;
		let geom = dicemesh.geometry.clone();

		for (let i = 0, l = geom.faces.length; i < l; ++i) {

			let matindex = geom.faces[i].materialIndex;
			if (matindex == 0) continue;
        
			matindex += num - 1;

			while (matindex > 4) matindex -= 4;
			while (matindex < 1) matindex += 4;

			geom.faces[i].materialIndex = matindex + 1;
		}
        if (num != 0) {
            if (num < 0) num += 4;

            dicemesh.material = window.DiceRoller.DiceFactory.createMaterials(diceobj, 0, 0, false, num);
        }

		dicemesh.resultReason = 'forced';
		dicemesh.geometry = geom;
	}

	//spawns one dicemesh object from a single vectordata object
	spawnDice(vectordata) {
		const diceobj = window.DiceRoller.DiceFactory.get(vectordata.type);
		if(!diceobj) return;

		let dicemesh = window.DiceRoller.DiceFactory.create(diceobj.type);
		if(!dicemesh) return;

		dicemesh.notation = vectordata;
		dicemesh.result = [];
		dicemesh.stopped = 0;
		dicemesh.castShadow = this.shadows;
		dicemesh.body = new CANNON.Body({allowSleep: true, sleepSpeedLimit: 100, mass: diceobj.mass, shape: dicemesh.geometry.cannon_shape, material: this.dice_body_material});
		dicemesh.body.type = CANNON.Body.DYNAMIC;
		dicemesh.body.position.set(vectordata.pos.x, vectordata.pos.y, vectordata.pos.z);
		dicemesh.body.quaternion.setFromAxisAngle(new CANNON.Vec3(vectordata.axis.x, vectordata.axis.y, vectordata.axis.z), vectordata.axis.a * Math.PI * 2);
		dicemesh.body.angularVelocity.set(vectordata.angle.x, vectordata.angle.y, vectordata.angle.z);
		dicemesh.body.velocity.set(vectordata.velocity.x, vectordata.velocity.y, vectordata.velocity.z);
		dicemesh.body.linearDamping = 0.1;
		dicemesh.body.angularDamping = 0.1;

		dicemesh.body.addEventListener('collide', this.eventCollide);

		this.scene.add(dicemesh);
		this.diceList.push(dicemesh);
		this.world.add(dicemesh.body);
	}

	eventCollide({body, target}) {
		// collision events happen simultaneously for both colliding bodies
		// all this sanity checking helps limits sounds being played

		let DiceBox = window.DiceRoller.DiceRoom.DiceBox;

		// don't play sounds if we're simulating
		if (DiceBox.animstate == 'simulate') return;
		if (!DiceBox.sounds || !body) return;

		let volume = parseInt(window.DiceFavorites.settings.volume.value) || 0;
		if (volume <= 0) return;

		let now = Date.now();
		let currentSoundType = (body.mass > 0) ? 'dice' : 'table';

		// the idea here is that a dice clack should never be skipped in favor of a table sound
		// if ((don't play sounds if we played one this world step, or there hasn't been enough delay) AND 'this sound IS NOT a dice clack') then 'skip it'
		if ((DiceBox.lastSoundStep == body.world.stepnumber || DiceBox.lastSound > now) && currentSoundType != 'dice') return;

		// also skip if it's too early and both last sound and this sound are the same
		if ((DiceBox.lastSoundStep == body.world.stepnumber || DiceBox.lastSound > now) && currentSoundType == 'dice' && DiceBox.lastSoundType == 'dice') return;

		if (body.mass > 0) { // dice to dice collision

			let speed = body.velocity.length();
			// also don't bother playing at low speeds
			if (speed < 250) return;
			let strength = 0.1;
			let high = 12000;
			let low = 250;
			strength = Math.max(Math.min(speed / (high-low), 1), strength);

			let sound = DiceBox.sounds_dice[Math.floor(Math.random() * DiceBox.sounds_dice.length)];
			sound.volume = (strength * (volume/100));
			sound.play();
			DiceBox.lastSoundType = 'dice';


		} else { // dice to table collision
			let speed = target.velocity.length();
			// also don't bother playing at low speeds
			if (speed < 250) return;

			let surface = window.DiceFavorites.settings.surface.value || 'felt';
			let strength = 0.1;
			let high = 12000;
			let low = 250;
			strength = Math.max(Math.min(speed / (high-low), 1), strength);

			let soundlist = DiceBox.sounds_table[surface];
			let sound = soundlist[Math.floor(Math.random() * soundlist.length)];
			sound.volume = (strength * (volume/100));
			sound.play();
			DiceBox.lastSoundType = 'table';
		}

		DiceBox.lastSoundStep = body.world.stepnumber;
		DiceBox.lastSound = now + DiceBox.soundDelay;
	}

	//resets vectors on dice back to startign notation values for a roll after simulation.
	resetDice(dicemesh, {pos, axis, angle, velocity}) {
		dicemesh.stopped = 0;
		this.world.remove(dicemesh.body);
		dicemesh.body = new CANNON.Body({allowSleep: true, sleepSpeedLimit: 100, mass: dicemesh.body.mass, shape: dicemesh.geometry.cannon_shape, material: this.dice_body_material});
		dicemesh.body.type = CANNON.Body.DYNAMIC;
		dicemesh.body.position.set(pos.x, pos.y, pos.z);
		dicemesh.body.quaternion.setFromAxisAngle(new CANNON.Vec3(axis.x, axis.y, axis.z), axis.a * Math.PI * 2);
		dicemesh.body.angularVelocity.set(angle.x, angle.y, angle.z);
		dicemesh.body.velocity.set(velocity.x, velocity.y, velocity.z);
		dicemesh.body.linearDamping = 0.1;
		dicemesh.body.angularDamping = 0.1;
		dicemesh.body.addEventListener('collide', this.eventCollide);
		this.world.add(dicemesh.body);
		dicemesh.body.sleepState = 0;
	}

	solverBodyStopped(physicsbody) {
		let errorMargin = 6;
		let angular = physicsbody.angularVelocity;
		let velocity = physicsbody.velocity;
		return (
			Math.abs(angular.x) < errorMargin &&
			Math.abs(angular.y) < errorMargin &&
			Math.abs(angular.z) < errorMargin &&
			Math.abs(velocity.x) < errorMargin &&
			Math.abs(velocity.y) < errorMargin &&
			Math.abs(velocity.z) < errorMargin
		);
	}

	throwFinished() {
		let stopped = 0;
		let stoptimer = (this.framerate * 60) * 50; // 10 more iterations
		if (this.iteration > 1000) return true;
		if (this.iteration < (10 / this.framerate)) {

			for (let i=0, len=this.diceList.length; i < len; ++i) {
				let dicemesh = this.diceList[i];

				// use a stoptimer to let the dice settle a bit before reading
				if (this.solverBodyStopped(dicemesh.body)) {

					if (dicemesh.stopped == 0) {
						dicemesh.stopped = this.iteration + stoptimer;
					}

					if(dicemesh.stopped < this.iteration) {
						++stopped;

						// store value and check for rerolls on second to last frae
						// before declaring this dice as stopped
						if (dicemesh.stopped == this.iteration-1) {

							// all dice in a set/dice group will have the same function and arguments due to sorting beforehand
							// this means the list passed in is the set of dice that need to be affected by this function
							let diceFunc = (dicemesh.notation.func) ? dicemesh.notation.func.toLowerCase() : '';

							dicemesh.storeRolledValue();

							if (diceFunc != '') {

								diceFunc = dicemesh.notation.func.toLowerCase();

								let funcdata = this.rethrowFunctions[diceFunc];

								let reroll = false;
								if (funcdata && funcdata.method) {
									let method = funcdata.method;

									let diceFuncArgs = dicemesh.notation.args || '';
									reroll = funcdata.method(dicemesh, diceFuncArgs);
								}

								if (reroll) {
									--stopped;
									dicemesh.rerolls += 1;
									dicemesh.resultReason = 'reroll';
									dicemesh.body.angularVelocity = new CANNON.Vec3(25, 25, 25);
									dicemesh.body.velocity = new CANNON.Vec3(0, 0, 3000);

								// if not rerolling by now, freeze the physics
								// this prevents rerolls from changing other dice
								} else {

									dicemesh.body.type = CANNON.Body.KINEMATIC;

								}
							}
						}
					}
				} else {
					dicemesh.stopped = 0;
				}
			}
		}
		return stopped == this.diceList.length;
	}

	simulateThrow() {
		this.animstate = 'simulate';
		this.iteration = 0;
		this.settle_time = 0;
		this.rolling = true;
		let steps = 0;
		while (!this.throwFinished()) {
			++this.iteration;
			steps++;
			this.world.step(this.framerate);
		}
	}

	animateThrow(threadid, callback, notationVectors){
		this.animstate = 'throw';
		let time = (new Date()).getTime();
		this.last_time = this.last_time || time - (this.framerate*1000);
		let time_diff = (time - this.last_time) / 1000;
		++this.iteration;
		let neededSteps = Math.floor(time_diff / this.framerate);

		for(let i =0; i < neededSteps; i++) {
			this.world.step(this.framerate);
			this.steps++;
			}

		// update physics interactions visually
		for (let i in this.scene.children) {
			let interact = this.scene.children[i];
			if (interact.body != undefined) {
				interact.position.copy(interact.body.position);
				interact.quaternion.copy(interact.body.quaternion);
			}
		}

		this.renderer.render(this.scene, this.camera);
		this.last_time = this.last_time + neededSteps*this.framerate*1000;

		// roll finished
		if (this.running == threadid && this.throwFinished()) {
			this.running = false;
			this.rolling = false;
			if(callback) callback.call(this, notationVectors);

			
			this.running = (new Date()).getTime();
			this.animateAfterThrow(this.running);
			return;
		}

		// roll not finished, keep animating
		if (this.running == threadid) {
			((animateCallback, tid, at, aftercall, vecs) => {
				if (!at && time_diff < this.framerate) {
					setTimeout(() => { requestAnimationFrame(() => { animateCallback.call(this, tid, aftercall, vecs); }) }, (this.framerate - time_diff) * 1000);
				} else {
					requestAnimationFrame(() => { animateCallback.call(this, tid, aftercall, vecs); });
				}
			}).bind(this)(this.animateThrow, threadid, this.adaptive_timestep, callback, notationVectors);
		}
	}

	animateAfterThrow(me,threadid) {
		this.animstate = 'afterthrow';
		let time = (new Date()).getTime();
		let time_diff = (time - this.last_time) / 1000;
		if (time_diff > 3) time_diff = this.framerate;

		this.raycaster.setFromCamera( this.mouse.pos, this.camera );
		if (this.rayvisual) this.rayvisual.setDirection(this.raycaster.ray.direction);
		let intersects = this.raycaster.intersectObjects(this.diceList);
		if ( intersects.length > 0 ) {
			//setSelected(intersects[0].object);
		} else {
			//setSelected();
		}

		this.last_time = time;
		this.renderer.render(this.scene, this.camera);
		if (this.running == threadid) {
			((animateCallback, tid, at) => {
				if (!at && time_diff < this.framerate) {
					setTimeout(() => { requestAnimationFrame(() => { animateCallback.call(this, tid); }) }, (this.framerate - time_diff) * 1000);
				} else {
					requestAnimationFrame(() => { animateCallback.call(this, tid); });
				}
			}).bind(this)(this.animateAfterThrow, threadid, this.adaptive_timestep);
		}
	}

	animateSelector(threadid) {
		this.animstate = 'selector';
		let time = (new Date()).getTime();
		let time_diff = (time - this.last_time) / 1000;
		if (time_diff > 3) time_diff = this.framerate;

		if (this.container.style.opacity != '1') this.container.style.opacity = Math.min(1, (parseFloat(this.container.style.opacity) + 0.05));

		if (this.selector.rotate) {
			let angle_change = 0.005 * Math.PI;
			for (let i in this.diceList) {
				this.diceList[i].rotation.y += angle_change;
				this.diceList[i].rotation.x += angle_change / 4;
				this.diceList[i].rotation.z += angle_change / 10;
			}
		}

		this.raycaster.setFromCamera( this.mouse.pos, this.camera );
		if (this.rayvisual) this.rayvisual.setDirection(this.raycaster.ray.direction);
		let intersects = this.raycaster.intersectObjects(this.diceList);
		if ( intersects.length > 0 ) {
			this.setSelected(intersects[0].object);
		} else {
			this.setSelected();
		}

		this.last_time = time;
		this.renderer.render(this.scene, this.camera);
		if (this.running == threadid) {
			(function(animateCallback, tid, at) {
				if (!at && time_diff < this.framerate) {
					setTimeout(() => { requestAnimationFrame(() => { animateCallback.call(this, tid); }); }, (this.framerate - time_diff) * 1000);
				} else {
					requestAnimationFrame(() => { animateCallback.call(this, tid); });
				}
			}).bind(this)(this.animateSelector, threadid, this.adaptive_timestep);
		}
	}

	//returns a dicemesh under the mouse using raytracing
	getDiceAtMouse(event) {
		if (this.rolling) return;
		if (event) this.onMouseMove(event);

		this.raycaster.setFromCamera( this.mouse.pos, this.camera );
		if (this.rayvisual) this.rayvisual.setDirection(this.raycaster.ray.direction);
		let intersects = this.raycaster.intersectObjects(this.diceList);

		//this.scene.add(new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 1000, 0x00ff00) );

		if (intersects.length) return intersects[0].object.userData;
	}

	setSelected(dicemesh = null) {

		if ( dicemesh != null ) {

			if ( this.selector.intersected ) {
				for(let i = 0, l = this.selector.intersected.material.length; i < l; i++){
					if (i == 0) continue;
					this.selector.intersected.material[i].emissive.setHex( this.selector.intersected.currentHex );
					this.selector.intersected.material[i].emissiveIntensity = this.selector.intersected.currentintensity;
				}
			}

			this.selector.intersected = dicemesh;
			this.selector.intersected.currentHex = this.selector.intersected.material[1].emissive.getHex();
			this.selector.intersected.currentintensity = this.selector.intersected.material[1].emissiveIntensity;

			for(let i = 0, l = this.selector.intersected.material.length; i < l; i++){
				if (i == 0) continue;
				this.selector.intersected.material[i].emissive.setHex( 0xffffff );
				this.selector.intersected.material[i].emissiveIntensity = 0.5;
			}
		} else {
			if ( this.selector.intersected ) {
				for(let i = 0, l = this.selector.intersected.material.length; i < l; i++){
					if (i == 0) continue;
					this.selector.intersected.material[i].emissive.setHex( this.selector.intersected.currentHex );
					this.selector.intersected.material[i].emissiveIntensity = this.selector.intersected.currentintensity;
				}
			}
			this.selector.intersected = null;
		}
		
	}

	showSelector(alldice = false) {
		if (this.rolling) return;
		this.clearDice();
		let step = this.display.containerWidth / 5;


		this.renderer.shadowMap.enabled = this.shadows;

		if (this.pane) this.scene.remove(this.pane);
		if (this.shadows) {
			let shadowplane = new THREE.ShadowMaterial();
			shadowplane.opacity = 0.5;

			this.pane = new THREE.Mesh(new THREE.PlaneGeometry(this.display.containerWidth * 6, this.display.containerHeight * 6, 1, 1), shadowplane);
			this.pane.receiveShadow = this.shadows;
			this.pane.position.set(0, 0, 1);
			this.scene.add(this.pane);
		}

		let selectordice = alldice ? Object.keys(window.DiceRoller.DiceFactory.dice) : this.selector.dice;
		this.camera.position.z = selectordice.length > 9 ? this.cameraHeight.far : (selectordice.length < 3 ? this.cameraHeight.close : this.cameraHeight.medium);
		let posxstart = selectordice.length > 9 ? -4 : (selectordice.length < 3 ? -0.5 : -1);
		let posystart = selectordice.length > 9 ? 1.5 : (selectordice.length < 4 ? 0 : 1);
		let poswrap = selectordice.length > 9 ? 4 : (selectordice.length < 4 ? 2 : 1);

		for (let i = 0, posx = posxstart, posy = posystart; i < selectordice.length; ++i, ++posx) {

			if (posx > poswrap) {
				posx = posxstart;
				posy--;
			}

			let dicemesh = window.DiceRoller.DiceFactory.create(selectordice[i]);
			dicemesh.position.set(posx * step, posy * step, step * 0.5);
			dicemesh.castShadow = this.shadows;
			dicemesh.userData = selectordice[i];

			this.diceList.push(dicemesh);
			this.scene.add(dicemesh);
		}

		this.running = (new Date()).getTime();
		this.last_time = 0;
		if (this.selector.animate) {
			this.container.style.opacity = 0;
			this.animateSelector(this.running);
		}
		else this.renderer.render(this.scene, this.camera);

	}

	startClickThrow(notation) {
		if (this.rolling) return;

		let vector = { x: (Math.random() * 2 - 0.5) * this.display.currentWidth, y: -(Math.random() * 2 - 0.5) * this.display.currentHeight };
		let dist = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
		let boost = (Math.random() + 3) * dist;

		return this.getNotationVectors(notation, vector, boost, dist);
	}

	startDragThrow(event) {
		event.preventDefault();
		this.mouse.startDragTime = (new Date()).getTime();
		this.mouse.startDrag = Teal.get_mouse_coords(event);
	}

	endDragThrow(event, notation) {
		if (this.rolling) return;
		if (this.mouse.startDrag == undefined) return;
		if (this.mouse.startDrag && event.changedTouches && event.changedTouches.length == 0) {
			return;
		}
		event.stopPropagation();

		let m = Teal.get_mouse_coords(event);
		let vector = { x: m.x - this.mouse.startDrag.x, y: -(m.y - this.mouse.startDrag.y) };
		this.mouse.startDrag = undefined;
		let dist = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
		if (dist < Math.sqrt(this.display.currentWidth * this.display.currentHeight * 0.01)) return;
		let time_int = (new Date()).getTime() - this.mouse.startDragTime;
		if (time_int > 2000) time_int = 2000;
		let boost = Math.sqrt((2500 - time_int) / 2500) * dist * 2;
		
		return this.getNotationVectors(notation, vector, boost, dist);
	}

	clearDice() {
		this.running = false;
		let dice;
		while (dice = this.diceList.pop()) {
			this.scene.remove(dice); 
			if (dice.body) this.world.remove(dice.body);
		}
		if (this.pane) this.scene.remove(this.pane);
		this.renderer.render(this.scene, this.camera);

		setTimeout(() => { this.renderer.render(this.scene, this.camera); }, 100);
	}

	rollDice(notationVectors, callback){

		if (notationVectors.error) {
			callback.call(this);
			return;
		}

		this.camera.position.z = this.cameraHeight.far;
		this.clearDice();

		for (let i=0, len=notationVectors.vectors.length; i < len; ++i) {
			this.spawnDice(notationVectors.vectors[i]);
		}
		this.simulateThrow();
		this.steps = 0;
		this.iteration = 0;
		this.settle_time = 0;
		
		//reset dice vectors
		for (let i=0, len=this.diceList.length; i < len; ++i) {
			if (!this.diceList[i]) continue;

			this.resetDice(this.diceList[i], notationVectors.vectors[i]);
		}

		//check forced results, fix dice faces if necessary
		if (notationVectors.result && notationVectors.result.length > 0) {
			for (let i=0;i<notationVectors.result.length;i++) {
				let dicemesh = this.diceList[i];
				if (!dicemesh) continue;
				if (dicemesh.getLastValue().value == notationVectors.result[i]) continue;
				this.swapDiceFace(dicemesh, notationVectors.result[i]);
			}
		}

		//reset the result
		for (let i=0, len=this.diceList.length; i < len; ++i) {
			if (!this.diceList[i]) continue;

			if (this.diceList[i].resultReason != 'forced') {
				this.diceList[i].result = [];
			}
		}

		// animate the previously simulated roll
		this.rolling = true;
		this.running = (new Date()).getTime();
		this.last_time = 0;
		this.animateThrow(this.running, callback, notationVectors);

	}

	getDiceTotals(notationVectors, array_dicemeshes) {

		let valueSets = [];
		let labelSets = [];

		// first calculate all sets into values
		// '4d20', '8d6', etc
		// step 1: sort all results into corresponding sets with values and labels
		for(let i = 0; i < array_dicemeshes.length; i++) {
			let notation = array_dicemeshes[i].notation;
			let diceobj =  window.DiceRoller.DiceFactory.get(notation.type);

			if (diceobj.display == 'labels') {
				labelSets.push(array_dicemeshes[i]);
			}
			if (diceobj.display == 'values') {
				if (!valueSets[notation.sid]) valueSets[notation.sid] = [];
				valueSets[notation.sid].push(array_dicemeshes[i]);
			}
		}

		let setValues = [];
		let lastgroupid = 0;

		// step 2: iterate each set and combine their values
		for (let i=0, len=valueSets.length; i < len; ++i) {
			let set = valueSets[i];
			if(!set) continue;
			lastgroupid = Math.max(lastgroupid, set[0].notation.gid);
			setValues.push(this.diceGroupCombine(notationVectors, set));
		}

		// step 3: insert any trailing constant as another entry
		if (notationVectors.constant != '') {
			let constant = parseInt(notationVectors.constant);

			setValues.push({
				isconstant: true,
				rolls: ''+constant,
				labels: '',
				gid: lastgroupid+1,
				glvl: 0,
				values: Math.abs(constant),
				op: notationVectors.op,
			});
		}

		let groupLevels = {};

		// step 4: iterate the combined sets and group first by level, then by groupid
		for (let i=0, len=setValues.length; i < len; ++i) {
			let setvalue = setValues[i];

			let level = setvalue.glvl;
			let groupid = setvalue.gid;

			if (!groupLevels[level]) {
				groupLevels[level] = {};
			}

			if (!groupLevels[level][groupid]) {
				groupLevels[level][groupid] = [];
			}

			groupLevels[level][groupid].push(setvalue);
		}

		//let results = {rolls: '', labels: '', values: ''};
		let results = this.diceGroupCombine(notationVectors, labelSets);
		results.op = '';
		results.values = '';

		//step 6: iterate the levels combining all sets in a group at that level
		// iterate levels first, levels should be in descending order
		//  so we start at the deepest level first and work upwards

		let groupLevelsKeys = Object.keys(groupLevels).reverse();

		for (let key=0, len=groupLevelsKeys.length; key < len; ++key) {

			let level = groupLevelsKeys[key];
			let groupsInLevel = groupLevels[level];
			if (!groupsInLevel) continue;

			let resultsForLevel = {rolls: '', labels: '', values: 0, op: ''};

			// look for groups at this level and combine those
			for (let groupid in groupsInLevel) {

				let groupResults = groupsInLevel[groupid];

				let resultsForGroup = {rolls: '', labels: '', values: 0, op: ''};

				for (let i=0, len=groupResults.length; i < len; ++i) {
					let groupResult = groupResults[i];

					let op = (i == 0) ? '' : groupResult.op;

					if (groupResult.rolls.length > 0 && !groupResult.isconstant) resultsForGroup.rolls +=  op+'['+groupResult.rolls+']';
					if (groupResult.rolls.length > 0 && groupResult.isconstant) resultsForGroup.rolls +=  op+groupResult.rolls;
					if (groupResult.labels.length > 0) resultsForGroup.labels += '['+groupResult.labels+']';
					if (resultsForGroup.op == '') resultsForGroup.op = groupResult.op;

					if (groupResult.isconstant) {

						resultsForGroup.op = groupResult.op;
						resultsForGroup.labels = groupResult.labels;
						resultsForGroup.values = groupResult.values;

					} else {
						resultsForGroup.values = this.operate(resultsForGroup.values, groupResult.op, groupResult.values);
					}

				}

				let op = (groupid == 0) ? '' : resultsForGroup.op;

				if (len == 1) {
					if (resultsForGroup.rolls.length > 0) resultsForLevel.rolls += op+resultsForGroup.rolls;
				} else {
					if (resultsForGroup.rolls.length > 0) resultsForLevel.rolls += op+'('+resultsForGroup.rolls+')';
				}

				if (resultsForGroup.labels.length > 0) resultsForLevel.labels += resultsForGroup.labels;
				if (resultsForLevel.op == '') resultsForLevel.op = resultsForGroup.op;

				//if (groupResults.length == 1) {
				//    resultsForLevel = resultsForGroup;
				//} else {

					resultsForLevel.values = this.operate(resultsForLevel.values, resultsForGroup.op, resultsForGroup.values);
				//}
			}

			if (resultsForLevel.rolls.length > 0) results.rolls += resultsForLevel.rolls+'';
			if (resultsForLevel.labels.length > 0) results.labels += resultsForLevel.labels;

			if (results.op == '') results.op = resultsForLevel.op;
			if (results.values == '' && resultsForLevel.values != '') results.values = parseInt(results.values) || 0;

			//if (results.length == 1) {
			//    resultsForLevel.values = resultsForGroup.values;
			//    resultsForLevel.op = resultsForGroup.op;
			//} else {

				results.values = this.operate(results.values, resultsForLevel.op, resultsForLevel.values);
			//}
		}
		return results;
	}

	// returns object: {rolls: String, labels: String, values: Int, op: String, gid: Int, glvl: Int}
	diceGroupCombine(notationVectors, dicemeshList) {

		// known systems with preset rules
		let swrpgdice = [];
		let swarmadadice = [];
		let xwingdice = [];
		let legiondice = [];

		// generic any dice with display == 'values'
		let numberdice = [];

		// generic any other dice with display == 'labels'
		let labeldice = [];

		// all dice in a set/dice group will have the same function and arguments due to sorting beforehand
		// this means the list passed in is the set of dice that need to be affected by this function
		let diceFunc = '';
		let diceFuncArgs = '';
		if (diceFunc == '' && dicemeshList[0] && dicemeshList[0].notation && dicemeshList[0].notation.func) {
			diceFunc = dicemeshList[0].notation.func.toLowerCase();

			if (diceFuncArgs == '' && dicemeshList[0] && dicemeshList[0].notation && dicemeshList[0].notation.args) {
				diceFuncArgs = dicemeshList[0].notation.args;
			}

			if (diceFunc != '') {
				let funcdata = this.afterThrowFunctions[diceFunc];

				if (funcdata && funcdata.method) {
					let method = funcdata.method;
					dicemeshList = funcdata.method(dicemeshList, diceFuncArgs);
				}
			}

		}
		

		// split up results between known systems, symbol, and number dice
		for(let i = 0; i < dicemeshList.length; i++){

			let dicemesh = dicemeshList[i];
			let diceobj =  window.DiceFactory.get(dicemesh.notation.type);
			let operator = dicemesh.notation.op;
			let result = dicemesh.getLastValue();

			if (diceobj.system == 'swrpg') {
				swrpgdice.push(dicemesh);
			} else if (diceobj.system == 'swarmada') {
				swarmadadice.push(dicemesh);
			} else if (diceobj.system == 'xwing') {
				xwingdice.push(dicemesh);
			} else if (diceobj.system == 'legion') {
				legiondice.push(dicemesh);
			} else if (diceobj.system == 'd20' || diceobj.display == 'values') {
				numberdice.push(dicemesh);
			} else if (diceobj.display == 'labels') {
				labeldice.push(dicemesh);
			}
		}


		let rolls = '';
		let labels = '';
		let values = 0;

		// swrpg dice, custom logic
		if(swrpgdice.length > 0) {

			let success = 0;
			let failure = 0;
			let advantage = 0;
			let threat = 0;
			let triumph = 0;
			let despair = 0;
			let dark = 0;
			let light = 0;

			rolls += '<span style="font-family: \'SWRPG-Symbol-Regular\'">';

			for(let i = 0; i < swrpgdice.length; i++){

				let currentlabel = swrpgdice[i].getLastValue().label;

				success += (currentlabel.split('s').length - 1);
				failure += (currentlabel.split('f').length - 1);
				advantage += (currentlabel.split('a').length - 1);
				threat += (currentlabel.split('t').length - 1);
				triumph += (currentlabel.split('x').length - 1);
				despair += (currentlabel.split('y').length - 1);
				dark += (currentlabel.split('z').length - 1);
				light += (currentlabel.split('Z').length - 1);
			}

			success += triumph;
			failure += despair;

			rolls += 's'.repeat(success);
			rolls += 'f'.repeat(failure);
			rolls += 'a'.repeat(advantage);
			rolls += 't'.repeat(threat);
			rolls += 'x'.repeat(triumph);
			rolls += 'y'.repeat(despair);
			rolls += 'z'.repeat(dark);
			rolls += 'Z'.repeat(light);

			rolls = rolls.trim();

			rolls += '</span>';

			labels += '<span style="font-family: \'SWRPG-Symbol-Regular\'">';

			if (success > failure) labels += 's'.repeat(success-failure);
			if (failure > success) labels += 'f'.repeat(failure-success);
			if (advantage > threat) labels += 'a'.repeat(advantage-threat);
			if (threat > advantage) labels += 't'.repeat(threat-advantage);
			if (triumph > 0) labels += 'x'.repeat(triumph);
			if (despair > 0) labels += 'y'.repeat(despair);
			if (dark > 0) labels += 'z'.repeat(dark);
			if (light > 0) labels += 'Z'.repeat(light);

			labels = labels.trim() + '</span>';

		}

		// swarmada dice, custom logic
		if(swarmadadice.length > 0) {

			let hit = 0;
			let critical = 0;
			let accuracy = 0;

			rolls += '<span style="font-family: \'Armada-Symbol-Regular\'">';

			for(let i = 0; i < swarmadadice.length; i++){

				let currentlabel = swarmadadice[i].getLastValue().label;

				hit += (currentlabel.split('F').length - 1);
				critical += (currentlabel.split('E').length - 1);
				accuracy += (currentlabel.split('G').length - 1);
			}

			rolls += 'F'.repeat(hit);
			rolls += 'E'.repeat(critical);
			rolls += 'G'.repeat(accuracy);

			rolls = rolls.trim();

			rolls += '</span>';

			labels += '<span style="font-family: \'Armada-Symbol-Regular\'">';
			
			if (hit > 0) labels += 'F'.repeat(hit);
			if (critical > 0) labels += 'E'.repeat(critical);
			if (accuracy > 0) labels += 'G'.repeat(accuracy);

			labels = labels.trim() + '</span>';

		}

		// xwing dice, custom logic
		if(xwingdice.length > 0) {

			let hit = 0;
			let critical = 0;
			let focus = 0;
			let evade = 0;

			rolls += '<span style="font-family: \'XWing-Symbol-Regular\'">';

			for(let i = 0; i < xwingdice.length; i++){

				let currentlabel = xwingdice[i].getLastValue().label;

				hit += (currentlabel.split('d').length - 1);
				critical += (currentlabel.split('c').length - 1);
				focus += (currentlabel.split('f').length - 1);
				evade += (currentlabel.split('e').length - 1);
			}

			rolls += 'd'.repeat(hit);
			rolls += 'c'.repeat(critical);
			rolls += 'f'.repeat(focus);
			rolls += 'e'.repeat(evade);

			rolls = rolls.trim();

			rolls += '</span>';

			labels += '<span style="font-family: \'XWing-Symbol-Regular\'">';

			if (hit == evade) {
				hit = 0;
				evade = 0;
			} else if (hit > evade)  {
				hit -= evade;
				evade = 0;
			} else if (evade > hit) {
				evade -= hit;
				hit = 0;
			}

			if (critical == evade) {
				evade = 0;
				critical = 0;
			} else if (critical > evade) {
				critical -= evade;
				evade = 0;
			} else if (evade > critical) {
				evade -= critical;
				critical = 0;
			}
			
			if (hit > 0) labels += 'd'.repeat(Math.max(hit,0));
			if (critical > 0) labels += 'c'.repeat(Math.max(critical,0));
			if (focus > 0) labels += 'f'.repeat(Math.max(focus,0));
			if (evade > 0) labels += 'e'.repeat(Math.max(evade,0));

			labels = labels.trim() + '</span>';

		}

		// legion dice, custom logic
		if(legiondice.length > 0) {

			let atk_hit = 0;
			let atk_crit = 0;
			let atk_surge = 0;

			let def_block = 0;
			let def_surge = 0;

			rolls += '<span style="font-family: \'Legion-Symbol-Regular\'">';

			for(let i = 0; i < legiondice.length; i++){

				let currentlabel = legiondice[i].getLastValue().label;

				atk_hit += (currentlabel.split('h').length - 1);
				atk_crit += (currentlabel.split('c').length - 1);
				atk_surge += (currentlabel.split('o').length - 1);

				def_block += (currentlabel.split('s').length - 1);
				def_surge += (currentlabel.split('d').length - 1);
			}

			rolls += 'h'.repeat(atk_hit);
			rolls += 'c'.repeat(atk_crit);
			rolls += 'o'.repeat(atk_surge);

			rolls += 's'.repeat(def_block);
			rolls += 'd'.repeat(def_surge);

			rolls = rolls.trim();

			rolls += '</span>';

			labels += '<span style="font-family: \'Legion-Symbol-Regular\'">';
			
			if (atk_hit > 0) labels += 'h'.repeat(Math.max(atk_hit,0));
			if (atk_crit > 0) labels += 'c'.repeat(Math.max(atk_crit,0));
			if (atk_surge > 0) labels += 'o'.repeat(Math.max(atk_surge,0));
			if (def_block > 0) labels += 's'.repeat(Math.max(def_block,0));
			if (def_surge > 0) labels += 'd'.repeat(Math.max(def_surge,0));

			labels = labels.trim() + '</span>';

		}

		// labels only
		if (labeldice.length > 0) {

			let rolltext = [];
			let resulttext = [];

			for (let i = 0; i < labeldice.length; i++) {
				let lastValue = labeldice[i].getLastValue();

				let ignoredclass = lastValue.ignore ? ' ignored' : '';

				rolltext.push('<span class="diceresult'+ignoredclass+'" data-uuid="'+labeldice[i].uuid+'">'+lastValue.label+'</span>');

				if (lastValue.ignore) continue;

				resulttext.push(lastValue.label);
			}

			rolls += rolltext.join('');
			labels += resulttext.join('');
		}

		// numbers only
		if (numberdice.length > 0) {

			let rolltext = [];

			for (let i = 0; i < numberdice.length; i++) {
				let lastValue = numberdice[i].getLastValue();

				let ignoredclass = lastValue.ignore ? ' ignored' : '';

				rolltext.push('<span class="diceresult'+ignoredclass+'" data-uuid="'+numberdice[i].uuid+'">'+lastValue.value+'</span>');

				if (lastValue.ignore) continue;

				values = this.operate(values, numberdice[i].notation.op, lastValue.value);
			}

			rolls += rolltext.join('+');
		}


		// grab the operator, groupid and grouplevel from the first item
		let op = dicemeshList[0] ? dicemeshList[0].notation.op || '+' : '+';
		let gid = dicemeshList[0] ? dicemeshList[0].notation.gid || 0 : 0;
		let glvl = dicemeshList[0] ? dicemeshList[0].notation.glvl || 0 : 0;

		return {rolls: rolls, labels: labels, values: values, op: op, gid: gid, glvl: glvl};
		
	}

	operate(valuea, operator, valueb) {
		switch (operator) {
			case '^': valuea = Math.pow(valuea, valueb); break;
			case '%': valuea = valuea % valueb; break;
			case '*': valuea *= valueb; break;
			case '/': valuea /= valueb; break;
			case '-': valuea -= valueb; break;
			case '+': default: valuea += valueb; break;
		}
		return valuea;
	}

}