"use strict";


class DiceFavorites {

	constructor() {
		this.favtemplate = $('.fav_draggable');
		this.savetimeout = null;

		let storage = this.getStorage();
		if (storage == null) return;

		this.settings = {
			allowDiceOverride: { value: '1', default: '1'},
			system: { value: 'd20', default: 'd20'},
			colorset: { value: 'random', default: 'random'},
			texture: { value: '', default: ''},
			theme: { value: 'blue-felt', default: 'blue-felt'}
		};

		if (storage.getItem('DiceFavorites') != '1') {
			storage.setItem('DiceFavorites', '1');
			this.store();
		}

		this.retrieveSettings();
	}

	storeSettings() {
		let storage = this.getStorage();
		if (storage == null) return;

		const properties = Object.entries(this.settings);
		for (const [key, entry] of properties) {
			storage.setItem('DiceFavorites.settings.'+key, entry.value);
		}
	}

	retrieveSettings() {
		let storage = this.getStorage();
		if (storage == null) return;

		const properties = Object.entries(this.settings);
		for (const [key, entry] of properties) {
			console.log('properties', key, entry);

			let value = storage.getItem('DiceFavorites.settings.'+key) || entry.default;

			// happens if old settings info is retrieved with invalid data
			// set default and save again
			if (value == undefined || value == null || value == 'null' || value == 'undefined') {
				value = entry.default;
				storage.setItem('DiceFavorites.settings.'+key, value);
			} 

			if (!(typeof this.settings[key] == 'object')) {
				this.settings[key] = {};
			}

			this.settings[key].value = value;
		}
	}

	storageAvailable(type) {
	    var storage;
	    try {
	        storage = window[type];
	        var x = '__storage_test__';
	        storage.setItem(x, x);
	        storage.removeItem(x);
	        return true;
	    }
	    catch(e) {
	        return e instanceof DOMException && (
	            // everything except Firefox
	            e.code === 22 ||
	            // Firefox
	            e.code === 1014 ||
	            // test name field too, because code might not be present
	            // everything except Firefox
	            e.name === 'QuotaExceededError' ||
	            // Firefox
	            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
	            // acknowledge QuotaExceededError only if there's something already stored
	            (storage && storage.length !== 0);
	    }
	}

	getStorage() {
		let storage = null;
		
		if (this.storageAvailable('localStorage')) storage = localStorage;
		if (storage == null && this.storageAvailable('sessionStorage')){
			console.log('Local Storage is not available');
			storage = sessionStorage;
		} 
		if (storage == null) {
			console.log('Local Storage and Session Storage are not available');
		}
		return storage;
	}

	create(name, notation = '', colorset = '', texture = '', x = null, y = null) {

		x = x == null ? (window.innerWidth / 4) : x;
		y = y == null ? (window.innerHeight / 4) : y;

		let draggable = this.favtemplate.clone(true);

        draggable.find('.fav_name').text(name);        

        let textwidth = Math.min(Math.max((notation.length+1), 4), 40);

        draggable.find('.fav_notation').val(notation).css({width: textwidth+'ex'}).on('keyup change', function () {

        	let textwidth = Math.min(Math.max(($(this).val().length+1), 4), 20);

        	$(this).css({width: textwidth+'ex'});
        	teal.DiceFavorites.store();
        });

        draggable.find('.fav_colorset').val(colorset);
        draggable.find('.fav_texture').val(texture);

        draggable.find('.fav_delete').click(function() {
        	$(this).parent().remove();
        	teal.DiceFavorites.store();
        });

        draggable.find('.fav_edit').click(function() {
        	let newname = prompt('Enter a Title', $(this).parent().find('.fav_name').text());
        	$(this).parent().find('.fav_name').empty().text(newname);
        	teal.DiceFavorites.store();
        });

        draggable.find('.fav_throw').click(function() {
        	$('#set').val($(this).parent().find('.fav_notation').val());
        	$t.raise_event($t.id('throw'), 'mouseup');
        });

        draggable.draggable({
        	scroll: false,
        	snap: true,
        	stack: '.fav_draggable',
        	containment: 'window',
        	snapTolerance: 10,
        	start: function () {
        		console.log('start drag');
        	},
        	stop: function() {
        		teal.DiceFavorites.ensureOnScreen();
        		teal.DiceFavorites.store();
        	}
        });
        draggable.css({position: 'absolute', left: x, top: y, display: 'block'});

        this.favtemplate.parent().append(draggable);

		return draggable;
	}

	ensureOnScreen() {

		$('.fav_draggable').each(function(index, el) {

				let pos = $(this).offset();
				if (!pos) return;

        		if (pos.left + $(this).width() > window.innerWidth) {
        			pos.left = window.innerWidth - $(this).width();
        		}

        		if (pos.top + $(this).height() > window.innerHeight) {
        			pos.top = window.innerHeight - $(this).height();
        		}

        		$(this).offset(pos);
		});

	}

	store() {

		if (this.savetimeout) {
			clearTimeout(this.savetimeout);
			this.savetimeout = null;
		}

		this.storeSettings();

		let storage = this.getStorage();
		if (storage == null) return;

		let entries = [];
		$('.fav_draggable').each(function(i,e) {

			if (i == 0) return; //skip the first entry as this is the template

			let element = $(e);

			entries.push({
				name: element.find('.fav_name').text(),
				notation: element.find('.fav_notation').val(),
				colorset: element.find('.fav_colorset').val(),
				texture: element.find('.fav_texture').val(),
				x: element.offset().left, 
				y: element.offset().top
			});
		});

		storage.setItem('DiceFavorites.favorites', JSON.stringify(entries));
	}

	retrieve() {

		this.retrieveSettings();

		let storage = this.getStorage();
		if (storage == null) return;

		let savedata = JSON.parse(storage.getItem('DiceFavorites.favorites'));

		if (savedata == null) return;

		for(let i = 0, l = savedata.length; i < l; i++){
			let entry = savedata[i];

			this.create(entry.name, entry.notation, entry.colorset, entry.texture, entry.x, entry.y);
		}
	}
}