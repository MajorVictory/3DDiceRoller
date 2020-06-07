"use strict"
import {Teal} from './Teal.js';
import {TealChat} from './TealChat.js';
import {DiceNotation} from './DiceNotation.js';

export class DiceRoom {

	on_set_change(ev) { 
		if (ev) ev.stopPropagation();
		this.set.style.width = this.set.value.length + 3 + 'ex';

		if(ev && ev.keyCode && ev.keyCode == 13) {
			this.Teal.raise_event(this.Teal.id('throw'), 'mouseup');
		}
	}

	button_increment_rage(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		let rage = 0;
		// count '!'
		for(let i = 0, l = this.set.value.length; i < l; i++){
			rage += (this.set.value.charAt(i) == '!') ? 1 : 0;
		}

		rage += 1;
		if (rage > 3) rage = 0;

		let newval = this.set.value.replace(/!/g, '');
		this.set.value = newval+('!'.repeat(rage));
		on_set_change();
	}

	on_receivePostMessage(event) {
		console.log(event);
		//if (event.origin !== "https://www.improved-initiative.com" &&
		//	event.origin !== "https://files.majorsplace.com" &&
		//	event.origin !== "https://rand.majorsplace.com" &&
		//	event.origin !== "https://dnd.majorsplace.com") return;

		$('#set').val(event.data);
		Teal.raise_event(Teal.id('throw'), 'mouseup');
	}

	make_notation_for_log(notation, result) {
		notation = new DiceNotation(notation); //reinit notation class, if sent from server it will have no methods attached.
		var res = Teal.element('span');
		res.innerHTML += '<span class="chat-notation">'+notation.stringify(false) + (notation.result.length ? ' (preset result)' : '')+'</span>';
		res.innerHTML += '<span class="chat-notation-result">'+(result ? ' → ' + result : ' ...')+'</span>';
		return res;
	}

	setSaveButtonText() {
		let icons = [ '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💗', '🤎' ];
		this.Teal.id('save').innerHTML = icons[Math.floor(Math.random() * icons.length)];
	}

	close_socket() {
		if (cid && DiceRoller.Teal.socket) {
			DiceRoller.Teal.rpc({ method: 'logout', cid: cid });
			DiceRoller.Teal.socket.close();
		}
	}

	constructor(username, userid) {

		this.TealChat = new TealChat(Teal.id('log'));
		this.TealChat.own_user = username;
		this.TealChat.clientid = userid;

		this.canvas = Teal.id('canvas');
		this.label = Teal.id('label');
		this.set = Teal.id('set');
		this.desk = Teal.id('desk');

		// actions performed when the server sends a command
		this.actions = {
			login: this.action_login,
			userlist: this.action_userlist,
			roll: this.action_roll,
			chat: this.action_chat,
			colorset: this.action_colorset,
			texture: this.action_texture,
			roomlist: this.action_roomlist,
		};

		Teal.hidden(this.desk, false);
		DiceRoom.resize();
		DiceRoom.on_set_change();

		DiceRoom.DiceFavorites.retrieve();
		DiceRoom.DiceFavorites.ensureOnScreen();

		Teal.bind(Teal.id('clear'), ['mouseup', 'touchend'], function(ev) {
			ev.stopPropagation();
			DiceRoom.set.value = '0';
			DiceRoom.on_set_change();
			DiceRoom.show_selector();
		});

		setSaveButtonText();

		this.Teal.bind(this.Teal.id('save'), ['mouseup', 'touchend'], function(ev) {

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
			this.Teal.DiceFavorites.create(name, this.set.value, color_select.value, this.texture_select.value, ev.pageX, ev.pageY);
			this.Teal.DiceFavorites.store();

			setSaveButtonText();
			ev.stopPropagation();
		});

		
		this.Teal.bind(this.set, ['mouseup', 'keyup', 'touchend'], this.on_set_change);
		this.Teal.bind(this.set, ['mousedown', 'touchstart'], function(ev) { ev.stopPropagation(); });
		this.Teal.bind(this.set, 'focus', function(ev) { this.Teal.set(container, { class: '' }); });
		this.Teal.bind(this.set, 'blur', function(ev) { this.Teal.set(container, { class: 'noselect' }); });

		this.Teal.bind(Teal.id('rage'), ['mouseup', 'touchend'], this.button_increment_rage);

		this.Teal.DiceBox = DiceBox(this.canvas, { w: 500, h: 300 }, this.Teal.DiceFactory);
		this.Teal.DiceBox.selector.dice = ['df', 'd4', 'd6', 'd8', 'd10', 'd100', 'd12', 'd20'];
		this.Teal.DiceBox.initialize();

		this.Teal.DiceBox.volume = parseInt(this.Teal.DiceFavorites.settings.volume.value);
		this.Teal.DiceBox.sounds = this.Teal.DiceFavorites.settings.sounds.value == '1';

		this.Teal.DiceFunctions = new DiceFunctions(this.Teal.DiceBox);

		this.Teal.bind(container, ['mousedown', 'touchstart'], function(ev) {

			this.Teal.DiceBox.startDragThrow(ev);
		});

		if (this.params.notation) {
			this.set.value = this.params.notation;
		}
		if (this.params.roll) {
			this.Teal.raise_event(this.Teal.id('throw'), 'mouseup');
		}

		this.Teal.bind(window, 'resize', function() {
			resize();
			this.Teal.DiceBox.setDimensions({ w: 500, h: 300 });
			teal.DiceFavorites.ensureOnScreen();
		});

		this.Teal.bind(Teal.id('logout'), 'click', DiceRoller.close_socket);

		window.onbeforeunload = close;
		window.onunload = close;

		function show_selector() {

			this.info_div.style.display = 'none';
			this.Teal.id('labelhelp').style.display = 'none';

			this.selector_div.style.display = 'block';
			this.Teal.id('sethelp').style.display = 'block';
			this.deskrolling = false;

			applyColorSet(this.color_select.value, (this.texture_select.value || null));

			this.Teal.DiceBox.selector.dice = this.diceset;
			this.Teal.DiceBox.showSelector((this.params.alldice && this.params.alldice == '1'));
		}

		this.Teal.show_selector = show_selector;


		function sendNetworkedRoll(notationVectors) {

			this.label.innerHTML = this.TealChat.own_user+' is Rolling...';
			info_div.style.display = 'block';
			this.Teal.id('sethelp').style.display = 'none';
			this.deskrolling = true;
			set_connection_message('');
			show_waitform(true);

			let time = new Date().getTime();
			this.TealChat.add_unconfirmed_message(this.TealChat.own_user, make_notation_for_log(notationVectors.notation), time, this.TealChat.roll_uuid = this.Teal.uuid());

			if (this.Teal.offline) {
				action_pool['roll']({ 
					method: 'roll',
					user: this.TealChat.own_user,
					cid: cid,
					time: time,
					notation: notationVectors.notation,
					vectors: notationVectors.vectors,
					colorset: this.color_select.value,
					texture: this.texture_select.value
				});

			} else {
				try {
					Teal.pack_vectors(notationVectors.vectors);

					this.Teal.rpc({ 
						method: 'roll',
						user: this.TealChat.own_user,
						cid: cid,
						time: time,
						notation: notationVectors.notation,
						vectors: notationVectors.vectors
					});
				}
				catch (e) {
					set_connection_message(connection_error_text, 'red', true);
					console.log(e);
					callback();
				}
			}
		}

		this.Teal.bind(container, ['mouseup', 'touchend'], function(ev) {
			let notationVectors = this.Teal.DiceBox.endDragThrow(ev, Teal.id('set').value);

			if (!notationVectors || notationVectors.error) {

				// if total display is up and dice aren't rolling, reset the selector
				if (this.info_div.style.display != 'none') {
					if (!this.Teal.DiceBox.rolling) show_selector();
					return;
				}

				// otherwise, select dice
				let name = this.Teal.DiceBox.getDiceAtMouse(ev);
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
					on_set_change();
				}

			} else {
				sendNetworkedRoll(notationVectors);
			}
		});

		this.Teal.bind(this.Teal.id('throw'), ['mouseup', 'touchend'], function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			let notationVectors = this.Teal.DiceBox.startClickThrow(Teal.id('set').value);
			if (!notationVectors || notationVectors.error) return;

			sendNetworkedRoll(notationVectors);
		});

		this.TealChat.bind_send(function(text) {
			var notation = new DiceNotation(text);
			var uuid = this.Teal.uuid();
			if (notation.set.length && !notation.error) {
				this.set.value = text;
				let notationVectors = this.Teal.DiceBox.startClickThrow(notation);

				if (!notationVectors || notationVectors.error) return;

				sendNetworkedRoll(notationVectors);
			}
			else {
				if (text.length > 1) {
					for (var i = 0, l = text.length; i < l; ++i) if (text[i] != '-') break;
					if (i == l) text = this.Teal.element('hr');
				}
				var time = new Date().getTime();
				this.TealChat.add_unconfirmed_message(this.TealChat.own_user, text, time, uuid);
				this.Teal.rpc({ method: 'chat', cid: cid, text: text, time: time, uuid: uuid });
			}
		});

		show_selector();
	}

	set_login_message(text, color = 'red') {
		let mbox = Teal.id('login_message');
		if(!mbox) return;
		Teal.empty(mbox)
		Teal.inner(text, mbox);
		mbox.style.color = color;
	}

	action_login(res) {
		var loginform = this.Teal.id('loginform');
		if (loginform) {
			this.Teal.remove(loginform);
			loginform.style.display = 'none';
			mdice_initialize(container);
			this.Teal.id('label_players').style.display = "inline-block";
			this.TealChat.place.style.display = "inline-block";
			this.TealChat.own_user = res.user;

			this.Teal.rpc( { method: 'colorset', colorset: this.color_select.value });
			this.Teal.rpc( { method: 'texture', texture: this.texture_select.value });
		}
		set_connection_message(' ');
	}
	action_userlist(res) {
		this.Teal.id('label_players').innerHTML = res.room + ': ' + res.list.join(', ');
		this.TealChat.add_info(res.user + ' has ' + { 'add': 'joined', 'del': 'left' }[res.act] + ' the room');
	}
	action_roll(res) {
		teal.id('waitform').style.display = "none";
		if (this.TealChat.roll_uuid) this.TealChat.confirm_message(this.TealChat.roll_uuid, undefined, true);
		else this.TealChat.add_unconfirmed_message(res.user, make_notation_for_log(res.notation),
				res.time, this.TealChat.roll_uuid = this.Teal.uuid(), true);

		this.label.innerHTML = res.user+' is Rolling...';
		this.info_div.style.display = 'block';
		this.deskrolling = true;

		if (res.colorset.length > 0 || res.texture.length > 0) applyColorSet(res.colorset, res.texture, false);

		if (!this.Teal.offline) Teal.unpack_vectors(res.vectors);

		let notationVectors = new DiceNotation(res.notation);
		notationVectors.vectors = res.vectors;

		this.Teal.DiceBox.rollDice(notationVectors, function(notationVectors) {

			console.log('after roll - notationVectors', notationVectors);

			let resultDice = this.Teal.DiceBox.diceList;

			console.log('Roll Finished', resultDice);

			let results = this.Teal.DiceBox.getDiceTotals(notationVectors, resultDice);

			this.label.innerHTML = (results.rolls+'<h2>'+results.labels+' '+results.values+'</h2>');

			this.info_div.style.display = 'block';
			this.Teal.id('labelhelp').style.display = 'block';
			this.deskrolling = false;
			this.Teal.DiceBox.rolling = false;
			if (this.TealChat.roll_uuid) {
				this.TealChat.confirm_message(this.TealChat.roll_uuid, make_notation_for_log(res.notation, (results.rolls+' = '+results.labels+' '+results.values)));
				delete this.TealChat.roll_uuid;
			}

			$('.ui-helper-hidden-accessible').remove();

			$('.diceresult').mouseenter(function(event) {
				let diceid = $(this).data('uuid');
				let selecteddice = null;
				for (let i=0, len=this.Teal.DiceBox.diceList.length; i < len; ++i) {
					let dicemesh = this.Teal.DiceBox.diceList[i];

					if (dicemesh.uuid == diceid) {
						this.Teal.DiceBox.setSelected(dicemesh);
						break;
					}
				}
			}).mouseleave(function(event) {
				this.Teal.DiceBox.setSelected();
			});

			$(document).tooltip({
				items: '.diceresult',
				track: true,
				content: function() {

					let diceid = $(this).data('uuid');

					if (!diceid) return '';

					let rollhistory = 'Roll History:<br>';

					for (let i=0, len=this.Teal.DiceBox.diceList.length; i < len; ++i) {
						let dicemesh = this.Teal.DiceBox.diceList[i];
						if (!dicemesh || !dicemesh.notation) continue;
						let diceobj = this.Teal.DiceFactory.get(dicemesh.notation.type);

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
	action_roomlist(res) {
		console.log(res);
	}

}