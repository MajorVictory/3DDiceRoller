"use strict"


class DiceFactory {

	constructor() {
		this.dice = {};
		this.geometries = {};

		this.baseScale = 50;

		this.materials_cache = {};
   		this.cache_hits = 0;
    	this.cache_misses = 0;

	    this.label_color = '';
	    this.dice_color = '';
	    this.label_outline = '';
	    this.dice_texture = '';

	    this.material_options = {
	        specular: 0x0,
	        color: 0xb5b5b5,
	        shininess: 0,
	        flatShading: true
	    };

	    this.canvas;

		let diceobj = new DicePreset('d1', 'd6');
		diceobj.setLabels(['1']);
		diceobj.setValues(1,1);
		diceobj.scale = 0.9;
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('d2', 'd6');
		diceobj.setLabels(['1', '2']);
		diceobj.setValues(1,2);
		diceobj.scale = 0.9;
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('d3', 'd6');
		diceobj.setLabels(['1', '2', '3']);
		diceobj.setValues(1,3);
		diceobj.scale = 0.9;
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('df', 'd6');
		diceobj.setLabels(['-', '0', '+']);
		diceobj.setValues(-1,1);
		diceobj.scale = 0.9;
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('d4');
		diceobj.setLabels(['1', '2', '3', '4']);
		diceobj.setValues(1,4);
        diceobj.inertia = 5;
		diceobj.scale = 1.2;
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('d6');
		diceobj.setLabels(['1', '2', '3', '4', '5', '6']);
		diceobj.setValues(1,6);
		diceobj.scale = 0.9;
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('dsex', 'd6');
		diceobj.setLabels(['🍆', '🍑', '👌', '💦', '🙏', '💥']);
		diceobj.setValues(1,6);
		diceobj.scale = 0.9;
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('d8');
		diceobj.setLabels(['1', '2', '3', '4', '5', '6', '7', '8']);
		diceobj.setValues(1,8);
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('d10');
		diceobj.setLabels(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
		diceobj.setValues(1,8);
        diceobj.mass = 350;
        diceobj.inertia = 9;
		diceobj.scale = 0.9;
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('d100', 'd10');
		diceobj.setLabels(['00', '10', '20', '30', '40', '50', '60', '70', '80', '90']);
		diceobj.setValues(0, 90, 10);
        diceobj.mass = 350;
        diceobj.inertia = 9;
		diceobj.scale = 0.9;
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('d12');
		diceobj.setLabels(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
		diceobj.setValues(1,12);
        diceobj.mass = 350;
        diceobj.inertia = 8;
		diceobj.scale = 0.9;
		this.dice[diceobj.type] = diceobj;

		diceobj = new DicePreset('d20');
		diceobj.setLabels(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']);
		diceobj.setValues(1,20);
        diceobj.mass = 400;
        diceobj.inertia = 6;
		this.dice[diceobj.type] = diceobj;

		//star wars dice

		// Ability
		diceobj = new DicePreset('dab', 'd8');
		diceobj.setLabels(['s','a',"s\na","s\ns",'a','s',"a\na",'']);
		diceobj.setValues(1,8);
        diceobj.font = 'EOTE Symbol';
        diceobj.color = '#00FF00';
		this.dice[diceobj.type] = diceobj;

        // Difficulty
        diceobj = new DicePreset('dif', 'd8');
        diceobj.setLabels(['t','f',"f\nt",'t','',"t\nt", "f\nf", 't']);
        diceobj.setValues(1,8);
        diceobj.font = 'EOTE Symbol';
        diceobj.color = '#8000FC';
        this.dice[diceobj.type] = diceobj;

        // Proficiency
        diceobj = new DicePreset('pro', 'd12');
        diceobj.setLabels(["a\na",'a',"a\na",'x','s',"s\na",'s',"s\na","s\ns","s\na","s\ns",'']);
        diceobj.setValues(1,12);
        diceobj.mass = 350;
        diceobj.inertia = 8;
        diceobj.scale = 0.9;
        diceobj.font = 'EOTE Symbol';
        diceobj.color = '#FFFF00';
        this.dice[diceobj.type] = diceobj;

        // Challenge
        diceobj = new DicePreset('cha', 'd12');
        diceobj.setLabels(["t\nt",'t',"t\nt",'t',"t\nf",'f',"t\nf",'f',"f\nf",'y',"f\nf",'']);
        diceobj.setValues(1,12);
        diceobj.mass = 350;
        diceobj.inertia = 8;
        diceobj.scale = 0.9;
        diceobj.font = 'EOTE Symbol';
        diceobj.color = '#FF0000';
        this.dice[diceobj.type] = diceobj;

        // Force
        diceobj = new DicePreset('for', 'd12');
        diceobj.setLabels(['z',"Z\nZ",'z',"Z\nZ",'z',"Z\nZ",'z','Z','z','Z','z',"z\nz"]);
        diceobj.setValues(1,12);
        diceobj.mass = 350;
        diceobj.inertia = 8;
        diceobj.scale = 0.9;
        diceobj.font = 'EOTE Symbol';
        diceobj.color = '#FFFFFF';
        this.dice[diceobj.type] = diceobj;

        // Boost
        diceobj = new DicePreset('boo', 'd6');
        diceobj.setLabels(["s  \n  a","a  \n  a",'s','a','','']);
        diceobj.setValues(1,6);
        diceobj.scale = 0.9;
        diceobj.font = 'EOTE Symbol';
        diceobj.color = '#00FFFF';
        this.dice[diceobj.type] = diceobj;

        // Setback
        diceobj = new DicePreset('set', 'd6');
        diceobj.setLabels(['','t','f']);
        diceobj.setValues(1,3);
        diceobj.scale = 0.9;
        diceobj.font = 'EOTE Symbol';
        this.dice[diceobj.type] = diceobj;
	}

	create(type) {
		let diceobj = this.dice[type];
		if (!diceobj) return null;

		let geom = this.geometries[type];
		if(!geom) {
			geom = this.createGeometry(diceobj.shape, diceobj.scale * this.baseScale);
			this.geometries[type] = geom;
		}
		if (!geom) return null;

		this.setRandomMaterialInfo();
        let mesh = new THREE.Mesh(geom, this.createMaterials(diceobj, this.baseScale / 2, 1.0));

        if (diceobj.color) {
            mesh.material[0].color = new THREE.Color(diceobj.color);
            mesh.material[0].emissive = new THREE.Color(diceobj.color);
            mesh.material[0].emissiveIntensity = 1;
            mesh.material[0].needsUpdate = true;
        }

        switch (type) {
        	case 'd1':
        		return this.fixmaterials(mesh, 1);
        	case 'd2':
        		return this.fixmaterials(mesh, 2);
        	case 'd3': case 'df': case 'set': 
        		return this.fixmaterials(mesh, 3);
        	default:
        		return mesh;
        }
	}

	get(type) {
		return this.dice[type];
	}

	getGeometry(type) {
		return this.geometries[type];
	}

	createMaterials(diceobj, size, margin) {

        var materials = [];
        let labels = diceobj.labels;
        if (diceobj.shape == 'd4') {
            labels = diceobj.labels[0];
            size = this.baseScale / 2;
            margin = this.baseScale * 2;
        }

        for (var i = 0; i < labels.length; ++i) {
            var mat = new THREE.MeshPhongMaterial(this.material_options);
            mat.map = this.createTextMaterial(diceobj, labels[i], size, margin, this.dice_texture_rand, this.label_color_rand, this.label_outline_rand, this.dice_color_rand)
            materials.push(mat);
        }
        return materials;
    }

    createTextMaterial(diceobj, text, size, margin, texture, forecolor, outlinecolor, backcolor) {
        if (text === undefined) return null;

        // an attempt at materials caching
        let cachestring = diceobj.type + text + texture.name + forecolor + outlinecolor + backcolor;
        if (diceobj.shape == 'd4') {
        	cachestring = diceobj.type + text.join() + texture.name + forecolor + outlinecolor + backcolor;
        }
        if (this.materials_cache[cachestring] != null) {
            this.cache_hits++;
            return this.materials_cache[cachestring];
        }

        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        //context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let ts;

        if (diceobj.shape == 'd4') {
        	ts = this.calc_texture_size(size + margin) * 2;
        } else {
            ts = this.calc_texture_size(size + size * 2 * margin) * 2;
        }

        canvas.width = canvas.height = ts;

        //create underlying texture
        if (texture.name != '' && texture.name != 'none') {
            context.drawImage(texture.texture, 0, 0, canvas.width, canvas.height);
            context.globalCompositeOperation = 'multiply';
        } else {
            context.globalCompositeOperation = 'source-over';
        }

        // create color
        context.fillStyle = backcolor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // create text
        context.globalCompositeOperation = 'source-over';
        context.textAlign = "center";
        context.textBaseline = "middle";

        if (diceobj.shape != 'd4') {

        	let fontsize = ts / (1 + 2 * margin);
       		context.font =  fontsize+ 'pt '+diceobj.font;

	        var lineHeight = context.measureText("M").width * 1.4;
	        let textlines = text.split("\n");
	        let textstarty = (canvas.height / 2);

	        if (textlines.length > 1) {
	            fontsize = fontsize / textlines.length;
	            context.font =  fontsize+ 'pt '+diceobj.font;
	            lineHeight = context.measureText("M").width * 1.2;
	            textstarty -= (lineHeight * textlines.length) / 3;
	        }

	        for(let i = 0, l = textlines.length; i < l; i++){
	            let text = textlines[i].trim();

	            // attempt to outline the text with a meaningful color
	            if (outlinecolor != 'none') {
	                context.strokeStyle = outlinecolor;
	                context.lineWidth = 5;
	                context.strokeText(textlines[i], canvas.width / 2, textstarty);
	                if (textlines[i] == '6' || textlines[i] == '9') {
	                    context.strokeText('  .', canvas.width / 2, textstarty);
	                }
	            }

	            context.fillStyle = forecolor;
	            context.fillText(textlines[i], canvas.width / 2, textstarty);
	            if (textlines[i] == '6' || textlines[i] == '9') {
	                context.fillText('  .', canvas.width / 2, textstarty);
	            }
	            textstarty += (lineHeight * 1.5);
	        }
	    } else {

	    	var hw = (canvas.width / 2);
            var hh = (canvas.height / 2);

       		context.font =  ((ts - margin) / 1.5)+'pt '+diceobj.font;

            //draw the numbers
            for (var i in text) {

                // attempt to outline the text with a meaningful color
                if (outlinecolor != 'none') {
                    context.strokeStyle = outlinecolor;
                    context.lineWidth = 5;
                    context.strokeText(text[i], hw, hh - ts * 0.3);
                }

                context.fillStyle = forecolor;
                context.fillText(text[i], hw, hh - ts * 0.3);
                context.translate(hw, hh);
                context.rotate(Math.PI * 2 / 3);
                context.translate(-hw, -hh);
            }
	    }

        var compositetexture = new THREE.CanvasTexture(canvas);
        // cache new texture
        this.cache_misses++;
        this.materials_cache[cachestring] = compositetexture;

        return compositetexture;
    }

    setRandomMaterialInfo() {
        //reset random choices
        this.dice_color_rand = '';
        this.label_color_rand = '';
        this.label_outline_rand = '';
        this.dice_texture_rand = '';

        // set base color first
        if (Array.isArray(this.dice_color)) {

            var colorindex = Math.floor(Math.random() * this.dice_color.length);

            // if color list and label list are same length, treat them as a parallel list
            if (Array.isArray(this.label_color) && this.label_color.length == this.dice_color.length) {
                this.label_color_rand = this.label_color[colorindex];

                // if label list and outline list are same length, treat them as a parallel list
                if (Array.isArray(this.label_outline) && this.label_outline.length == this.label_color.length) {
                    this.label_outline_rand = this.label_outline[colorindex];
                }
            }
            // if texture list is same length do the same
            if (Array.isArray(this.dice_texture) && this.dice_texture.length == this.dice_color.length) {
                this.dice_texture_rand = this.dice_texture[colorindex];
            }

            this.dice_color_rand = this.dice_color[colorindex];
        } else {
            this.dice_color_rand = this.dice_color;
        }

        // if selected label color is still not set, pick one
        if (this.label_color_rand == '' && Array.isArray(this.label_color)) {
            var colorindex = this.label_color[Math.floor(Math.random() * this.label_color.length)];

            // if label list and outline list are same length, treat them as a parallel list
            if (Array.isArray(this.label_outline) && this.label_outline.length == this.label_color.length) {
                this.label_outline_rand = this.label_outline[colorindex];
            }

            this.label_color_rand = this.label_color[colorindex];

        } else if (this.label_color_rand == '') {
            this.label_color_rand = this.label_color;
        }

        // if selected label outline is still not set, pick one
        if (this.label_outline_rand == '' && Array.isArray(this.label_outline)) {
            var colorindex = this.label_outline[Math.floor(Math.random() * this.label_outline.length)];

            this.label_outline_rand = this.label_outline[colorindex];
            
        } else if (this.label_outline_rand == '') {
            this.label_outline_rand = this.label_outline;
        }

        // same for textures list
        if (this.dice_texture_rand == '' && Array.isArray(this.dice_texture)) {
            this.dice_texture_rand = this.dice_texture[Math.floor(Math.random() * this.dice_texture.length)];
        } else if (this.dice_texture_rand == '') {
            this.dice_texture_rand = this.dice_texture;
        }
    }

    calc_texture_size(approx) {
        return Math.pow(2, Math.floor(Math.log(approx) / Math.log(2)));
    }

	createGeometry(type, radius) {
		switch (type) {
			case 'd4':
				return this.create_d4_geometry(radius);
			case 'd6':
				return this.create_d6_geometry(radius);
			case 'd8':
				return this.create_d8_geometry(radius);
			case 'd10':
				return this.create_d10_geometry(radius);
			case 'd12':
				return this.create_d12_geometry(radius);
			case 'd20':
				return this.create_d20_geometry(radius);
			default:
				return null;
		}
	}

	create_d4_geometry(radius) {
        var vertices = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]];
        var faces = [[1, 0, 2, 1], [0, 1, 3, 2], [0, 3, 2, 3], [1, 2, 3, 4]];
        return this.create_geom(vertices, faces, radius, -0.1, Math.PI * 7 / 6, 0.96);
    }

    create_d6_geometry(radius) {
        var vertices = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
                [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
        var faces = [[0, 3, 2, 1, 1], [1, 2, 6, 5, 2], [0, 1, 5, 4, 3],
                [3, 7, 6, 2, 4], [0, 4, 7, 3, 5], [4, 5, 6, 7, 6]];
        return this.create_geom(vertices, faces, radius, 0.1, Math.PI / 4, 0.96);
    }

    create_d8_geometry(radius) {
        var vertices = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
        var faces = [[0, 2, 4, 1], [0, 4, 3, 2], [0, 3, 5, 3], [0, 5, 2, 4], [1, 3, 4, 5],
                [1, 4, 2, 6], [1, 2, 5, 7], [1, 5, 3, 8]];
        return this.create_geom(vertices, faces, radius, 0, -Math.PI / 4 / 2, 0.965);
    }

    create_d10_geometry(radius) {
        var a = Math.PI * 2 / 10, k = Math.cos(a), h = 0.105, v = -1;
        var vertices = [];
        for (var i = 0, b = 0; i < 10; ++i, b += a) {
            vertices.push([Math.cos(b), Math.sin(b), h * (i % 2 ? 1 : -1)]);
        }
        vertices.push([0, 0, -1]);
        vertices.push([0, 0, 1]);
        
        var faces = [[5, 7, 11, 0], [4, 2, 10, 1], [1, 3, 11, 2], [0, 8, 10, 3], [7, 9, 11, 4],
                [8, 6, 10, 5], [9, 1, 11, 6], [2, 0, 10, 7], [3, 5, 11, 8], [6, 4, 10, 9],
                [1, 0, 2, v], [1, 2, 3, v], [3, 2, 4, v], [3, 4, 5, v], [5, 4, 6, v],
                [5, 6, 7, v], [7, 6, 8, v], [7, 8, 9, v], [9, 8, 0, v], [9, 0, 1, v]];
        return this.create_geom(vertices, faces, radius, 0, Math.PI * 6 / 5, 0.945);
    }

    create_d12_geometry(radius) {
        var p = (1 + Math.sqrt(5)) / 2, q = 1 / p;
        var vertices = [[0, q, p], [0, q, -p], [0, -q, p], [0, -q, -p], [p, 0, q],
                [p, 0, -q], [-p, 0, q], [-p, 0, -q], [q, p, 0], [q, -p, 0], [-q, p, 0],
                [-q, -p, 0], [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1],
                [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]];
        var faces = [[2, 14, 4, 12, 0, 1], [15, 9, 11, 19, 3, 2], [16, 10, 17, 7, 6, 3], [6, 7, 19, 11, 18, 4],
                [6, 18, 2, 0, 16, 5], [18, 11, 9, 14, 2, 6], [1, 17, 10, 8, 13, 7], [1, 13, 5, 15, 3, 8],
                [13, 8, 12, 4, 5, 9], [5, 4, 14, 9, 15, 10], [0, 12, 8, 10, 16, 11], [3, 19, 7, 17, 1, 12]];
        return this.create_geom(vertices, faces, radius, 0.2, -Math.PI / 4 / 2, 0.968);
    }

    create_d20_geometry(radius) {
        var t = (1 + Math.sqrt(5)) / 2;
        var vertices = [[-1, t, 0], [1, t, 0 ], [-1, -t, 0], [1, -t, 0],
                [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
                [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
        var faces = [[0, 11, 5, 1], [0, 5, 1, 2], [0, 1, 7, 3], [0, 7, 10, 4], [0, 10, 11, 5],
                [1, 5, 9, 6], [5, 11, 4, 7], [11, 10, 2, 8], [10, 7, 6, 9], [7, 1, 8, 10],
                [3, 9, 4, 11], [3, 4, 2, 12], [3, 2, 6, 13], [3, 6, 8, 14], [3, 8, 9, 15],
                [4, 9, 5, 16], [2, 4, 11, 17], [6, 2, 10, 18], [8, 6, 7, 19], [9, 8, 1, 20]];
        return this.create_geom(vertices, faces, radius, -0.2, -Math.PI / 4 / 2, 0.955);
    }

    fixmaterials(mesh, unique_sides) {
        // this makes the mesh reuse textures for other sides
        for (let i = 0, l = mesh.geometry.faces.length; i < l; ++i) {
            var matindex = mesh.geometry.faces[i].materialIndex - 2;
            if (matindex < unique_sides) continue;

            let modmatindex = (matindex % unique_sides);

            mesh.geometry.faces[i].materialIndex = modmatindex + 2;
        }
        mesh.geometry.elementsNeedUpdate = true;
        return mesh;
    }

    create_shape(vertices, faces, radius) {
        var cv = new Array(vertices.length), cf = new Array(faces.length);
        for (var i = 0; i < vertices.length; ++i) {
            var v = vertices[i];
            cv[i] = new CANNON.Vec3(v.x * radius, v.y * radius, v.z * radius);
        }
        for (var i = 0; i < faces.length; ++i) {
            cf[i] = faces[i].slice(0, faces[i].length - 1);
        }
        return new CANNON.ConvexPolyhedron(cv, cf);
    }

    make_geom(vertices, faces, radius, tab, af) {
        var geom = new THREE.Geometry();
        for (var i = 0; i < vertices.length; ++i) {
            var vertex = vertices[i].multiplyScalar(radius);
            vertex.index = geom.vertices.push(vertex) - 1;
        }
        for (var i = 0; i < faces.length; ++i) {
            var ii = faces[i], fl = ii.length - 1;
            var aa = Math.PI * 2 / fl;
            for (var j = 0; j < fl - 2; ++j) {
                geom.faces.push(new THREE.Face3(ii[0], ii[j + 1], ii[j + 2], [geom.vertices[ii[0]],
                            geom.vertices[ii[j + 1]], geom.vertices[ii[j + 2]]], 0, ii[fl] + 1));
                geom.faceVertexUvs[0].push([
                        new THREE.Vector2((Math.cos(af) + 1 + tab) / 2 / (1 + tab),
                            (Math.sin(af) + 1 + tab) / 2 / (1 + tab)),
                        new THREE.Vector2((Math.cos(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab),
                            (Math.sin(aa * (j + 1) + af) + 1 + tab) / 2 / (1 + tab)),
                        new THREE.Vector2((Math.cos(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab),
                            (Math.sin(aa * (j + 2) + af) + 1 + tab) / 2 / (1 + tab))]);
            }
        }
        geom.computeFaceNormals();
        geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius);
        return geom;
    }

    chamfer_geom(vectors, faces, chamfer) {
        var chamfer_vectors = [], chamfer_faces = [], corner_faces = new Array(vectors.length);
        for (var i = 0; i < vectors.length; ++i) corner_faces[i] = [];
        for (var i = 0; i < faces.length; ++i) {
            var ii = faces[i], fl = ii.length - 1;
            var center_point = new THREE.Vector3();
            var face = new Array(fl);
            for (var j = 0; j < fl; ++j) {
                var vv = vectors[ii[j]].clone();
                center_point.add(vv);
                corner_faces[ii[j]].push(face[j] = chamfer_vectors.push(vv) - 1);
            }
            center_point.divideScalar(fl);
            for (var j = 0; j < fl; ++j) {
                var vv = chamfer_vectors[face[j]];
                vv.subVectors(vv, center_point).multiplyScalar(chamfer).addVectors(vv, center_point);
            }
            face.push(ii[fl]);
            chamfer_faces.push(face);
        }
        for (var i = 0; i < faces.length - 1; ++i) {
            for (var j = i + 1; j < faces.length; ++j) {
                var pairs = [], lastm = -1;
                for (var m = 0; m < faces[i].length - 1; ++m) {
                    var n = faces[j].indexOf(faces[i][m]);
                    if (n >= 0 && n < faces[j].length - 1) {
                        if (lastm >= 0 && m != lastm + 1) pairs.unshift([i, m], [j, n]);
                        else pairs.push([i, m], [j, n]);
                        lastm = m;
                    }
                }
                if (pairs.length != 4) continue;
                chamfer_faces.push([chamfer_faces[pairs[0][0]][pairs[0][1]],
                        chamfer_faces[pairs[1][0]][pairs[1][1]],
                        chamfer_faces[pairs[3][0]][pairs[3][1]],
                        chamfer_faces[pairs[2][0]][pairs[2][1]], -1]);
            }
        }
        for (var i = 0; i < corner_faces.length; ++i) {
            var cf = corner_faces[i], face = [cf[0]], count = cf.length - 1;
            while (count) {
                for (var m = faces.length; m < chamfer_faces.length; ++m) {
                    var index = chamfer_faces[m].indexOf(face[face.length - 1]);
                    if (index >= 0 && index < 4) {
                        if (--index == -1) index = 3;
                        var next_vertex = chamfer_faces[m][index];
                        if (cf.indexOf(next_vertex) >= 0) {
                            face.push(next_vertex);
                            break;
                        }
                    }
                }
                --count;
            }
            face.push(-1);
            chamfer_faces.push(face);
        }
        return { vectors: chamfer_vectors, faces: chamfer_faces };
    }

    create_geom(vertices, faces, radius, tab, af, chamfer) {
        var vectors = new Array(vertices.length);
        for (var i = 0; i < vertices.length; ++i) {
            vectors[i] = (new THREE.Vector3).fromArray(vertices[i]).normalize();
        }
        var cg = this.chamfer_geom(vectors, faces, chamfer);
        var geom = this.make_geom(cg.vectors, cg.faces, radius, tab, af);
        //var geom = make_geom(vectors, faces, radius, tab, af); // Without chamfer
        geom.cannon_shape = this.create_shape(vectors, faces, radius);
        return geom;
    }
}

class DicePreset {

	constructor(type, shape = '') {

		shape = shape || type;

		this.type = type;
		this.shape = shape || type;
		this.scale = 1;
        this.font = 'Arial';
        this.color = '';
		this.labels = [];
		this.values = [];
		this.mass = 300;
		this.inertia = 13;
		this.geometry = null;
	}

	setValues(min = 1, max = 20, step = 1) {
		this.values = this.range(min, max, step);
	}

	setLabels(labels) {

		this.labels.push('');
		if(this.shape != 'd10') this.labels.push('');

		if (this.shape == 'd4') {

			let a = labels[0];
			let b = labels[1];
			let c = labels[2];
			let d = labels[3];

			this.labels = [
		        [[], [0, 0, 0], [b, d, c], [a, c, d], [b, a, d], [a, b, c]],
		        [[], [0, 0, 0], [b, c, d], [c, a, d], [b, d, a], [c, b, a]],
		        [[], [0, 0, 0], [d, c, b], [c, d, a], [d, b, a], [c, a, b]],
		        [[], [0, 0, 0], [d, b, c], [a, d, c], [d, a, b], [a, c, b]]
		    ];
		} else {
			Array.prototype.push.apply(this.labels, labels)
		}
	}

    range(start, stop, step = 1) {
        var a = [start], b = start;
        while (b < stop) {
            a.push(b += step || 1);
        }
        return a;
    }
}