"use strict";


function preload_and_init() {
	var isReady = ImageLoader(sources, function(images) {
		diceTextures = images;
		dice_initialize(document.body);
	});
}

function dice_initialize(container) {

	var canvas = $t.id('canvas');
	canvas.style.width = window.innerWidth - 1 + 'px';
	canvas.style.height = window.innerHeight - 1 + 'px';
	var label = $t.id('label');
	var set = $t.id('set');
	var color_select = $t.id('color');
	var texture_select = $t.id('texture');
	var selector_div = $t.id('selector_div');
	var info_div = $t.id('info_div');
	on_set_change();

	var parent_notation = $t.id('parent_notation');
	var parent_roll = $t.id('parent_roll');

	//$t.bind(parent_notation, 'change', function() { alert(parent_notation.value);});
	$t.bind(parent_roll, 'change', function() { 
		//alert("Rolling: "+parent_notation.value);
		if (parent_roll.value == "1") {
			set.value = parent_notation.value;
			$t.raise_event($t.id('throw'), 'mouseup');
		}
	});


	$t.dice.use_true_random = false;

	function on_set_change(ev) { set.style.width = set.value.length + 3 + 'ex'; }
	$t.bind(set, 'keyup', on_set_change);
	$t.bind(set, 'mousedown', function(ev) { ev.stopPropagation(); });
	$t.bind(set, 'mouseup', function(ev) { ev.stopPropagation(); });
	$t.bind(set, 'focus', function(ev) { $t.set(container, { class: '' }); });
	$t.bind(set, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

	function on_color_select_change(ev) { 
		$t.selectByValue($t.id('texture'), '');
		applyColorSet(this.value, null);
		box.draw_selector();
	}
	$t.bind(color_select, ['keyup','change','touchend'], on_color_select_change);
	$t.bind(color_select, ['mousedown', 'mouseup', 'touchstart'], function(ev) { ev.stopPropagation(); });
	$t.bind(color_select, 'focus', function(ev) { $t.set(container, { class: '' }); });
	$t.bind(color_select, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

	function on_texture_select_change(ev) { 
		applyColorSet('', this.value);
		box.draw_selector();
	}
	$t.bind(texture_select, ['keyup','change','touchend'], on_texture_select_change);
	$t.bind(texture_select, ['mousedown', 'mouseup', 'touchstart'], function(ev) { ev.stopPropagation(); });
	$t.bind(texture_select, 'focus', function(ev) { $t.set(container, { class: '' }); });
	$t.bind(texture_select, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });


	$t.bind($t.id('clear'), ['mouseup', 'touchend'], function(ev) {
		ev.stopPropagation();
		set.value = '0';
		on_set_change();
	});

	var params = $t.get_url_params();
	if (params.colorset || params.texture) {
		applyColorSet(params.colorset, params.texture);
	} else {
		applyColorSet('random', null);
	}

	var box = new $t.dice.dice_box(canvas, { w: 500, h: 300 });
	box.use_adapvite_timestep = false;

	if (params.chromakey) {
		$t.dice.desk_color = 0x00ff00;
		info_div.style.display = 'none';
		$t.id('control_panel').style.display = 'none';
	}
	if (params.shadows == 0) {
		$t.dice.use_shadows = false;
	}

	$t.bind(window, 'resize', function() {
		canvas.style.width = window.innerWidth - 1 + 'px';
		canvas.style.height = window.innerHeight - 1 + 'px';
		box.reinit(canvas, { w: 500, h: 300 });
	});

	function show_selector() {
		info_div.style.display = 'none';
		selector_div.style.display = 'inline-block';
		box.draw_selector();
	}

	function before_roll(vectors, notation, callback) {
		info_div.style.display = 'none';
		selector_div.style.display = 'none';
		// do here rpc call or whatever to get your own result of throw.
		// then callback with array of your result, example:
		// callback([2, 2, 2, 2]); // for 4d6 where all dice values are 2.
		callback();
	}

	function notation_getter() {
		return $t.dice.parse_notation(set.value);
	}

	function after_roll(notation, result) {
		if (params.chromakey || params.noresult) return;
		var res = result.join(' ');
		if (notation.constant) {
			if (notation.constant > 0) res += ' +' + notation.constant;
			else res += ' -' + Math.abs(notation.constant);
		}
		//if (result.length > 1) 
		res += ' = ' + (result.reduce(function(s, a) { return s + a; }) + notation.constant);
		label.innerHTML = res;
		info_div.style.display = 'inline-block';
	}

	box.bind_mouse(container, notation_getter, before_roll, after_roll);
	box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);

	$t.bind(container, ['mouseup', 'touchend'], function(ev) {
		ev.stopPropagation();
		if (selector_div.style.display == 'none') {
			if (!box.rolling) show_selector();
			box.rolling = false;
			return;
		}
		var name = box.search_dice_by_mouse(ev);
		if (name != undefined) {
			var notation = $t.dice.parse_notation(set.value);
			notation.set.push(name);
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
	else {
		show_selector();
	}
}