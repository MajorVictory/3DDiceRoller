"use strict"

class DiceFunctions {

	constructor(dicebox) {
		this.dicebox = dicebox;
		//this.dicebox.registerDiceFunction('t', this.template, this.templateHelp());
		this.dicebox.registerAfterThrowFunction('a', this.advantage, this.advantageHelp());
		this.dicebox.registerAfterThrowFunction('d', this.disadvantage, this.disadvantageHelp());

		this.dicebox.registerAfterThrowFunction('f', this.filter, this.filterHelp());

		this.dicebox.registerRethrowFunction('r', this.rethrowBasic, this.rethrowBasicHelp());
	}

	// Array dicemeshList: contains only the dice results affected by this function
	// String args: an arbitrary string passed in through the original notation
	// returns Array dicemeshList: a modified dicemeshList to be used for totaling
	template(dicemeshList, args) {

		let resultList = [];

		for (let i=0, len=dicemeshList.length; i < len; ++i) {
			let dicemesh = dicemeshList[i];

			// an object with the current dice face values
			// {value: Int, label: String}
			let result = dicemesh.result;

			//a full DiceNotation object
			let notation = dicemesh.notation;

			//a full DiceFactory object
			// contains labels/values for all sides, colorset, and dice system info
			let diceobj =  $t.DiceFactory.get(dicemesh.shape);

			//do what you need to add/remove/change results
			
		}
		return resultList;

	}
	templateHelp() {
		let output = '';
		output += 'Usage: {h[N]}<br>';
		output += 'Description of what i do.<br>';
		output += 'Arguments: N, any number';
		return output;
	}

	// rethrow methods only recieve one die at a time
	// returns boolean to indicate if dice given needs to be rethrown
	rethrowBasic(dicemesh, args) {

		let latestresult = dicemesh.getLastValue();
		if (!latestresult.value) return false;

		return (latestresult.value == parseInt(args));
	}

	rethrowBasicHelp() {
		let output = '';
		output += 'Usage: {r#}<br>';
		output += 'Rethrows any dice that lands on #<br>';
		return output;
	}

	filter(dicemeshList, args) {
		let resultList = [];
		for (let i=0, len=dicemeshList.length; i < len; ++i) {
			let dicemesh = dicemeshList[i];
			let result = dicemesh.result;
			let notation = dicemesh.notation;
			let diceobj =  $t.DiceFactory.get(dicemesh.shape);
			
		}
		return resultList;
	}

	filterHelp() {
		let output = '';
		output += 'Usage: {f[N][>=|<=|>|<|= A]}<br>';
		output += 'Takes N dice that pass the requirments of A and drops the rest.<br>';
		output += '';
		return output;
	}

	advantage(dicemeshList, args) {
		let highest = null;

		//find highest dice, store it
		for (let i=0, len=dicemeshList.length; i < len; ++i) {
			let dicemesh = dicemeshList[i];

			if (!highest) highest = dicemesh;
			highest = highest.result.value >= dicemesh.result.value ? highest : dicemesh;
		}

		// loop through and mark the other dice as ignore
		for (let i=0, len=dicemeshList.length; i < len; ++i) {
			let dicemesh = dicemeshList[i];
			dicemesh.notation.ignore = (highest.uuid != dicemesh.uuid);
		}
		return [highest];
	}

	advantageHelp() {
		let output = '';
		output += 'Usage: {a}<br>';
		output += 'Keeps only one of the highest value dice.<br>';
		return output;
	}

	disadvantage(dicemeshList, args) {
		let lowest = null;
		for (let i=0, len=dicemeshList.length; i < len; ++i) {
			let dicemesh = dicemeshList[i];

			if (!lowest) lowest = dicemesh;
			lowest = lowest.result.value <= dicemesh.result.value ? lowest : dicemesh;
		}
		return [lowest];
	}

	disadvantageHelp() {
		let output = '';
		output += 'Usage: {d}<br>';
		output += 'Keeps only one of the lowest value dice.<br>';
		return output;
	}

}


