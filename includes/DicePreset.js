"use strict"

class DicePreset {

	constructor(type, shape = '') {

		shape = shape || type;

		this.type = type;
		this.name = '';
		this.shape = shape || type;
		this.scale = 1;
		this.font = 'Arial';
		this.color = '';
		this.labels = [];
		this.valueMap = [];
		this.values = [];
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