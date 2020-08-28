"use strict"

export class DicePreset {

	constructor(type, shape = '') {
		this.type = type;
		this.name = '';
		this.shape = shape || type;
		this.scale = 1;
		this.font = 'Arial';
		this.color = '';
		this.labels = [];
		this.valueMap = [];
		this.values = [];
		this.normals = [];
		this.mass = 300;
		this.inertia = 13;
		this.geometry = null;
		this.display = 'values';
		this.system = 'd20';
	}

	setValues(min = 1, max = 20, step = 1) {
		this.values = this.range(min, max, step);
	}

	setValueMap(map) {

		for(let i = 0; i < this.values.length; i++){
			let key = this.values[i];
			if (map[key] != null) this.valueMap[key] = map[key];
		}
	}

	registerFaces(faces, type = "labels"){
		let tab;

		if (type == "labels") {
			tab = this.labels;
		} else {
			tab = this.normals;
		}
		
		tab.push('');
		if(!["d2","d10"].includes(this.shape)) tab.push('');

		if (this.shape == 'd4') {

			let a = faces[0];
			let b = faces[1];
			let c = faces[2];
			let d = faces[3];

			this.labels = [
				[[], [0, 0, 0], [b, d, c], [a, c, d], [b, a, d], [a, b, c]],
				[[], [0, 0, 0], [b, c, d], [c, a, d], [b, d, a], [c, b, a]],
				[[], [0, 0, 0], [d, c, b], [c, d, a], [d, b, a], [c, a, b]],
				[[], [0, 0, 0], [d, b, c], [a, d, c], [d, a, b], [a, c, b]]
			];
		} else {
			Array.prototype.push.apply(tab, faces)
		}
	}

	setLabels(labels) {
		this.loadTextures(labels,this.registerFaces.bind(this),"labels");
	}

	setBumpMaps(normals){
		this.loadTextures(normals,this.registerFaces.bind(this),"bump");
	}

	loadTextures(textures,callback,type){
		let loadedImages = 0;
		let numImages = textures.length;
		let regexTexture = /\.(PNG|JPG|GIF|WEBP)$/i;
		let imgElements=Array(textures.length);
		let hasTextures = false;
		for (let i = 0;i<numImages;i++) {
			if(textures[i] == '' || !textures[i].match(regexTexture)) {
				imgElements[i] = textures[i];
				++loadedImages
				continue;
			}
			hasTextures = true;
			imgElements[i] = new Image();
			imgElements[i].onload = function() {
	
				if (++loadedImages >= numImages) {
					callback(imgElements,type);
				}
			};
			imgElements[i].src = textures[i];
		}
		if(!hasTextures)
			callback(imgElements,type);
	}

	range(start, stop, step = 1) {
		var a = [start], b = start;
		while (b < stop) {
			a.push(b += step || 1);
		}
		return a;
	}
}