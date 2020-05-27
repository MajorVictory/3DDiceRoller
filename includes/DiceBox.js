"use strict"

const DiceBox = (element_container, vector2_dimensions, dice_factory) => {

	//private variables
	let container = element_container;
	let dimensions = vector2_dimensions;
	let dicefactory = dice_factory;

	let adaptive_timestep = false;
	let last_time = 0;
	let settle_time = 0;
	let running = false;
	let rolling = false;
	let threadid;

	let display = {
		currentWidth: null,
		currentHeight: null,
		containerWidth: null,
		containerHeight: null,
		aspect: null,
		scale: null
	};

	let mouse = {
		pos: new THREE.Vector2(),
		startDrag: undefined,
		startDragTime: undefined
	}

	let cameraHeight = {
		max: null,
		close: null,
		medium: null,
		far: null
	};

	let scene = new THREE.Scene();
	let world = new CANNON.World();
	let raycaster = new THREE.Raycaster();
	let rayvisual = null;
	let showdebugtracer = false;
	let dice_body_material = new CANNON.Material();
	let desk_body_material = new CANNON.Material();
	let barrier_body_material = new CANNON.Material();
	let sounds_table = {};
	let sounds_dice = [];
	let rethrowFunctions = {};
	let afterThrowFunctions = {};
	let animstate = '';
	let iteration;
	let renderer;
	let barrier;
	let camera;
	let light;
	let desk;
	let pane;

	//public variables
	let public_interface = {};

	let diceList = []; //'private' variable
	public_interface['diceList'] = diceList; //register as 'public'

	let framerate = (1/60);
	public_interface['framerate'] = framerate;

	let sounds = true;
	public_interface['sounds'] = sounds;

	let volume = 100;
	public_interface['volume'] = volume;

	let selector = {
		animate: true,
		rotate: true,
		intersected: null,
		dice: []
	};
	public_interface['selector'] = selector;

	let colors = {
		ambient:  0xf0f5fb,
		spotlight: 0xefdfd5
	};
	public_interface['colors'] = colors;

	let shadows = true;
	const enableShadows = () => {
		shadows = true;
		if (renderer) renderer.shadowMap.enabled = shadows;
		if (light) light.castShadow = shadows;
		if (desk) desk.receiveShadow = shadows;
	}
	const disableShadows = () => {
		shadows = false;
		if (renderer) renderer.shadowMap.enabled = shadows;
		if (light) light.castShadow = shadows;
		if (desk) desk.receiveShadow = shadows;
	}
	public_interface['enableShadows'] = enableShadows;
	public_interface['disableShadows'] = disableShadows;

	const registerRethrowFunction = (funcName, callback, helptext) => {
		rethrowFunctions[funcName] = {
			name: funcName,
			help: helptext,
			method: callback
		};
	}
	public_interface['registerRethrowFunction'] = registerRethrowFunction;

	const registerAfterThrowFunction = (funcName, callback, helptext) => {
		afterThrowFunctions[funcName] = {
			name: funcName,
			help: helptext,
			method: callback
		};
	}
	public_interface['registerAfterThrowFunction'] = registerAfterThrowFunction;

	const initialize = () => {

		let surfaces = ['felt'];

		for (let i=0, len=surfaces.length; i < len; ++i) {
			let surface = surfaces[i];
			sounds_table[surface] = [];
			for (let s=1; s <= 5; ++s) {
				sounds_table[surface].push(new Audio('./sounds/surface_'+surface+''+s+'.wav'));
			}
		}

		for (let i=1; i <= 10; ++i) {
			sounds_dice.push(new Audio('./sounds/dicehit'+i+'.wav'));
		}
		console.log('volume', volume);
		console.log('$t.DiceFavorites.settings.volume.value', $t.DiceFavorites.settings.volume.value);

		sounds = $t.DiceFavorites.settings.sounds.value == '1';
		volume = parseInt($t.DiceFavorites.settings.volume.value);
		shadows = $t.DiceFavorites.settings.shadows.value == '1';

		console.log('volume', volume);

		renderer = window.WebGLRenderingContext
			? new THREE.WebGLRenderer({ antialias: true, alpha: true })
			: new THREE.CanvasRenderer({ antialias: true, alpha: true });
		container.appendChild(renderer.domElement);
		renderer.shadowMap.enabled = shadows;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.setClearColor(0x000000, 0);

		setDimensions(dimensions);

		world.gravity.set(0, 0, -9.8 * 800);
		world.broadphase = new CANNON.NaiveBroadphase();
		world.solver.iterations = 14;

		scene.add(new THREE.AmbientLight(colors.ambient, 1));

		world.addContactMaterial(new CANNON.ContactMaterial( desk_body_material, dice_body_material, {friction: 0.01, restitution: 0.5}));
		world.addContactMaterial(new CANNON.ContactMaterial( barrier_body_material, dice_body_material, {friction: 0, restitution: 1.0}));
		world.addContactMaterial(new CANNON.ContactMaterial( dice_body_material, dice_body_material, {friction: 0, restitution: 0.5}));
		world.add(new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: desk_body_material}));
		
		barrier = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: barrier_body_material});
		barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
		barrier.position.set(0, display.containerHeight * 0.93, 0);
		world.add(barrier);

		barrier = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: barrier_body_material});
		barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
		barrier.position.set(0, -display.containerHeight * 0.93, 0);
		world.add(barrier);

		barrier = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: barrier_body_material});
		barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
		barrier.position.set(display.containerWidth * 0.93, 0, 0);
		world.add(barrier);

		barrier = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: barrier_body_material});
		barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
		barrier.position.set(-display.containerWidth * 0.93, 0, 0);
		world.add(barrier);

		if (showdebugtracer) {
			//raycaster.setFromCamera( this.mouse.pos, this.camera );
			rayvisual = new THREE.ArrowHelper(raycaster.ray.direction, camera.position, 1000, 0xff0000);
			rayvisual.headWidth = rayvisual.headLength * 0.005;
			scene.add(rayvisual);
		}

		renderer.render(scene, camera);

		document.addEventListener('mousemove', onMouseMove, false);
	}
	public_interface['initialize'] = initialize; //register as 'public'

	const onMouseMove = (event) => {
		event.preventDefault();

		let clientX = (event.changedTouches && event.changedTouches.length) ? event.changedTouches[0].clientX : event.clientX;
		let clientY = (event.changedTouches && event.changedTouches.length) ? event.changedTouches[0].clientY : event.clientY;

		let xpercent = ( clientX / (display.currentWidth * 2) );
		let ypercent = ( clientY / (display.currentHeight * 2));

		if (xpercent <= 0.5) {
			mouse.pos.x = ((0.5-xpercent) * 2) *-1;
		} else {
			mouse.pos.x = (xpercent-0.5) * 2;
		}
		if (ypercent <= 0.5) {
			mouse.pos.y = (0.5-ypercent) * 2;
		} else {
			mouse.pos.y = ((ypercent-0.5) * 2) *-1;
		}

		if (raycaster && showdebugtracer) {
			raycaster.setFromCamera(mouse.pos, camera);
			rayvisual.setDirection(raycaster.ray.direction);
		}
	}
	public_interface['onMouseMove'] = onMouseMove; //register as 'public'

	const setDimensions = (dimensions) => {
		display.currentWidth = container.clientWidth / 2;
		display.currentHeight = container.clientHeight / 2;
		if (dimensions) {
			display.containerWidth = dimensions.w;
			display.containerHeight = dimensions.h;
		} else {
			display.containerWidth = display.currentWidth;
			display.containerHeight = display.currentHeight;
		}
		display.aspect = Math.min(display.currentWidth / display.containerWidth, display.currentHeight / display.containerHeight);
		display.scale = Math.sqrt(display.containerWidth * display.containerWidth + display.containerHeight * display.containerHeight) / 13;

		renderer.setSize(display.currentWidth * 2, display.currentHeight * 2);

		cameraHeight.max = display.currentHeight / display.aspect / Math.tan(10 * Math.PI / 180);

		cameraHeight.medium = cameraHeight.max / 1.5;
		cameraHeight.far = cameraHeight.max;
		cameraHeight.close = cameraHeight.max / 2;

		if (camera) scene.remove(camera);
		camera = new THREE.PerspectiveCamera(20, display.currentWidth / display.currentHeight, 1, cameraHeight.max * 1.3);

		switch (animstate) {
			case 'selector':
				camera.position.z = selector.dice.length > 9 ? cameraHeight.far : (selector.dice.length < 6 ? cameraHeight.close : cameraHeight.medium);
				break;
			case 'throw': case 'afterthrow': default: camera.position.z = cameraHeight.far;

		}

		camera.lookAt(new THREE.Vector3(0,0,0));
		
		var maxwidth = Math.max(display.containerWidth, display.containerHeight);

		if (light) scene.remove(light);
		light = new THREE.SpotLight(colors.spotlight, 1.0);
		light.position.set(-maxwidth / 2, maxwidth / 2, maxwidth * 2);
		light.target.position.set(0, 0, 0);
		light.distance = maxwidth * 5;
		light.castShadow = shadows;
		light.shadow.camera.near = maxwidth / 10;
		light.shadow.camera.far = maxwidth * 5;
		light.shadow.camera.fov = 50;
		light.shadow.bias = 0.001;
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;
		scene.add(light);

		if (desk) scene.remove(desk);
		let shadowplane = new THREE.ShadowMaterial();
		shadowplane.opacity = 0.5;
		desk = new THREE.Mesh(new THREE.PlaneGeometry(display.containerWidth * 6, display.containerHeight * 6, 1, 1), shadowplane);
		desk.receiveShadow = shadows;
		scene.add(desk);

		if (rayvisual && showdebugtracer) {
			rayvisual = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 1000, 0xff0000);
			scene.add(rayvisual);
		}

		renderer.render(scene, camera);
	}
	public_interface['setDimensions'] = setDimensions; //register as 'public'

	const vectorRand = (vector) => {
		let angle = Math.random() * Math.PI / 5 - Math.PI / 5 / 2;
		let vec = {
			x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
			y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
		};
		if (vec.x == 0) vec.x = 0.01;
		if (vec.y == 0) vec.y = 0.01;
		return vec;
	}

	//returns an array of vectordata objects
	const getNotationVectors = (notation, vector, boost, dist) => {

		let notationVectors = new DiceNotation(notation);

		for (let i in notationVectors.set) {

			const diceobj = dicefactory.get(notationVectors.set[i].type);
			let numdice = notationVectors.set[i].num;
			let operator = notationVectors.set[i].op;
			let sid = notationVectors.set[i].sid;
			let gid = notationVectors.set[i].gid;
			let glvl = notationVectors.set[i].glvl;
			let func = notationVectors.set[i].func;
			let args = notationVectors.set[i].args;

			for(let k = 0; k < numdice; k++){

				let vec = vectorRand(vector);

				vec.x /= dist;
				vec.y /= dist;

				let pos = {
					x: display.containerWidth * (vec.x > 0 ? -1 : 1) * 0.9,
					y: display.containerHeight * (vec.y > 0 ? -1 : 1) * 0.9,
					z: Math.random() * 200 + 200
				};

				let projector = Math.abs(vec.x / vec.y);
				if (projector > 1.0) pos.y /= projector; else pos.x *= projector;


				let velvec = vectorRand(vector);

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
	const swapDiceFace = (dicemesh, result) => {

		const diceobj = dicefactory.get(dicemesh.notation.type);

		if (diceobj.shape == 'd4') {
			swapDiceFace_D4(dicemesh, result);
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
		var magic = 2;
		// except on d10 meshes
		if (diceobj.shape == 'd10') magic = 1;

		let material_value = (valueindex+magic);
		let material_result = (resultindex+magic);

		for (var i = 0, l = geom.faces.length; i < l; ++i) {
			var matindex = geom.faces[i].materialIndex;

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
	public_interface['swapDiceFace'] = swapDiceFace; //register as 'public'

	const swapDiceFace_D4 = (dicemesh, result) => {
		const diceobj = dicefactory.get(dicemesh.notation.type);
		let value = parseInt(dicemesh.getLastValue().value);
		result = parseInt(result);

		if (!(value >= 1 && value <= 4)) return;

		let num = value - result;
		let geom = dicemesh.geometry.clone();

        console.log('value', value, 'result', result, 'num', num, 'diceobj', diceobj);
        console.log('dicemesh', dicemesh);

        
		for (let i = 0, l = geom.faces.length; i < l; ++i) {

			let matindex = geom.faces[i].materialIndex;
			if (matindex == 0) continue;
        
            console.log('geom.faces[i].materialIndex', i, geom.faces[i].materialIndex);
			matindex += num - 1;

			while (matindex > 4) matindex -= 4;
			while (matindex < 1) matindex += 4;

            console.log('(matindex + 1)', (matindex + 1));

			geom.faces[i].materialIndex = matindex + 1;
		}
        if (num != 0) {
            if (num < 0) num += 4;

            dicemesh.material = dicefactory.createMaterials(diceobj, 0, 0, false, result);
        }

		dicemesh.resultReason = 'forced';
		dicemesh.geometry = geom;
	}
	public_interface['swapDiceFace_D4'] = swapDiceFace_D4; //register as 'public' console.log('temporary');

	//spawns one dicemesh object from a single vectordata object
	const spawnDice = (vectordata) => {
		const diceobj = dicefactory.get(vectordata.type);
		if(!diceobj) return;

		let dicemesh = dicefactory.create(diceobj.type);
		if(!dicemesh) return;

		dicemesh.notation = vectordata;
		dicemesh.result = [];
		dicemesh.stopped = 0;
		dicemesh.castShadow = shadows;
		dicemesh.body = new CANNON.Body({mass: diceobj.mass, shape: dicemesh.geometry.cannon_shape, material: dice_body_material});
		dicemesh.body.type = CANNON.Body.DYNAMIC;
		dicemesh.body.position.set(vectordata.pos.x, vectordata.pos.y, vectordata.pos.z);
		dicemesh.body.quaternion.setFromAxisAngle(new CANNON.Vec3(vectordata.axis.x, vectordata.axis.y, vectordata.axis.z), vectordata.axis.a * Math.PI * 2);
		dicemesh.body.angularVelocity.set(vectordata.angle.x, vectordata.angle.y, vectordata.angle.z);
		dicemesh.body.velocity.set(vectordata.velocity.x, vectordata.velocity.y, vectordata.velocity.z);
		dicemesh.body.linearDamping = 0.1;
		dicemesh.body.angularDamping = 0.1;

		dicemesh.body.addEventListener('collide', function(e) {
			if (!$t.DiceBox.sounds) return;

			if (e.body.mass > 0) { // dice to dice collision
				let speed = e.body.velocity.length();
				if (speed < 250) return;

				let strength = 0.1;
				let high = 12000;
				let low = 250;
				strength = Math.max(Math.min(speed / (high-low), 1), strength);

				let sound = sounds_dice[Math.floor(Math.random() * sounds_dice.length)];
				sound.volume = (strength * ($t.DiceBox.volume/100));
				sound.play();

			} else { // dice to table collision
				let speed = e.target.velocity.length();
				if (speed < 250) return;

				let surface = 'felt';
				let strength = 0.2;
				let high = 12000;
				let low = 250;
				strength = Math.max(Math.min(speed / (high-low), 1), strength);

				let soundlist = sounds_table[surface];
				let sound = soundlist[Math.floor(Math.random() * soundlist.length)];
				sound.volume = (strength * ($t.DiceBox.volume/100));
				sound.play();
			}
		});

		scene.add(dicemesh);
		diceList.push(dicemesh);
		world.add(dicemesh.body);
	}

	//resets vectors on dice back to startign notation values for a roll after simulation.
	const resetDice = (dicemesh, vectordata) => {
		dicemesh.stopped = 0;
		dicemesh.body.type = CANNON.Body.DYNAMIC;
		dicemesh.body.position.set(vectordata.pos.x, vectordata.pos.y, vectordata.pos.z);
		dicemesh.body.quaternion.setFromAxisAngle(new CANNON.Vec3(vectordata.axis.x, vectordata.axis.y, vectordata.axis.z), vectordata.axis.a * Math.PI * 2);
		dicemesh.body.angularVelocity.set(vectordata.angle.x, vectordata.angle.y, vectordata.angle.z);
		dicemesh.body.velocity.set(vectordata.velocity.x, vectordata.velocity.y, vectordata.velocity.z);
		dicemesh.body.linearDamping = 0.1;
		dicemesh.body.angularDamping = 0.1;
	}

	const solverBodyStopped = (physicsbody) => {
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

	const throwFinished = () => {
		let stopped = 0;
		let stoptimer = (framerate * 60) * 50; // 10 more iterations
		if (iteration > 1000) return true;
		if (iteration < (10 / framerate)) {

			for (let i=0, len=diceList.length; i < len; ++i) {
				let dicemesh = diceList[i];

				// use a stoptimer to let the dice settle a bit before reading
				if (solverBodyStopped(dicemesh.body)) {

					if (dicemesh.stopped == 0) {
						dicemesh.stopped = iteration + stoptimer;
					}

					if(dicemesh.stopped < iteration) {
						++stopped;

						// store value and check for rerolls on second to last frae
						// before declaring this dice as stopped
						if (dicemesh.stopped == iteration-1) {

							// all dice in a set/dice group will have the same function and arguments due to sorting beforehand
							// this means the list passed in is the set of dice that need to be affected by this function
							let diceFunc = (dicemesh.notation.func) ? dicemesh.notation.func.toLowerCase() : '';

							dicemesh.storeRolledValue();

							if (diceFunc != '') {

								diceFunc = dicemesh.notation.func.toLowerCase();

								let funcdata = rethrowFunctions[diceFunc];
								console.log('funcdata', funcdata);	

								let reroll = false;
								if (funcdata && funcdata.method) {
									let method = funcdata.method;

									let diceFuncArgs = dicemesh.notation.args || '';
									console.log('diceFuncArgs', dicemesh.notation.args);
									reroll = funcdata.method(dicemesh, diceFuncArgs);
								}

								console.log('reroll', reroll);	


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
		return stopped == diceList.length;
	}

	const simulateThrow = () => {
		iteration = 0;
		settle_time = 0;
		rolling = true;
		console.log('stoptimer', (framerate * 60) * 50);

		while (!throwFinished()) {
			++iteration;
			world.step(framerate);
		}

		console.log('simulation iterations: ', iteration);
	}

	const animateThrow = (threadid, callback, notationVectors) => {
		animstate = 'throw';
		let time = (new Date()).getTime();
		let time_diff = (time - last_time) / 1000;
		if (time_diff > 3) time_diff = framerate;
		++iteration;

		// use optional adaptive timestep
		// for singleplayer use only
		// this method desyncs whe networked
		if (adaptive_timestep) {
			while (time_diff > framerate * 1.1) {
				world.step(framerate);
				time_diff -= framerate;
			}
			world.step(time_diff);
		} else {
			world.step(framerate);
		}

		// update physics interactions visually
		for (let i in scene.children) {
			let interact = scene.children[i];
			if (interact.body != undefined) {
				interact.position.copy(interact.body.position);
				interact.quaternion.copy(interact.body.quaternion);
			}
		}

		renderer.render(scene, camera);
		last_time = last_time ? time : (new Date()).getTime();

		// roll finished
		if (running == threadid && throwFinished()) {
			running = false;
			rolling = false;
			if(callback) callback(notationVectors);

			
			running = (new Date()).getTime();
			animateAfterThrow(running);
			return;
		}

		// roll not finished, keep animating
		if (running == threadid) {
			(function(call, tid, at, aftercall, vecs) {
				if (!at && time_diff < framerate) {
					setTimeout(function() { requestAnimationFrame(function() { call(tid, aftercall, vecs); }); }, (framerate - time_diff) * 1000);
				} else {
					requestAnimationFrame(function() { call(tid, aftercall, vecs); });
				}
			})(animateThrow, threadid, adaptive_timestep, callback, notationVectors);
		}
	}
	public_interface['animateThrow'] = animateThrow;

	const animateAfterThrow = (threadid) => {
		animstate = 'afterthrow';
		let time = (new Date()).getTime();
		let time_diff = (time - last_time) / 1000;
		if (time_diff > 3) time_diff = framerate;

		raycaster.setFromCamera( mouse.pos, camera );
		if (rayvisual) rayvisual.setDirection(raycaster.ray.direction);
		let intersects = raycaster.intersectObjects(diceList);
		if ( intersects.length > 0 ) {
			//setSelected(intersects[0].object);
		} else {
			//setSelected();
		}

		last_time = time;
		renderer.render(scene, camera);
		if (running == threadid) {
			(function(call, tid, at) {
				if (!at && time_diff < framerate) {
					setTimeout(function() { requestAnimationFrame(function() { call(tid); }); }, (framerate - time_diff) * 1000);
				} else {
					requestAnimationFrame(function() { call(tid); });
				}
			})(animateAfterThrow, threadid, adaptive_timestep);
		}
	}
	public_interface['animateAfterThrow'] = animateAfterThrow;

	const animateSelector = (threadid) => {
		animstate = 'selector';
		let time = (new Date()).getTime();
		let time_diff = (time - last_time) / 1000;
		if (time_diff > 3) time_diff = framerate;

		if (selector.rotate) {
			let angle_change = 0.005 * Math.PI;
			for (let i in diceList) {
				diceList[i].rotation.y += angle_change;
				diceList[i].rotation.x += angle_change / 4;
				diceList[i].rotation.z += angle_change / 10;
			}
		}

		raycaster.setFromCamera( mouse.pos, camera );
		if (rayvisual) rayvisual.setDirection(raycaster.ray.direction);
		let intersects = raycaster.intersectObjects(diceList);
		if ( intersects.length > 0 ) {
			setSelected(intersects[0].object);
		} else {
			setSelected();
		}

		last_time = time;
		renderer.render(scene, camera);
		if (running == threadid) {
			(function(call, tid, at) {
				if (!at && time_diff < framerate) {
					setTimeout(function() { requestAnimationFrame(function() { call(tid); }); }, (framerate - time_diff) * 1000);
				} else {
					requestAnimationFrame(function() { call(tid); });
				}
			})(animateSelector, threadid, adaptive_timestep);
		}
	}
	public_interface['animateSelector'] = animateSelector;

	//returns a dicemesh under the mouse using raytracing
	const getDiceAtMouse = (event) => {
		if (rolling) return;
		if (event) onMouseMove(event);

		raycaster.setFromCamera( mouse.pos, camera );
		if (rayvisual) rayvisual.setDirection(raycaster.ray.direction);
		let intersects = raycaster.intersectObjects(diceList);

		//this.scene.add(new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 1000, 0x00ff00) );

		if (intersects.length) return intersects[0].object.userData;
	}
	public_interface['getDiceAtMouse'] = getDiceAtMouse;

	const setSelected = (dicemesh = null) => {

		if ( dicemesh != null ) {

			if ( selector.intersected ) {
				for(let i = 0, l = selector.intersected.material.length; i < l; i++){
					if (i == 0) continue;
					selector.intersected.material[i].emissive.setHex( selector.intersected.currentHex );
					selector.intersected.material[i].emissiveIntensity = selector.intersected.currentintensity;
				}
			}

			selector.intersected = dicemesh;
			selector.intersected.currentHex = selector.intersected.material[1].emissive.getHex();
			selector.intersected.currentintensity = selector.intersected.material[1].emissiveIntensity;

			for(let i = 0, l = selector.intersected.material.length; i < l; i++){
				if (i == 0) continue;
				selector.intersected.material[i].emissive.setHex( 0xffffff );
				selector.intersected.material[i].emissiveIntensity = 0.5;
			}
		} else {
			if ( selector.intersected ) {
				for(let i = 0, l = selector.intersected.material.length; i < l; i++){
					if (i == 0) continue;
					selector.intersected.material[i].emissive.setHex( selector.intersected.currentHex );
					selector.intersected.material[i].emissiveIntensity = selector.intersected.currentintensity;
				}
			}
			selector.intersected = null;
		}
		
	}
	public_interface['setSelected'] = setSelected;

	const showSelector = (alldice = false) => {
		if (rolling) return;
		clearDice();
		let step = display.containerWidth / 5;


		renderer.shadowMap.enabled = shadows;

		if (pane) scene.remove(pane);
		if (shadows) {
			let shadowplane = new THREE.ShadowMaterial();
			shadowplane.opacity = 0.5;

			pane = new THREE.Mesh(new THREE.PlaneGeometry(display.containerWidth * 6, display.containerHeight * 6, 1, 1), shadowplane);
			pane.receiveShadow = shadows;
			pane.position.set(0, 0, 1);
			scene.add(pane);
		}

		let selectordice = alldice ? Object.keys(dicefactory.dice) : selector.dice;
		camera.position.z = selectordice.length > 9 ? cameraHeight.far : (selectordice.length < 3 ? cameraHeight.close : cameraHeight.medium);
		let posxstart = selectordice.length > 9 ? -4 : (selectordice.length < 3 ? -0.5 : -1);
		let posystart = selectordice.length > 9 ? 1.5 : (selectordice.length < 4 ? 0 : 1);
		let poswrap = selectordice.length > 9 ? 4 : (selectordice.length < 4 ? 2 : 1);

		for (let i = 0, posx = posxstart, posy = posystart; i < selectordice.length; ++i, ++posx) {

			if (posx > poswrap) {
				posx = posxstart;
				posy--;
			}

			let dicemesh = dicefactory.create(selectordice[i]);
			dicemesh.position.set(posx * step, posy * step, step * 0.5);
			dicemesh.castShadow = shadows;
			dicemesh.userData = selectordice[i];

			diceList.push(dicemesh);
			scene.add(dicemesh);
		}

		running = (new Date()).getTime();
		last_time = 0;
		if (selector.animate) animateSelector(running);
		else renderer.render(scene, camera);

	}
	public_interface['showSelector'] = showSelector;

	const startClickThrow = (notation) => {
		if (rolling) return;

		let vector = { x: (Math.random() * 2 - 1) * display.currentWidth, y: -(Math.random() * 2 - 1) * display.currentHeight };
		let dist = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
		let boost = (Math.random() + 3) * dist;

		return getNotationVectors(notation, vector, boost, dist);
	}
	public_interface['startClickThrow'] = startClickThrow;

	const startDragThrow = (event) => {
		event.preventDefault();
		mouse.startDragTime = (new Date()).getTime();
		mouse.startDrag = $t.get_mouse_coords(event);
	}
	public_interface['startDragThrow'] = startDragThrow;

	const endDragThrow = (event, notation) => {
		if (rolling) return;
		if (mouse.startDrag == undefined) return;
		if (mouse.startDrag && event.changedTouches && event.changedTouches.length == 0) {
			return;
		}
		event.stopPropagation();

		let m = $t.get_mouse_coords(event);
		let vector = { x: m.x - mouse.startDrag.x, y: -(m.y - mouse.startDrag.y) };
		mouse.startDrag = undefined;
		let dist = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
		if (dist < Math.sqrt(display.currentWidth * display.currentHeight * 0.01)) return;
		let time_int = (new Date()).getTime() - mouse.startDragTime;
		if (time_int > 2000) time_int = 2000;
		let boost = Math.sqrt((2500 - time_int) / 2500) * dist * 2;
		
		return getNotationVectors(notation, vector, boost, dist);
	}
	public_interface['endDragThrow'] = endDragThrow;

	const clearDice = () => {
		running = false;
		let dice;
		while (dice = diceList.pop()) {
			scene.remove(dice); 
			if (dice.body) world.remove(dice.body);
		}
		if (pane) scene.remove(pane);
		renderer.render(scene, camera);

		setTimeout(function() { renderer.render(scene, camera); }, 100);
	}
	public_interface['clearDice'] = clearDice;

	const rollDice = (notationVectors, callback) => {

		if (notationVectors.error) {
			callback();
			return;
		}

		camera.position.z = cameraHeight.far;
		clearDice();

		for (let i=0, len=notationVectors.vectors.length; i < len; ++i) {
			spawnDice(notationVectors.vectors[i]);
		}
		simulateThrow();
		
		iteration = 0;
		settle_time = 0;

		//check forced results, fix dice faces if necessary
		if (notationVectors.result && notationVectors.result.length > 0) {
			for (let i in notationVectors.result) {
				let dicemesh = diceList[i];
				if (!dicemesh) continue;
				console.log('dicemesh.getLastValue().value', dicemesh.getLastValue().value, 'notationVectors.result[i]', parseInt(notationVectors.result[i]));
				if (dicemesh.getLastValue().value == notationVectors.result[i]) continue;
				swapDiceFace(dicemesh, notationVectors.result[i]);
			}
		}

		//reset dice vectors
		for (let i=0, len=diceList.length; i < len; ++i) {
			if (!diceList[i]) continue;

			if (diceList[i].resultReason != 'forced') {
				diceList[i].result = [];
			}

			resetDice(diceList[i], notationVectors.vectors[i]);
		}

		// animate the previously simulated roll
		rolling = true;
		running = (new Date()).getTime();
		last_time = 0;
		animateThrow(running, callback, notationVectors);

	}
	public_interface['rollDice'] = rollDice;

	const getDiceTotals = (notationVectors, array_dicemeshes) => {

		let valueSets = [];
		let labelSets = [];
		console.log('notationVectors', notationVectors);
		console.log('array_dicemeshes', array_dicemeshes);

		// first calculate all sets into values
		// '4d20', '8d6', etc
		// step 1: sort all results into corresponding sets with values and labels
		for(let i = 0; i < array_dicemeshes.length; i++) {
			let notation = array_dicemeshes[i].notation;
			let diceobj =  $t.DiceFactory.get(notation.type);

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
			setValues.push(diceGroupCombine(notationVectors, set));
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

		console.log('groupLevels', groupLevels);

		//let results = {rolls: '', labels: '', values: ''};
		let results = diceGroupCombine(notationVectors, labelSets);
		results.op = '';
		results.values = '';

		//step 6: iterate the levels combining all sets in a group at that level
		// iterate levels first, levels should be in descending order
		//  so we start at the deepest level first and work upwards

		let groupLevelsKeys = Object.keys(groupLevels).reverse();
		console.log('groupLevelsKeys', groupLevelsKeys);

		for (let key=0, len=groupLevelsKeys.length; key < len; ++key) {

			let level = groupLevelsKeys[key];
			let groupsInLevel = groupLevels[level];
			if (!groupsInLevel) continue;


			console.log('groupLevel[key] = value: ', level, groupsInLevel);

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

						console.log('groupResults', level, groupid, i, groupResults);
						resultsForGroup.values = operate(resultsForGroup.values, groupResult.op, groupResult.values);
					}

				}
				console.log('resultsForGroup', level, groupid, resultsForGroup);

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

					resultsForLevel.values = operate(resultsForLevel.values, resultsForGroup.op, resultsForGroup.values);
				//}
			}
			console.log('resultsForLevel', level, resultsForLevel);


			if (resultsForLevel.rolls.length > 0) results.rolls += resultsForLevel.rolls+'';
			if (resultsForLevel.labels.length > 0) results.labels += resultsForLevel.labels;

			if (results.op == '') results.op = resultsForLevel.op;
			if (results.values == '' && resultsForLevel.values != '') results.values = parseInt(results.values) || 0;

			//if (results.length == 1) {
			//    resultsForLevel.values = resultsForGroup.values;
			//    resultsForLevel.op = resultsForGroup.op;
			//} else {

				results.values = operate(results.values, resultsForLevel.op, resultsForLevel.values);
			//}
		}

		console.log('results', results);
		return results;
	}

	// returns object: {rolls: String, labels: String, values: Int, op: String, gid: Int, glvl: Int}
	const diceGroupCombine = (notationVectors, dicemeshList) => {

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
			console.log('diceFunc', diceFunc);

			if (diceFuncArgs == '' && dicemeshList[0] && dicemeshList[0].notation && dicemeshList[0].notation.args) {
				diceFuncArgs = dicemeshList[0].notation.args;
				console.log('diceFuncArgs', diceFuncArgs);
			}

			console.log('afterThrowFunctions', afterThrowFunctions);
			if (diceFunc != '') {
				let funcdata = afterThrowFunctions[diceFunc];

				console.log('funcdata', funcdata);

				if (funcdata && funcdata.method) {
					let method = funcdata.method;
					dicemeshList = funcdata.method(dicemeshList, diceFuncArgs);
				}
			}

		}
		

		// split up results between known systems, symbol, and number dice
		for(let i = 0; i < dicemeshList.length; i++){

			let dicemesh = dicemeshList[i];
			let diceobj =  $t.DiceFactory.get(dicemesh.notation.type);
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
				let lastValue = numberdice[i].getLastValue().label;

				let ignoredclass = lastValue.ignore ? ' ignored' : '';

				rolltext.push('<span class="diceresult'+ignoredclass+'" data-uuid="'+numberdice[i].uuid+'">'+lastValue.label+'</span>');

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

				values = operate(values, numberdice[i].notation.op, lastValue.value);
			}

			rolls += rolltext.join('+');
		}


		// grab the operator, groupid and grouplevel from the first item
		let op = dicemeshList[0] ? dicemeshList[0].notation.op || '+' : '+';
		let gid = dicemeshList[0] ? dicemeshList[0].notation.gid || 0 : 0;
		let glvl = dicemeshList[0] ? dicemeshList[0].notation.glvl || 0 : 0;

		return {rolls: rolls, labels: labels, values: values, op: op, gid: gid, glvl: glvl};
		
	}
	public_interface['getDiceTotals'] = getDiceTotals;

	function operate(valuea, operator, valueb) {
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

	return public_interface;
}