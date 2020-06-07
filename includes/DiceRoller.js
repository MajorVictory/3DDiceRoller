"use strict";
import {Teal} from './Teal.js';
import {DiceBox} from './DiceBox.js';
import {DiceRoom} from './DiceRoom.js';
import {DiceFactory} from './DiceFactory.js';
import {DiceFavorites} from './DiceFavorites.js';
import {DiceFunctions} from './DiceFunctions.js';
import {DiceColors, THEMES, COLORSETS, TEXTURELIST, COLORCATEGORIES} from './DiceColors.js';

export class DiceRoller {

	constructor(imagesList) {

		this.Teal = new Teal();

		this.DiceFavorites = new DiceFavorites();
		this.DiceFavorites.favtemplate = $('.fav_draggable');

        this.DiceFactory = new DiceFactory();

        this.DiceColors = new DiceColors(this);
		this.DiceColors.textures = imagesList;
		this.DiceColors.initColorSets();

		this.DiceBox = null;

		// init colorset textures

		this.DiceRoom = null;

		this.connection_error_text = "connection error, please reload the page";
		this.control_panel_show = Teal.id('cp_showsettings');
		this.control_panel_hide = Teal.id('cp_hidesettings');
		this.selector_div = Teal.id('selector_div');
		this.theme_select = Teal.id('theme');
		this.surface_select = Teal.id('surface');
		this.system_select = Teal.id('system');
		this.color_select = Teal.id('color');
		this.texture_select = Teal.id('texture');
		this.socket_button = Teal.id('reconnect');
		this.desk = Teal.id('desk');
		this.toggle_selector = Teal.id('toggle_selector');
		this.parent_notation = Teal.id('parent_notation');
		this.parent_roll = Teal.id('parent_roll');
		this.deskrolling = false;

		//possibly only needed for DiceRoom
		this.cid = -1;
		this.user;
		this.room;
		this.canvas = Teal.id('canvas');
		this.label = Teal.id('label');
		this.set = Teal.id('set');
		this.info_div = Teal.id('info_div');
		this.diceset = [];

		window.addEventListener('message', this.on_receivePostMessage, false);
		window.addEventListener('resize', this.on_window_resize, false);
		window.addEventListener('beforeunload', this.close_socket, false);
		window.DiceRoller = this;

		// load theme
		let themeid = this.DiceFavorites.settings.theme.value;
		if (themeid != 'default') {
			let headelement = document.getElementsByTagName("head")[0];
			Teal.element('link', {rel: 'stylesheet', type: 'text/css', href: './includes/themes/'+themeid+'/style.css'}, headelement);
		}

		// fill in the select box for themes
		const themeprops = Object.entries(THEMES);
		for (const [key, value] of themeprops) {

			let attributes = {value: key};
			if(key == this.DiceFavorites.settings.theme.value) attributes['selected'] = 'selected';
			Teal.element('option', attributes, Teal.id('theme'), value.name);
		}

		// fill in the select box for dice sets
		const systemprops = Object.entries(this.DiceFactory.systems);
		for (const [key, value] of systemprops) {

			let attributes = {value: key};
			if(key == this.DiceFavorites.settings.system.value) attributes['selected'] = 'selected';
			Teal.element('option', attributes, Teal.id('system'), value.name);
		}

		// fill in the select box for colorsets
		for(let i = 0, l = COLORCATEGORIES.length; i < l; i++){
			var category = Teal.element('optgroup', {label: COLORCATEGORIES[i]}, Teal.id('color'), undefined);
			const itemprops = Object.entries(COLORSETS);
			for (const [key, value] of itemprops) {

				if (value.category == COLORCATEGORIES[i]) {
					let attributes = {value: key};
					if(key == this.DiceFavorites.settings.colorset.value) attributes['selected'] = 'selected';
					Teal.element('option', attributes, category, value.name);
				}
			}
		}

		// fill in the select box for textures
		const itemprops = Object.entries(TEXTURELIST);
		for (const [key, value] of itemprops) {

			let attributes = {value: key};
			if(key == this.DiceFavorites.settings.texture.value) attributes['selected'] = 'selected';
			Teal.element('option', attributes, Teal.id('texture'), value.name);
		}

		
		this.params = Teal.get_url_params();
		this.params.colorset = this.DiceFavorites.settings.colorset.value || this.params.colorset;
		this.params.texture = this.DiceFavorites.settings.texture.value || this.params.texture;

		if (this.params.colorset || this.params.texture) {
			this.DiceColors.applyColorSet((this.params.colorset || 'random'), (this.params.texture || null));
		} else {
			this.DiceColors.applyColorSet('random');
		}

		if (this.params.server) {
			this.Teal.socketAddress = this.params.server;
			this.Teal.socketSecure = this.params.secure;
		} else {
			this.Teal.socketAddress = 'dnd.majorsplace.com:32400';
			this.Teal.socketSecure = false;
		}

		this.set_connection_message("Ready", 'green');

		Teal.hidden(this.desk, true);
		this.show_waitform(false);

		this.params = Teal.get_url_params();

		if (this.params.name) {
			Teal.id('input_user').value = this.params.name;
		}
		if (this.params.room) {
			Teal.id('input_room').value = this.params.room;
		}
		
		Teal.bind(this.socket_button, 'click', this.socket_button_press);
		Teal.bind(this.socket_button, ['mousedown', 'mouseup'], function(ev) { ev.stopPropagation(); });
		Teal.bind(this.socket_button, 'focus', function(ev) { Teal.set(this.desk, { class: '' }); });
		Teal.bind(this.socket_button, 'blur', function(ev) { Teal.set(this.desk, { class: 'noselect' }); });

		Teal.bind(this.theme_select, 'change', this.on_theme_select_change);
		Teal.bind(this.theme_select, 'focus', function(ev) { Teal.set(this.desk, { class: '' }); });
		Teal.bind(this.theme_select, 'blur', function(ev) { Teal.set(this.desk, { class: 'noselect' }); });

		Teal.bind(this.surface_select, 'change', this.on_surface_select_change);
		Teal.bind(this.surface_select, 'focus', function(ev) { Teal.set(this.desk, { class: '' }); });
		Teal.bind(this.surface_select, 'blur', function(ev) { Teal.set(this.desk, { class: 'noselect' }); });

		Teal.bind(this.system_select, 'change', this.on_system_select_change);
		Teal.bind(this.system_select, 'focus', function(ev) { Teal.set(this.desk, { class: '' }); });
		Teal.bind(this.system_select, 'blur', function(ev) { Teal.set(this.desk, { class: 'noselect' }); });

		Teal.bind(this.color_select, 'change', this.on_color_select_change);
		Teal.bind(this.color_select, 'focus', function(ev) { Teal.set(this.desk, { class: '' }); });
		Teal.bind(this.color_select, 'blur', function(ev) { Teal.set(this.desk, { class: 'noselect' }); });

		Teal.bind(this.texture_select, 'change', this.on_texture_select_change);
		Teal.bind(this.texture_select, 'focus', function(ev) { Teal.set(this.desk, { class: '' }); });
		Teal.bind(this.texture_select, 'blur', function(ev) { Teal.set(this.desk, { class: 'noselect' }); });

		Teal.bind(this.control_panel_show, 'click', this.on_control_panel_show);
		Teal.bind(this.control_panel_hide, 'click', this.on_control_panel_show);
		Teal.bind(this.control_panel_show, 'focus', function(ev) { Teal.set(this.desk, { class: '' }); });
		Teal.bind(this.control_panel_hide, 'focus', function(ev) { Teal.set(this.desk, { class: '' }); });
		Teal.bind(this.control_panel_show, 'blur', function(ev) { Teal.set(this.desk, { class: 'noselect' }); });
		Teal.bind(this.control_panel_hide, 'blur', function(ev) { Teal.set(this.desk, { class: 'noselect' }); });

		Teal.bind(this.toggle_selector, 'click', this.on_toggle_selector);
		Teal.bind(this.toggle_selector, 'focus', function(ev) { Teal.set(this.desk, { class: '' }); });
		Teal.bind(this.toggle_selector, 'blur', function(ev) { Teal.set(this.desk, { class: 'noselect' }); });

		Teal.bind(this.parent_roll, 'change', this.on_parent_roll_change);

		Teal.bind(Teal.id('input_user'), 'keyup', this.submit_login);
		Teal.bind(Teal.id('input_room'), 'keyup', this.submit_login);
		Teal.bind(Teal.id('input_pass'), 'keyup', this.submit_login);

		Teal.bind(Teal.id('button_join'), 'click', this.button_join_press);

		Teal.bind(Teal.id('button_single'), 'click', this.button_single_press);

		$('#checkbox_allowdiceoverride').prop('checked', this.DiceFavorites.settings.allowDiceOverride.value == '1');
		$('#checkbox_allowdiceoverride').change(function(event) {
			let DiceRoller = window.DiceRoller;
			DiceRoller.DiceFavorites.settings.allowDiceOverride.value = $('#checkbox_allowdiceoverride').prop('checked') ? '1' : '0';
			DiceRoller.DiceFavorites.storeSettings();
			if(DiceRoller.show_selector) DiceRoller.show_selector();
		});

		$('#checkbox_shadows').prop('checked', this.DiceFavorites.settings.shadows.value == '1');
		$('#checkbox_shadows').change(function(event) {
			let DiceRoller = window.DiceRoller;
			DiceRoller.DiceFavorites.settings.shadows.value = $('#checkbox_shadows').prop('checked') ? '1' : '0';
			DiceRoller.DiceFavorites.storeSettings();
			if(DiceRoller.show_selector && DiceRoller.DiceBox) {

				if (DiceRoller.DiceFavorites.settings.shadows.value == '1') {
					DiceRoller.DiceBox.enableShadows();
				} else {
					DiceRoller.DiceBox.disableShadows();
				}
				DiceRoller.show_selector();
			}
		});

		$('#checkbox_sounds').prop('checked', this.DiceFavorites.settings.sounds.value == '1');
		$('#checkbox_sounds').change(function(event) {
			let DiceRoller = window.DiceRoller;
			DiceRoller.DiceFavorites.settings.sounds.value = $('#checkbox_sounds').prop('checked') ? '1' : '0';
			DiceRoller.DiceFavorites.storeSettings();
			if(DiceRoller.DiceBox) DiceRoller.DiceBox.sounds = DiceRoller.DiceFavorites.settings.sounds.value == '1';
		});

		let volume_handle = $( "#volume_handle" );
		$('#volume_slider').slider({
			range: 'min',
			min: 0,
			max: 100,
			value: this.DiceFavorites.settings.volume.value,
			create: function() {
				let DiceRoller = window.DiceRoller;
				volume_handle.text($(this).slider("value"));
				if(DiceRoller.DiceBox) DiceRoller.DiceBox.volume = parseInt(ui.value);
			},
			slide: function(event, ui) {
				let DiceRoller = window.DiceRoller;
				volume_handle.text(ui.value);
				DiceRoller.DiceFavorites.settings.volume.value = ui.value;
				if(DiceRoller.DiceBox) DiceRoller.DiceBox.volume = parseInt(ui.value);
			},
			stop: function(event, ui) {
				let DiceRoller = window.DiceRoller;
				DiceRoller.DiceFavorites.storeSettings();
				if(DiceRoller.DiceBox) DiceRoller.DiceBox.volume = parseInt(ui.value);
			}
		});

		$('.control_bgcolor').spectrum({
			showPalette: true,
			palette: [['#ff0000','#00ff00','#0000ff'],['#000000','#ffffff'],['#0b1a3e']],
	        color: this.DiceFavorites.settings.bgcolor.value,
	        showInput: "true",
	        showAlpha: "false",
	        replacerClassName: 'control_bgcolor',
	        change: function(color) {
				let DiceRoller = window.DiceRoller;
				$(document.body).css('background-color', color.toHexString());
				DiceRoller.DiceFavorites.settings.bgcolor.value = color.toHexString();
				DiceRoller.DiceFavorites.storeSettings();
			}
	    });

		let pageThemeInfo = THEMES[this.DiceFavorites.settings.theme.value];
		if (pageThemeInfo) {
			if (pageThemeInfo.showColorPicker) {
				$('.sp-replacer').show();
				$(document.body).css('background-color', this.DiceFavorites.settings.bgcolor.value);
			} else {
				$('.sp-replacer').hide();
			}
		}

		$('#control_panel').draggable({
			scroll: false,
			snap: '.fav_draggable, #selector_div, #log, #control_panel',
			stack: '.fav_draggable, #control_panel',
			containment: 'window',
			snapTolerance: 10,
			stop: function() {
				let pos = $(this).offset();
				if (!pos) return;

				if (pos.left + $(this).width() > window.innerWidth) {
					pos.left = window.innerWidth - $(this).width();
				}

				if (pos.top + $(this).height() > window.innerHeight) {
					pos.top = window.innerHeight - $(this).height();
				}

				$(this).offset(pos);
			}
		});
	}

	on_window_resize() {
		let DiceRoller = window.DiceRoller;
		let w = window.innerWidth + 'px';
		let hh = Math.floor(window.innerHeight * 0.24);
		let h = window.innerHeight - hh + 'px';

		DiceRoller.desk.style.width = DiceRoller.canvas.style.width = w;
		DiceRoller.desk.style.height = DiceRoller.canvas.style.height = h;

		if (DiceRoller.DiceRoom) {
			DiceRoller.DiceRoom.setDimensions({ w: 500, h: 300 });
			DiceRoller.DiceRoom.TealChat.resize(window.innerWidth - 30, hh - 10);
		}

		DiceRoller.DiceFavorites.ensureOnScreen();
	}

	socket_button_press(ev) {
		let DiceRoller = window.DiceRoller;
		DiceRoller.connect_socket(true);
	}

	on_theme_select_change(ev) {
		let DiceRoller = window.DiceRoller;
		let themeinfo = THEMES[DiceRoller.theme_select.value];
		if (!themeinfo) Teal.selectByValue(DiceRoller.theme_select, 'default');
		Teal.selectByValue(DiceRoller.surface_select, themeinfo.surface);
		DiceRoller.DiceFavorites.settings.theme.value = DiceRoller.theme_select.value;
		DiceRoller.DiceFavorites.settings.surface.value = DiceRoller.surface_select.value;
		DiceRoller.DiceFavorites.storeSettings();
		location.reload();
	}

	on_surface_select_change(ev) {
		let DiceRoller = window.DiceRoller;
		DiceRoller.DiceFavorites.settings.surface.value = DiceRoller.surface_select.value;
		DiceRoller.DiceFavorites.storeSettings();
	}

	on_system_select_change(ev) {
		let DiceRoller = window.DiceRoller;

		let systemid = DiceRoller.system_select.value;
		let alldice = (systemid == 'all');

		if (!alldice) {
			DiceRoller.diceset = DiceRoller.DiceFactory.systems[systemid].dice;
		} else {
			DiceRoller.diceset = Object.keys(DiceRoller.DiceFactory.dice);
		}

		DiceRoller.DiceFavorites.settings.system.value = systemid;
		DiceRoller.DiceFavorites.storeSettings();

		if(DiceRoller.show_selector) DiceRoller.show_selector(alldice);
	}

	on_color_select_change(ev) {
		let DiceRoller = window.DiceRoller;
		Teal.selectByValue(DiceRoller.texture_select, '');
		DiceRoller.DiceFactory.applyColorSet(DiceRoller.color_select.value, null);
		DiceRoller.Teal.rpc( { method: 'colorset', colorset: DiceRoller.color_select.value });
		DiceRoller.Teal.rpc( { method: 'texture', texture: DiceRoller.texture_select.value });

		DiceRoller.DiceFavorites.settings.colorset.value = DiceRoller.color_select.value;
		DiceRoller.DiceFavorites.settings.texture.value = DiceRoller.texture_select.value;
		DiceRoller.DiceFavorites.storeSettings();

		if(DiceRoller.show_selector) DiceRoller.show_selector();
	}

	on_texture_select_change(ev) {
		let DiceRoller = window.DiceRoller;
		DiceRoller.DiceFactory.applyColorSet(DiceRoller.color_select.value, (DiceRoller.texture_select.value || null));
		DiceRoller.Teal.rpc( { method: 'texture', texture: DiceRoller.texture_select.value });

		DiceRoller.DiceFavorites.settings.texture.value = DiceRoller.texture_select.value;
		DiceRoller.DiceFavorites.storeSettings();

		if(DiceRoller.show_selector) DiceRoller.show_selector();
	}

	on_control_panel_show(ev) {
		if (ev) ev.stopPropagation();

		if ($('#control_panel').css('display') == 'none') {
			$('#control_panel').show();
		} else {
			$('#control_panel').hide();
		}
		if (ev) ev.preventDefault();
	}

	on_toggle_selector(ev) {
		let DiceRoller = window.DiceRoller;
		if (ev) ev.stopPropagation();
		if (DiceRoller.selector_div) Teal.hidden(DiceRoller.selector_div, DiceRoller.selector_div.style.display != 'none');
		if (ev) ev.preventDefault();
	}
	
	submit_login(ev) {
		if(ev && ev.keyCode && ev.keyCode == 13) {
			Teal.raise_event(Teal.id('button_join'), 'click');
		}
	}

	on_parent_roll_change() { 
		let DiceRoller = window.DiceRoller;
		if (DiceRoller.parent_roll.value == "1") {
			DiceRoller.set.value = DiceRoller.parent_notation.value;
			Teal.raise_event(Teal.id('throw'), 'mouseup');
		}
	}

	button_join_press(ev) {
		let DiceRoller = window.DiceRoller;
		DiceRoller.show_waitform(true);
		DiceRoller.Teal.connect_socket(false, DiceRoller.on_socket_connect);
	}

	on_socket_connect(socketevent) {
		let user = Teal.id('input_user').value;
		let room = Teal.id('input_room').value;
		let pass = Teal.id('input_pass').value;

		window.DiceRoller.Teal.rpc( { method: 'join', user: user, room: room, pass: pass } );
	}

	button_single_press(ev) {
		let DiceRoller = window.DiceRoller;
		if (DiceRoller.Teal.socket && DiceRoller.Teal.socket.readyState <= WebSocket.OPEN) {
			DiceRoller.Teal.socket.close();
		}
		DiceRoller.Teal.offline = true;

		DiceRoller.DiceRoom = new DiceRoom('Yourself', -1);

		DiceRoller.show_waitform(false);
		requestAnimationFrame(function() {});

		DiceRoller.DiceRoom.actions['login']({user: 'Yourself'});
	}

	show_waitform(show) {
		let waitform = Teal.id('waitform');
		waitform.style.display = show ? 'block' : 'none';
		waitform.style.cursor = show ? 'default' : 'wait';
		waitform.style.visibility = show ? 'visible' : 'hidden';
	}

	set_connection_message(text, color = 'orange') {
		$('.connection_message').each(function() {
			$(this).text(text).css({color: color});
		});
	}

	connect_socket(reopen, callback) {
		if (reopen && this.Teal.socket && this.Teal.socket.readyState <= WebSocket.OPEN) {
			this.Teal.socket.close();
			this.set_connection_message("Reconnecting...");
		} else {
			this.set_connection_message("Connecting...");
		}
		this.Teal.openSocket();

		this.Teal.socket.onerror = function(event) {
			let DiceRoller = window.DiceRoller;
			DiceRoller.set_connection_message("Connection Error", 'red', true);
			DiceRoller.show_waitform(false);
			console.log(event);
			DiceRoller.Teal.offline = true;
		}

		this.Teal.socket.onopen = function(event) {
			let DiceRoller = window.DiceRoller;
			DiceRoller.set_connection_message("Connected", 'green');
			DiceRoller.show_waitform(false);
			console.log(event);
			DiceRoller.Teal.offline = false;
			callback.call(DiceRoller, event);
		}

		this.Teal.socket.onclose = function(event) {
			let DiceRoller = window.DiceRoller;
			if (event.wasClean) {
				DiceRoller.set_connection_message("Connection Ended");
			} else {
				DiceRoller.set_connection_message("Connection Failed", 'red', true);    
			}
			console.log(event);
			DiceRoller.show_waitform(false);
			DiceRoller.Teal.offline = true;
		}

		this.Teal.socket.onmessage = function(message) {
			if (message && message.data) {
				var data = JSON.parse(message.data);
				let DiceRoller = window.DiceRoller;
				if(data && data.cid) {
					DiceRoller.cid = data.cid;
					console.log("Client id: "+DiceRoller.cid);
				}

				if (data.error) {
					DiceRoller.set_connection_message(data.error, 'red');
					DiceRoller.show_waitform(false);
					DiceRoller.set_login_message(data.error, 'red');
				}

				if (data.warning) {
					DiceRoller.set_connection_message(data.warning, 'orange');
					DiceRoller.show_waitform(false);
					DiceRoller.set_login_message(data.warning, 'orange');
				}

				if (data.message) {
					DiceRoller.set_connection_message(data.message, 'green');
					DiceRoller.show_waitform(false);
					DiceRoller.set_login_message(data.message, 'green');
				}

				if (data.method == 'join' && data.action == 'login') {

					DiceRoller.DiceRoom = new DiceRoom(data.user, cid);

					DiceRoller.show_waitform(false);
					requestAnimationFrame(function() {});
				}

				if(!data.action || data.action.length < 1) return;

				if (DiceRoller.DiceRoom && DiceRoller.DiceRoom.actions.hasOwnProperty(data.action)) {
					DiceRoller.DiceRoom.actions[data.action](data);
				}
				DiceRoller.show_waitform(false);
			}
		}
	}

	close_socket() {
		if (this.DiceRoom) {
			this.Teal.rpc({ method: 'logout', cid: this.DiceRoom.cid });
		}
		if (this.Teal.socket) {
			this.Teal.socket.close();
		}
	}
}

DiceColors.ImageLoader(TEXTURELIST, function(images) {
	window.DiceRoller = new DiceRoller(images);
});