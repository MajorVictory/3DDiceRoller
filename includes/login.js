"use strict";

function pack_vectors(vectors) {
    function pack(vv) {
        vv.x = Math.floor(vv.x * 1000);
        vv.y = Math.floor(vv.y * 1000);
        vv.z = Math.floor(vv.z * 1000);
        if (vv.a) {
            vv.a = Math.floor(vv.a * 1000);
            return [vv.x, vv.y, vv.z, vv.a];
        }
        else return [vv.x, vv.y, vv.z];
    }
    for (var i in vectors) {
        var v = vectors[i];
        vectors[i] = [v.set, pack(v.pos), pack(v.velocity), pack(v.angle), pack(v.axis)];
    }
}

function unpack_vectors(vectors) {
    function unpack(vv) {
        var r = {};
        r.x = vv[0] / 1000.0;
        r.y = vv[1] / 1000.0;
        r.z = vv[2] / 1000.0;
        if (vv[3]) r.a = vv[3] / 1000.0;
        return r;
    }
    for (var i in vectors) {
        var v = vectors[i];
        vectors[i] = { set: v[0], pos: unpack(v[1]), velocity: unpack(v[2]), angle: unpack(v[3]), axis: unpack(v[4]) };
    }
}

function set_connection_message(text, color = 'orange') {
    $('.connection_message').each(function() {
        $(this).text(text).css({color: color});
    });
}

function preload_and_init() {
    ImageLoader(TEXTURELIST, function(images) {
        diceTextures = images;

        // init colorset textures
        initColorSets();

        var systemselect = $t.id('system');
        var colorselect = $t.id('color');
        var textureselect = $t.id('texture');

        const systemprops = Object.entries($t.DiceFactory.systems);
        for (const [key, value] of systemprops) {

            let attributes = {value: key};
            if(key == $t.DiceFavorites.settings['system']) attributes['selected'] = 'selected';
            $t.element('option', attributes, systemselect, value.name);
        }

        for(let i = 0, l = COLORCATEGORIES.length; i < l; i++){

            var category = $t.element('optgroup', {label: COLORCATEGORIES[i]}, colorselect, undefined);

            const itemprops = Object.entries(COLORSETS);
            for (const [key, value] of itemprops) {

                if (value.category == COLORCATEGORIES[i]) {
                    let attributes = {value: key};
                    if(key == $t.DiceFavorites.settings['colorset']) attributes['selected'] = 'selected';
                    $t.element('option', attributes, category, value.name);
                }
            }
        }

        const itemprops = Object.entries(TEXTURELIST);
        for (const [key, value] of itemprops) {

            let attributes = {value: key};
            if(key == $t.DiceFavorites.settings['texture']) attributes['selected'] = 'selected';
            $t.element('option', attributes, textureselect, value.name);
        }

        var params = $t.get_url_params();
        params.colorset = $t.DiceFavorites.settings['colorset'] || params.colorset;
        params.texture = $t.DiceFavorites.settings['texture'] || params.texture;

        if (params.colorset || params.texture) {
            applyColorSet((params.colorset || 'random'), (params.texture || null));
        } else {
            applyColorSet('random');
        }

        if (params.server) {
            $t.socketAddress = params.server;
            $t.socketSecure = params.secure;
        } else {
            $t.socketAddress = 'dnd.majorsplace.com:32400';
            $t.socketSecure = false;
        }

        set_connection_message("Ready", 'green');
        login_initialize($t.id('desk'));
    });
}

function login_initialize(container) {
    var cid, user, room;
    var connection_error_text = "connection error, please reload the page";
    var box;
    var canvas = $t.id('canvas');
    var label = $t.id('label');
    var set = $t.id('set');
    var selector_div = $t.id('selector_div');
    var system_select = $t.id('system');
    var color_select = $t.id('color');
    var texture_select = $t.id('texture');
    var socket_button = $t.id('reconnect');
    var info_div = $t.id('info_div');
    var desk = $t.id('desk');
    var log = new $t.chat.chat_box($t.id('log'));
    var deskrolling = false;

    $t.hidden(desk, true);
    show_waitform(false);

    var params = $t.get_url_params();

    if (params.name) {
        $t.id('input_user').value = params.name;
    }
    if (params.room) {
        $t.id('input_room').value = params.room;
    }

    function socket_button_press(ev) {
        connect_socket(true);
    }
    $t.bind(socket_button, ['keyup','click'], socket_button_press);
    $t.bind(socket_button, ['mousedown', 'mouseup'], function(ev) { ev.stopPropagation(); });
    $t.bind(socket_button, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(socket_button, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

    function on_system_select_change(ev) {

        let systemid = system_select.value;
        let alldice = (systemid == 'all');

        if (!alldice) {
            $t.dice.selector_dice = $t.DiceFactory.systems[systemid].dice;
        } else {
            $t.dice.selector_dice = Object.keys($t.DiceFactory.dice);
        }

        $t.DiceFavorites.settings['system'] = systemid;
        $t.DiceFavorites.storeSettings();

        if($t.show_selector) $t.show_selector(alldice);
    }
    $t.bind(system_select, ['keyup','change','touchend'], on_system_select_change);
    $t.bind(system_select, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(system_select, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });
    on_system_select_change();

    function on_color_select_change(ev) {
        $t.selectByValue(texture_select, '');
        applyColorSet(color_select.value, null);
        $t.rpc( { method: 'colorset', colorset: color_select.value });
        $t.rpc( { method: 'texture', texture: texture_select.value });
        if($t.show_selector) $t.show_selector();
    }
    $t.bind(color_select, ['keyup','change','touchend'], on_color_select_change);
    $t.bind(color_select, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(color_select, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

    
    function on_texture_select_change(ev) {
        applyColorSet(color_select.value, (texture_select.value || null));
        $t.rpc( { method: 'texture', texture: texture_select.value });
        if($t.show_selector) $t.show_selector();
    }
    $t.bind(texture_select, ['keyup','change','touchend'], on_texture_select_change);
    $t.bind(texture_select, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(texture_select, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

    var control_panel_hide = $t.id('control_panel_hide');

    function on_control_panel_hide(ev) {
        if (ev) ev.stopPropagation();
        $t.hidden($t.id('control_panel_hidden'), false);
        $t.hidden($t.id('control_panel_shown'), true);
        if (ev) ev.preventDefault();
    }
    on_control_panel_hide();
    $t.bind(control_panel_hide, 'click', on_control_panel_hide);
    $t.bind(control_panel_hide, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(control_panel_hide, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

    var control_panel_show = $t.id('control_panel_show');

    function on_control_panel_show(ev) {
        if (ev) ev.stopPropagation();
        $t.hidden($t.id('control_panel_shown'), false);
        $t.hidden($t.id('control_panel_hidden'), true);
        if (ev) ev.preventDefault();
    }
    $t.bind(control_panel_show, 'click', on_control_panel_show);
    $t.bind(control_panel_show, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(control_panel_show, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

    var toggle_selector = $t.id('toggle_selector');

    function on_toggle_selector(ev) {
        if (ev) ev.stopPropagation();
        if (selector_div) $t.hidden(selector_div, selector_div.style.display != 'none');
        if (ev) ev.preventDefault();
    }
    $t.bind(toggle_selector, 'click', on_toggle_selector);
    $t.bind(toggle_selector, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(toggle_selector, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

    var parent_notation = $t.id('parent_notation');
    var parent_roll = $t.id('parent_roll');
    $t.bind(parent_roll, 'change', function() { 
        //alert("Rolling: "+parent_notation.value);
        if (parent_roll.value == "1") {
            set.value = parent_notation.value;
            $t.raise_event($t.id('throw'), 'mouseup');
        }
    });

    function submit_login(ev) {
        if(ev && ev.keyCode && ev.keyCode == 13) {
            $t.raise_event($t.id('button_join'), 'click');
        }
    }

    $t.bind($t.id('input_user'), 'keyup', submit_login);
    $t.bind($t.id('input_room'), 'keyup', submit_login);
    $t.bind($t.id('input_pass'), 'keyup', submit_login);

    $t.bind($t.id('button_join'), 'click', function(ev) {
        show_waitform(true);
        connect_socket(false, function (socketevent) {
            let user = $t.id('input_user').value;
            let room = $t.id('input_room').value;
            let pass = $t.id('input_pass').value;

            $t.rpc( { method: 'join', user: user, room: room, pass: pass } );
        });
    });

    $t.bind($t.id('button_single'), 'click', function(ev) {
        if ($t.socket && $t.socket.readyState <= WebSocket.OPEN) {
            $t.socket.close();
        }
        $t.offline = true;
        action_pool['login']({user: 'Yourself'});
    });

    $('#checkbox_allowdiceoverride').prop('checked', $t.DiceFavorites.settings['allowDiceOverride'] == '1');
    $('#checkbox_allowdiceoverride').change(function(event) {
        $t.DiceFavorites.settings['allowDiceOverride'] = $('#checkbox_allowdiceoverride').prop('checked') ? '1' : '0';
        $t.DiceFavorites.storeSettings();
        if($t.show_selector) $t.show_selector();
    });

    function connect_socket(reopen, callback) {
        if (reopen && $t.socket && $t.socket.readyState <= WebSocket.OPEN) {
            $t.socket.close();
            set_connection_message("Reconnecting...");
        } else {
            set_connection_message("Connecting...");
        }
        $t.openSocket();

        $t.socket.onerror = function(event) {
            set_connection_message("Connection Error", 'red', true);
            show_waitform(false);
            console.log(event);
            $t.offline = true;
        }

        $t.socket.onopen = function(event) {
            set_connection_message("Connected", 'green');
            show_waitform(false);
            console.log(event);
            $t.offline = false;
            callback.call(this, event);
        }

        $t.socket.onclose = function(event) {
            if (event.wasClean) {
                set_connection_message("Connection Ended");
            } else {
                set_connection_message("Connection Failed", 'red', true);    
            }
            console.log(event);
            show_waitform(false);
            $t.offline = true;
        }

        $t.socket.onmessage = function(message) {
            if (message && message.data) {
                var data = JSON.parse(message.data);
                if(data && data.cid) {
                    cid = data.cid;
                    console.log("Client id: "+cid);
                }

                if (data.error) {
                    set_connection_message(data.error, 'red');
                    show_waitform(false);
                    set_login_message(data.error, 'red');
                }

                if (data.method == 'join' && data.action == 'login') {
                    log.own_user = data.user;
                    show_waitform(false);
                    requestAnimationFrame(function() {});
                }

                if(!data.action || data.action.length < 1) return;

                if (action_pool.hasOwnProperty(data.action)) {
                    action_pool[data.action](data);
                }
                teal.id('waitform').style.display = "none";
            }
        }
    }

    function resize() {
        /*var w = window.innerWidth - 300 + 'px';
        var h = window.innerHeight + 'px';
        desk.style.width = canvas.style.width = w;
        desk.style.height = canvas.style.height = h;
        log.resize(300 - 30, window.innerHeight - 10);*/

        var w = window.innerWidth + 'px';
        var hh = Math.floor(window.innerHeight * 0.24);
        var h = window.innerHeight - hh + 'px';
        desk.style.width = canvas.style.width = w;
        desk.style.height = canvas.style.height = h;
        log.resize(window.innerWidth - 30, hh - 10);
    }

    function make_notation_for_log(notation, result) {

        notation = new DiceNotation(notation); //reinit notation class, if sent from server has no methods attached.
        var res = $t.element('span');

        res.innerHTML = (notation.result.length ? ' (preset result)' : '');
        res.innerHTML += '<span class="chat-notation">'+$t.dice.stringify_notation(notation) + (notation.result.length ? ' (preset result)' : '')+'</span>';
        res.innerHTML += '<span class="chat-notation-result">'+(result ? ' → ' + result : ' ...')+'</span>';

        return res;
    }

    function setSaveButtonText() {

        let icons = [
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💗', '🤎'
        ];

        $t.id('save').innerHTML = icons[Math.floor(Math.random() * icons.length)];
    }

    function mdice_initialize(container) {

        log.own_user = user;
        $t.hidden(desk, false);
        resize();
        on_set_change();

        $t.DiceFavorites.retrieve();
        $t.DiceFavorites.ensureOnScreen();

        $t.bind($t.id('clear'), ['mouseup', 'touchend'], function(ev) {
            ev.stopPropagation();
            set.value = '0';
            on_set_change();
            show_selector();
        });

        setSaveButtonText();

        $t.bind($t.id('save'), ['mouseup', 'touchend'], function(ev) {
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

            teal.DiceFavorites.create(name, set.value, color_select.value, texture_select.value, ev.pageX, ev.pageY);
            teal.DiceFavorites.store();

            setSaveButtonText();
        });

        function on_set_change(ev) { 
            set.style.width = set.value.length + 3 + 'ex';

            if(ev && ev.keyCode && ev.keyCode == 13) {
                $t.raise_event($t.id('throw'), 'mouseup');
            }
        }
        $t.bind(set, 'keyup', on_set_change);
        $t.bind(set, 'mousedown', function(ev) { ev.stopPropagation(); });
        $t.bind(set, 'mouseup', function(ev) { ev.stopPropagation(); });
        $t.bind(set, 'focus', function(ev) { $t.set(container, { class: '' }); });
        $t.bind(set, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

        $t.bind($t.id('rage'), ['mouseup', 'touchend'], function(ev) {
            ev.stopPropagation();
            let rage = 0;
            // count '!'
            for(let i = 0, l = set.value.length; i < l; i++){
                rage += (set.value.charAt(i) == '!') ? 1 : 0;
            }

            rage += 1;
            if (rage > 3) rage = 0;

            let newval = set.value.replace(/!/g, '');
            set.value = newval+('!'.repeat(rage));
            on_set_change();
        });

        box = new $t.dice.dice_box(canvas, { w: 500, h: 300 });
        box.use_adaptive_timestep = false;
        $t.box = box;

        box.bind_mouse(container, notation_getter, before_roll);
        box.bind_throw($t.id('throw'), notation_getter, before_roll);

        $t.bind(container, ['mouseup', 'touchend'], function(ev) {
            ev.stopPropagation();

            // if total display is up and dice aren't rolling, reset the selector
            if (info_div.style.display != 'none') {
                if (!box.rolling) show_selector();
                return;
            }

            // otherwise, select dice
            let name = box.search_dice_by_mouse(ev);
            if (name) {
                let notation = $t.dice.parse_notation(set.value);

                let shift = (ev && ev.shiftKey);
                let ctrl = (ev && ev.ctrlKey);
                let leftclick = (ev && ev.button == 0);

                let op = '+';
                if (ctrl && leftclick) op = '*';
                if (shift && leftclick) op = '/';
                if (ctrl && shift && leftclick) op = '-';

                notation.addSet(1, name, '', '', op);

                set.value = $t.dice.stringify_notation(notation);
                on_set_change();
            }
        });

        if (params.notation) {
            set.value = params.notation;
        }
        if (params.roll) {
            $t.raise_event($t.id('throw'), 'mouseup');
        }

        $t.bind(window, 'resize', function() {
            resize();
            box.reinit(canvas, { w: 500, h: 300 });
            teal.DiceFavorites.ensureOnScreen();
        });

        function close() {
            if (cid) {
                $t.rpc({ method: 'logout', cid: cid });
                $t.socket.close();
            }
        }
        $t.bind(window, 'beforeunload', close);
        window.onbeforeunload = close;
        window.onunload = close;

        $t.bind($t.id('logout'), 'click', function() {
            close();
            location.reload();
        });

        function show_selector() {

            info_div.style.display = 'none';
            $t.id('labelhelp').style.display = 'none';

            selector_div.style.display = 'block';
            $t.id('sethelp').style.display = 'block';
            deskrolling = false;
            applyColorSet(color_select.value, (texture_select.value || null));
            box.alldice = params.alldice;
            box.draw_selector((params.alldice && params.alldice == '1'));
        }

        $t.show_selector = show_selector;

        function before_roll(vectors, notation, callback) {
            label.innerHTML = log.own_user+' is Rolling...';
            info_div.style.display = 'block';
            $t.id('sethelp').style.display = 'none';
            deskrolling = true;
            set_connection_message('');
            show_waitform(true);
            box.clear();
            var time = new Date().getTime();
            log.add_unconfirmed_message(log.own_user, make_notation_for_log(notation),
                    time, log.roll_uuid = $t.uuid());

            if ($t.offline) {
                action_pool['roll']({ method: 'roll', user: log.own_user, cid: cid, vectors: vectors, notation: notation, time: time, colorset: color_select.value, texture: texture_select.value });

            } else {
                try {
                    pack_vectors(vectors);

                    $t.rpc({ method: 'roll', cid: cid, vectors: vectors, notation: notation, time: time },
                    function(response) {
                        if (response.method != 'roll') return;
                        if (response && response.error) set_connection_message(response.error, 'red');
                        show_waitform(false);
                        callback();
                    });
                }
                catch (e) {
                    set_connection_message(connection_error_text, 'red', true);
                    console.log(e);
                    callback();
                }
            }
        }

        function notation_getter() {
            return $t.dice.parse_notation(set.value);
        }

        log.bind_send(function(text) {
            var notation = $t.dice.parse_notation(text);
            var uuid = $t.uuid();
            if (notation.set.length && !notation.error) {
                set.value = text;
                box.start_throw(function() { return notation; }, before_roll);
            }
            else {
                if (text.length > 1) {
                    for (var i = 0, l = text.length; i < l; ++i) if (text[i] != '-') break;
                    if (i == l) text = $t.element('hr');
                }
                var time = new Date().getTime();
                log.add_unconfirmed_message(log.own_user, text, time, uuid);
                $t.rpc({ method: 'chat', cid: cid, text: text, time: time, uuid: uuid });
            }
        });

        show_selector();
    }

    function set_login_message(text, color = 'red') {
        $t.empty($t.id('login_message'))
        $t.inner(text, $t.id('login_message'));
        $t.id('login_message').style.color = color;
    }

    function show_waitform(show) {
        $t.id('waitform').style.display = show ? 'block' : 'none';
        $t.id('waitform').style.cursor = show ? 'default' : 'wait';
        $t.id('waitform').style.visibility = show ? 'visible' : 'hidden';
    }

    // actions performed when the server sends a command
    var action_pool = {
        login: function(res) {
            var loginform = $t.id('loginform');
            if (loginform) {
                $t.remove(loginform);
                loginform.style.display = 'none';
                mdice_initialize(container);
                $t.id('label_players').style.display = "inline-block";
                log.place.style.display = "inline-block";
                log.own_user = res.user;

                $t.rpc( { method: 'colorset', colorset: color_select.value });
                $t.rpc( { method: 'texture', texture: texture_select.value });
            }
            set_connection_message(' ');
        },
        userlist: function(res) {
            var f = $t.id('label_players');
            f.innerHTML = res.room + ': ' + res.list.join(', ');
            log.add_info(res.user + ' has ' + { 'add': 'joined', 'del': 'left' }[res.act] + ' the room');
        },
        roll: function(res) {
            teal.id('waitform').style.display = "none";
            if (log.roll_uuid) log.confirm_message(log.roll_uuid, undefined, true);
            else log.add_unconfirmed_message(res.user, make_notation_for_log(res.notation),
                    res.time, log.roll_uuid = $t.uuid(), true);

            label.innerHTML = res.user+' is Rolling...';
            info_div.style.display = 'block';
            //selector_div.style.display = 'none';
            deskrolling = true;
            if (res.colorset.length > 0 || res.texture.length > 0) applyColorSet(res.colorset, res.texture, false);
            box.clear();
            box.rolling = true;
            if (!$t.offline) unpack_vectors(res.vectors);
            box.roll(res.vectors, res.notation.result, function(result) {

                let numberdicevalues = [];
                let numberdiceoperators = [];
                let labeldicevalues = [];
                let swrpgdice = [];
                let swarmadadice = [];
                let xwingdice = [];
                let legiondice = [];

                // split up results between nubmer and symbol dice
                for(let i = 0; i < result.dice.length; i++){

                    let dicemesh = result.dice[i];
                    let diceobj =  $t.DiceFactory.get(dicemesh.dice_type);
                    let operator = dicemesh.dice_operator;

                    if (diceobj.system == 'swrpg') {
                        swrpgdice.push(result.labels[i]);
                    } else if (diceobj.system == 'swarmada') {
                        swarmadadice.push(result.labels[i]);
                    } else if (diceobj.system == 'xwing') {
                        xwingdice.push(result.labels[i]);
                    } else if (diceobj.system == 'legion') {
                        legiondice.push(result.labels[i]);
                    } else if (diceobj.system == 'd20') {
                        numberdiceoperators.push(operator);
                        numberdicevalues.push(result.values[i]);
                    } else {
                        if (diceobj.display == 'labels') {
                            labeldicevalues.push(result.labels[i]);
                        } else if (diceobj.display == 'values') {
                            numberdiceoperators.push(operator);
                            numberdicevalues.push(result.values[i]);
                        }
                    }
                }

                let rolls = '';
                let totals = '';

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

                    rolls += '[<span style="font-family: \'SWRPG-Symbol-Regular\'">';

                    for(let i = 0; i < swrpgdice.length; i++){

                        let currentlabel = swrpgdice[i];

                        success += (currentlabel.split('s').length - 1);
                        failure += (currentlabel.split('f').length - 1);
                        advantage += (currentlabel.split('a').length - 1);
                        threat += (currentlabel.split('t').length - 1);
                        triumph += (currentlabel.split('x').length - 1);
                        despair += (currentlabel.split('y').length - 1);
                        dark += (currentlabel.split('z').length - 1);
                        light += (currentlabel.split('Z').length - 1);
                    }

                    rolls += 's'.repeat(success);
                    rolls += 'f'.repeat(failure);
                    rolls += 'a'.repeat(advantage);
                    rolls += 't'.repeat(threat);
                    rolls += 'x'.repeat(triumph);
                    rolls += 'y'.repeat(despair);
                    rolls += 'z'.repeat(dark);
                    rolls += 'Z'.repeat(light);

                    rolls = rolls.trim();

                    rolls += '</span>]';

                    totals += '<span style="font-family: \'SWRPG-Symbol-Regular\'">';

                    if (success > failure) totals += 's'.repeat(success-failure);
                    if (failure > success) totals += 'f'.repeat(failure-success);
                    if (advantage > threat) totals += 'a'.repeat(advantage-threat);
                    if (threat > advantage) totals += 't'.repeat(threat-advantage);
                    if (triumph > 0) totals += 'x'.repeat(triumph);
                    if (despair > 0) totals += 'y'.repeat(despair);
                    if (dark > 0) totals += 'z'.repeat(dark);
                    if (light > 0) totals += 'Z'.repeat(light);

                    totals = totals.trim() + '</span>';

                }

                // swarmada dice, custom logic
                if(swarmadadice.length > 0) {

                    let hit = 0;
                    let critical = 0;
                    let accuracy = 0;

                    rolls += '[<span style="font-family: \'Armada-Symbol-Regular\'">';

                    for(let i = 0; i < swarmadadice.length; i++){

                        let currentlabel = swarmadadice[i];

                        hit += (currentlabel.split('F').length - 1);
                        critical += (currentlabel.split('E').length - 1);
                        accuracy += (currentlabel.split('G').length - 1);
                    }

                    rolls += 'F'.repeat(hit);
                    rolls += 'E'.repeat(critical);
                    rolls += 'G'.repeat(accuracy);

                    rolls = rolls.trim();

                    rolls += '</span>]';

                    totals += '<span style="font-family: \'Armada-Symbol-Regular\'">';
                    
                    if (hit > 0) totals += 'F'.repeat(hit);
                    if (critical > 0) totals += 'E'.repeat(critical);
                    if (accuracy > 0) totals += 'G'.repeat(accuracy);

                    totals = totals.trim() + '</span>';

                }

                // xwing dice, custom logic
                if(xwingdice.length > 0) {

                    let hit = 0;
                    let critical = 0;
                    let focus = 0;
                    let evade = 0;

                    rolls += '[<span style="font-family: \'XWing-Symbol-Regular\'">';

                    for(let i = 0; i < xwingdice.length; i++){

                        let currentlabel = xwingdice[i];

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

                    rolls += '</span>]';

                    totals += '<span style="font-family: \'XWing-Symbol-Regular\'">';

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
                    
                    if (hit > 0) totals += 'd'.repeat(Math.max(hit,0));
                    if (critical > 0) totals += 'c'.repeat(Math.max(critical,0));
                    if (focus > 0) totals += 'f'.repeat(Math.max(focus,0));
                    if (evade > 0) totals += 'e'.repeat(Math.max(evade,0));

                    totals = totals.trim() + '</span>';

                }

                // legion dice, custom logic
                if(legiondice.length > 0) {

                    let atk_hit = 0;
                    let atk_crit = 0;
                    let atk_surge = 0;

                    let def_block = 0;
                    let def_surge = 0;

                    rolls += '[<span style="font-family: \'Legion-Symbol-Regular\'">';

                    for(let i = 0; i < legiondice.length; i++){

                        let currentlabel = legiondice[i];

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

                    rolls += '</span>]';

                    totals += '<span style="font-family: \'Legion-Symbol-Regular\'">';

                    /*
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
                    */
                    
                    if (atk_hit > 0) totals += 'h'.repeat(Math.max(atk_hit,0));
                    if (atk_crit > 0) totals += 'c'.repeat(Math.max(atk_crit,0));
                    if (atk_surge > 0) totals += 'o'.repeat(Math.max(atk_surge,0));
                    if (def_block > 0) totals += 's'.repeat(Math.max(def_block,0));
                    if (def_surge > 0) totals += 'd'.repeat(Math.max(def_surge,0));

                    totals = totals.trim() + '</span>';

                }

                // labels only
                if (labeldicevalues.length > 0) {
                    rolls += labeldicevalues.join('');
                    totals += labeldicevalues.join('');
                }

                // numbers only
                if (numberdicevalues.length > 0) {

                    rolls += '[';

                    let total = 0;
                    let lastoperator = numberdiceoperators[0];
                    let valuesofar = [];

                    for(let i = 0; i < numberdicevalues.length; i++){                        
                        let value = parseInt(numberdicevalues[i]);
                        let op = numberdiceoperators[i];

                        if(op != lastoperator) {
                            lastoperator = op;
                            if (i != numberdicevalues.length-1) {
                                rolls += valuesofar.join(',')+']'+op+'[';
                                valuesofar = [];
                            }
                        }

                        valuesofar.push(value);

                        if (i == numberdicevalues.length-1) {
                            rolls += valuesofar.join(',');
                        }

                        switch (op) {
                            case '*': total *= value; break;
                            case '/': total = total / value; break;
                            case '-': total -= value; break;
                            case '+': default: total += value; break;
                        }
                    }

                    rolls += ']';

                    if (res.notation.constant != '') {
                        let constant = parseInt(res.notation.constant);

                        rolls += res.notation.op + Math.abs(constant);

                        switch (res.notation.op) {
                            case '*': total *= constant; break;
                            case '/': total = total / constant; break;
                            case '-': total -= constant; break;
                            case '+': default: total += constant; break;
                        }
                    }
                    
                    totals += ' '+total;
                }

                label.innerHTML = (rolls+'<h2>'+totals+'</h2>');


                info_div.style.display = 'block';
                $t.id('labelhelp').style.display = 'block';
                deskrolling = false;
                box.rolling = false;
                if (log.roll_uuid) {
                    log.confirm_message(log.roll_uuid, make_notation_for_log(res.notation, (rolls+' = '+totals)));
                    delete log.roll_uuid;
                }
            });
        },
        chat: function(res) {
            if (res.uuid) log.confirm_message(res.uuid);
            else log.add_message(res.user, res.text, res.time);
        },
        colorset: function(res) {
            alert("colorset: "+res.colorset);
        },
        texture: function(res) {
            alert("texture: "+res.texture);
        },
        roomlist: function(res) {
            console.log(res);
        }
    };
}

