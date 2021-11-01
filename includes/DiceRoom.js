"use strict"
import {Teal} from './Teal.js';
import {DiceBox} from './DiceBox.js';
import {TealChat} from './TealChat.js';
import {DiceNotation} from './DiceNotation.js';
import {DiceFunctions} from './DiceFunctions.js';

export class DiceRoom {

	button_increment_rage(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		let rage = 0;
		// count '!'
		for(let i = 0, l = $('#set').val().length; i < l; i++){
			rage += ($('#set').val().charAt(i) == '!') ? 1 : 0;
		}

		rage += 1;
		if (rage > 3) rage = 0;

		let newval = $('#set').val().replace(/!/g, '');
		$('#set').val(newval+('!'.repeat(rage)));
		Teal.raise_event(Teal.id('set'), 'change');
	}

	make_notation_for_log(notation, result) {
		notation = new DiceNotation(notation); //reinit notation class, if sent from server it will have no methods attached.
		var res = Teal.element('span');
		res.innerHTML += '<span class="chat-notation">'+notation.stringify(false) + (notation.result.length ? ' (preset result)' : '')+'</span>';
		res.innerHTML += '<span class="chat-notation-result">'+(result ? ' → ' + result : ' ...')+'</span>';
		return res;
	}

	close_socket() {
		if (cid && window.DiceRoller.Teal.socket) {
			window.DiceRoller.Teal.rpc({ method: 'logout', cid: cid });
			window.DiceRoller.Teal.socket.close();
		}
	}

	on_receivePostMessage(ev) {
		console.log(ev);
		//if (ev.origin !== "https://www.improved-initiative.com" &&
		//	ev.origin !== "https://files.majorsplace.com" &&
		//	ev.origin !== "https://rand.majorsplace.com" &&
		//	ev.origin !== "https://dnd.majorsplace.com") return;

		$('#set').val(ev.data);
		Teal.raise_event(Teal.id('throw'), 'mouseup');
	}

	on_set_change(ev) { 
		if (ev) ev.stopPropagation();
		$('#set').css('width', $('#set').val().length + 3 + 'ex')

		if(ev && ev.keyCode && ev.keyCode == 13) {
			Teal.raise_event(Teal.id('throw'), 'mouseup');
		}
	}

	on_button_clear_notation(ev) {
		let DiceRoller = window.DiceRoller;
		ev.stopPropagation();
		DiceRoller.DiceRoom.set.value = '0';
		DiceRoller.DiceRoom.show_selector();
	}

	on_button_create_favorite(ev) {
		ev.stopPropagation();

		let names = [
			'👊 Melee',
			'🏹 Piercing',
			'🧱 Bludgeoning',
			'🗡️ Slash',
			'🚶 Walk',
			'🧡 Fire',
			'💙 Cold',
			'💛 Lightning',
			'🤎 Thunder',
			'💚 Acid',
			'🤍 Radiant',
			'🖤 Necrotic',
			'💜 Force',
			'🤏 Grapple',
			'🤺 Dodge',
			'🛡️ Parry',
			'🦶 Jump',
			'💥 Explode',
			'💦 Splash',
			'🍂 Fall',
		];

		let name = prompt('Set Name for Favorite', names[Math.floor(Math.random() * names.length)]);
		let icons = [ '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💗', '🤎' ];
		Teal.id('save').innerHTML = icons[Math.floor(Math.random() * icons.length)];

		let DiceRoller = window.DiceRoller;
		DiceRoller.DiceFavorites.create(name, DiceRoller.DiceRoom.set.value, DiceRoller.color_select.value, DiceRoller.texture_select.value, ev.pageX, ev.pageY);
		DiceRoller.DiceFavorites.store();
	}

	show_selector() {

		let systemid = window.DiceFavorites.settings.system.value;
		let alldice = (systemid == 'all');

		if (!alldice) {
			this.DiceBox.selector.dice = window.DiceFactory.systems[systemid].dice;
		} else {
			this.DiceBox.selector.dice = Object.keys(window.DiceFactory.dice);
		}

		this.info_div.style.display = 'none';
		Teal.id('labelhelp').style.display = 'none';

		this.selector_div.style.display = 'block';
		Teal.id('sethelp').style.display = 'block';
		this.deskrolling = false;

		window.DiceColors.applyColorSet(
			window.DiceRoller.color_select.value,
			window.DiceRoller.texture_select.value,
			window.DiceRoller.material_select.value
		);


		window.setTimeout(() => {
			window.DiceRoller.on_window_resize();
			this.DiceBox.showSelector((this.params.alldice && this.params.alldice == '1'));
		}, 100);

		
	}

	sendNetworkedRoll(notationVectors) {

		this.label.innerHTML = this.TealChat.own_user+' is Rolling...';
		info_div.style.display = this.DiceBox.tally ? 'block' : 'none';
		Teal.id('sethelp').style.display = 'none';
		this.deskrolling = true;
		window.DiceRoller.show_waitform(true);

		let time = new Date().getTime();
		this.TealChat.add_unconfirmed_message(this.TealChat.own_user, this.make_notation_for_log(notationVectors.notation), time, this.TealChat.roll_uuid = Teal.uuid());

		if (window.DiceRoller.Teal.offline) {
			this.actions['roll'].call(window.DiceRoller.DiceRoom, { 
				method: 'roll',
				user: this.TealChat.own_user,
				cid: this.cid,
				time: time,
				notation: notationVectors.notation,
				vectors: notationVectors.vectors,
				colorset: window.DiceRoller.color_select.value,
				texture: window.DiceRoller.texture_select.value,
				material: window.DiceRoller.material_select.value
			});

		} else {
			try {
				Teal.pack_vectors(notationVectors.vectors);

				window.DiceRoller.Teal.rpc({ 
					method: 'roll',
					user: this.TealChat.own_user,
					cid: this.cid,
					time: time,
					notation: notationVectors.notation,
					vectors: notationVectors.vectors
				});
			}
			catch (e) {
				window.DiceRoller.set_connection_message('Failed to send roll!', 'red', true);
				console.log(e);
				callback.call(this);
			}
		}
	}

	constructor(username, userid) {

		this.TealChat = new TealChat(Teal.id('log'));
		this.TealChat.own_user = username;
		this.TealChat.clientid = userid;

		this.DiceBox = null;

		this.canvas = Teal.id('canvas');
		this.label = Teal.id('label');
		this.set = Teal.id('set');
		this.desk = Teal.id('desk');
		this.info_div = Teal.id('info_div');
		this.selector_div = Teal.id('selector_div');
		this.params = Teal.get_url_params();
		this.users = true;

		// actions performed when the server sends a command
		this.actions = {
			login: this.action_login,
			userlist: this.action_userlist,
			roll: this.action_roll,
			chat: this.action_chat,
			colorset: this.action_colorset,
			texture: this.action_texture,
			material: this.action_material,
			roomlist: this.action_roomlist,
		};

		Teal.hidden(this.desk, false);
		window.DiceRoller.DiceFavorites.retrieve();
		window.DiceRoller.DiceFavorites.ensureOnScreen();

		window.addEventListener('message', this.on_receivePostMessage);

		Teal.bind(Teal.id('clear'), ['mouseup', 'touchend'], this.on_button_clear_notation);
		Teal.bind(Teal.id('save'), ['mouseup', 'touchend'], this.on_button_create_favorite);
		
		Teal.bind(this.set, ['mouseup', 'keyup', 'touchend'], this.on_set_change);
		Teal.bind(this.set, ['mousedown', 'touchstart'], function(ev) { ev.stopPropagation(); });
		Teal.bind(this.set, 'focus', function(ev) { Teal.set(this.desk, { class: '' }); });
		Teal.bind(this.set, 'blur', function(ev) { Teal.set(this.desk, { class: 'noselect' }); });

		Teal.bind(Teal.id('rage'), ['mouseup', 'touchend'], this.button_increment_rage);

		this.DiceBox = new DiceBox(this.canvas, { w: 500, h: 300 });
		this.DiceBox.selector.dice = ['df', 'd4', 'd6', 'd8', 'd10', 'd100', 'd12', 'd20'];
		this.DiceBox.initialize();

		this.DiceBox.volume = parseInt(window.DiceRoller.DiceFavorites.settings.volume.value);
		this.DiceBox.sounds = window.DiceRoller.DiceFavorites.settings.sounds.value == '1';

		this.DiceFunctions = new DiceFunctions(this.DiceBox);

		Teal.bind(this.desk, ['mousedown', 'touchstart'], this.DiceBox.startDragThrow.bind(this.DiceBox));

		if (this.params.notation) {
			this.set.value = this.params.notation;
		}
		if (this.params.roll) {
			Teal.raise_event(Teal.id('throw'), 'mouseup');
		}


		Teal.bind(this.desk, ['mouseup', 'touchend'], function(ev) {
			let notationVectors = this.DiceBox.endDragThrow(ev, Teal.id('set').value);

			if (!notationVectors || notationVectors.error) {

				// if total display is up and dice aren't rolling, reset the selector
				if (this.DiceBox.animstate == 'afterthrow') {
					if (!this.DiceBox.rolling) this.show_selector();
					return;
				}

				// otherwise, select dice
				let name = this.DiceBox.getDiceAtMouse(ev);
				if (name) {
					let notation = new DiceNotation(this.set.value);

					let shift = (ev && ev.shiftKey);
					let ctrl = (ev && ev.ctrlKey);
					let leftclick = (ev && ev.button == 0);

					let op = '+';
					if (ctrl && leftclick) op = '*';
					if (shift && leftclick) op = '/';
					if (ctrl && shift && leftclick) op = '-';

					notation.addSet(1, name, 0, 0, '', '', op);

					this.set.value = notation.stringify();
					this.on_set_change();
				}

			} else {
				this.sendNetworkedRoll(notationVectors);
			}
		}.bind(this));

		Teal.bind(Teal.id('throw'), ['mouseup', 'touchend'], function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			let notationVectors = this.DiceBox.startClickThrow(Teal.id('set').value);
			if (!notationVectors || notationVectors.error) return;

			this.sendNetworkedRoll(notationVectors);
		}.bind(this));

		this.TealChat.bind_send(function(text) {
			var notation = new DiceNotation(text);
			var uuid = Teal.uuid();
			if (notation.set.length && !notation.error) {
				this.set.value = text;
				let notationVectors = this.DiceBox.startClickThrow(notation);

				if (!notationVectors || notationVectors.error) return;

				this.sendNetworkedRoll(notationVectors);
			}
			else {
				if (text.length > 1) {
					for (var i = 0, l = text.length; i < l; ++i) if (text[i] != '-') break;
					if (i == l) text = Teal.element('hr');
				}
				var time = new Date().getTime();
				this.TealChat.add_unconfirmed_message(this.TealChat.own_user, text, time, uuid);
				window.DiceRoller.Teal.rpc({ method: 'chat', cid: cid, text: text, time: time, uuid: uuid });
			}
		}.bind(this));

		this.show_selector();
	}

	set_login_message(text, color = 'red') {
		let mbox = Teal.id('login_message');
		if(!mbox) return;
		Teal.empty(mbox)
		Teal.inner(text, mbox);
		mbox.style.color = color;
	}

	action_login(res) {
		var loginform = Teal.id('loginform');
		if (loginform) {
			Teal.remove(loginform);
			loginform.style.display = 'none';
			Teal.id('teal-userlist').style.display = window.DiceFavorites.settings.users.value == '1' ? 'block' : 'none';
			this.TealChat.place.style.display = "grid";
			this.TealChat.own_user = res.user;

			window.DiceRoller.Teal.rpc( { method: 'colorset', colorset: window.DiceRoller.color_select.value });
			window.DiceRoller.Teal.rpc( { method: 'texture', texture: window.DiceRoller.texture_select.value });
			window.DiceRoller.Teal.rpc( { method: 'material', texture: window.DiceRoller.material_select.value });
			window.DiceRoller.on_window_resize();
		}
	}
	action_userlist(res) {
		Teal.id('roomname').innerHTML = 'Room: ' + res.room;
		Teal.id('users').innerHTML = res.list.map(e => { return `<li>${e}</li>` }).join('');
		this.TealChat.add_info(res.user + ' has ' + { 'add': 'joined', 'del': 'left' }[res.act] + ' the room');
	}
	action_roll(res) {
		Teal.id('waitform').style.display = "none";
		if (this.TealChat.roll_uuid) this.TealChat.confirm_message(this.TealChat.roll_uuid, undefined, true);
		else this.TealChat.add_unconfirmed_message(res.user, this.make_notation_for_log(res.notation),
				res.time, this.TealChat.roll_uuid = Teal.uuid(), true);

		this.label.innerHTML = res.user+' is Rolling...';
		this.info_div.style.display = this.DiceBox.tally ? 'block' : 'none';
		this.deskrolling = true;

		if (res.colorset.length > 0 || res.texture.length > 0 || res.material.length > 0) {
			window.DiceColors.applyColorSet(res.colorset, res.texture, res.material, false);
		}

		if (!window.DiceRoller.Teal.offline) Teal.unpack_vectors(res.vectors);

		let notationVectors = new DiceNotation(res.notation);
		notationVectors.vectors = res.vectors;

		this.DiceBox.rollDice(notationVectors, (notationVectors) => {

			let resultDice = this.DiceBox.diceList;

			let results = this.DiceBox.getDiceTotals(notationVectors, resultDice);

			this.label.innerHTML = (results.rolls+'<h2>'+results.labels+' '+results.values+'</h2>');

			this.info_div.style.display = this.DiceBox.tally ? 'block' : 'none';
			Teal.id('labelhelp').style.display = 'block';
			this.deskrolling = false;
			this.DiceBox.rolling = false;
			if (this.TealChat.roll_uuid) {
				this.TealChat.confirm_message(this.TealChat.roll_uuid, this.make_notation_for_log(res.notation, (results.rolls+' = '+results.labels+' '+results.values)));
				delete this.TealChat.roll_uuid;
			}

			$('.ui-helper-hidden-accessible').remove();

			$('.diceresult').mouseenter(function(event) {
				let diceid = $(this).data('uuid');
				let selecteddice = null;
				for (let i=0, len=window.DiceRoller.DiceRoom.DiceBox.diceList.length; i < len; ++i) {
					let dicemesh = window.DiceRoller.DiceRoom.DiceBox.diceList[i];

					if (dicemesh.uuid == diceid) {
						window.DiceRoller.DiceRoom.DiceBox.setSelected(dicemesh);
						break;
					}
				}
			}).mouseleave(function(event) {
				window.DiceRoller.DiceRoom.DiceBox.setSelected();
			});

			$(document).tooltip({
				items: '.diceresult',
				track: true,
				content: function() {

					let diceid = $(this).data('uuid');

					if (!diceid) return '';

					let rollhistory = 'Roll History:<br>';

					for (let i=0, len=window.DiceRoller.DiceRoom.DiceBox.diceList.length; i < len; ++i) {
						let dicemesh = window.DiceRoller.DiceRoom.DiceBox.diceList[i];
						if (!dicemesh || !dicemesh.notation) continue;
						let diceobj = window.DiceRoller.DiceFactory.get(dicemesh.notation.type);

						if (dicemesh.uuid == diceid) {

							for (let j=0, len=dicemesh.result.length; j < len; ++j) {
								let historyresult = dicemesh.result[j];

								let showvalue = (diceobj.display == 'values') ? historyresult.value : historyresult.label;

								if (historyresult.ignore) showvalue = '<span class="ignored">'+showvalue+'</span>';

								rollhistory += 'Roll '+(j+1)+': '+showvalue+' ('+historyresult.reason+')<br>';
								
							}
						}
					}
					return rollhistory;
				}
			});
		});
	}
	action_chat(res) {
		if (res.uuid) this.TealChat.confirm_message(res.uuid);
		else this.TealChat.add_message(res.user, res.text, res.time);
	}
	action_colorset(res) {
		alert("colorset: "+res.colorset);
	}
	action_texture(res) {
		alert("texture: "+res.texture);
	}
	action_material(res) {
		alert("material: "+res.material);
	}
	action_roomlist(res) {
		console.log(res);
	}

}