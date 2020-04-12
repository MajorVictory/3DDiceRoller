<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xml:lang="en" lang="en" xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="keywords" content="DnD, dangeon and dragons, roleplay, dice, roller, 3D, RPG, wargame"/>
<meta name="description" content="Online 3D dice roller"/>
<title>Major's 3D Dice</title>

<style type="text/css">@import "./includes/main.css";</style>
<style type="text/css">@import "./includes/dice.css";</style>
<style type="text/css">@import "./includes/login.css";</style>
<!-- Original Source: http://www.teall.info/2014/01/online-3d-dice-roller.html -->

<?php
$ColorSets = array(
    'Damage Types' => array(
        'Acid' => 'acid',
        'Air' => 'air',
        'Earth' => 'earth',
        'Fire' => 'fire',
        'Force' => 'force',
        'Ice' => 'ice',
        'Lightning' => 'lightning',
        'Necrotic' => 'necrotic',
        'Poison' => 'poison',
        'Psychic' => 'psychic',
        'Radiant' => 'radiant',
        'Thunder' => 'thunder',
        'Water' => 'water'
    ),
    'Colors' => array(
        'Black' => 'black',
        'White' => 'white',
        'Random' => 'random'
    ),
    'Custom Sets' => array(
        'Pastel Sunset' => 'breebaby',
        'Pink Dreams' => 'pinkdreams',
        'Inspired' => 'inspired',
        'Glitter Party' => 'glitterparty',
        'The Astral Sea' => 'astralsea',
        'Blood Moon' => 'bloodmoon',
        'Stary Night' => 'starynight'
    ),
    'Other' => array(
        'COVID-19' => 'covid',
        'AC Leaf' => 'acleaf',
        'Leopard' => 'leopard',
        'Isabelle' => 'isabelle',
        'Nicholas Cage' => 'thecage'
    )
);

$Textures = array(
    'None' => '',
    'Random' => 'random',
    'Cloudy' => 'cloudy',
    'Fire' => 'fire',
    'Ice' => 'ice',
    'Water' => 'water',
    'Marble' => 'marble',
    'Paper' => 'paper',
    'Speckles' => 'speckles',
    'Glitter' => 'glitter',
    'Stars' => 'stars',
    'Stained Glass' => 'stainedglass',
    'Skulls' => 'skulls',
    'Leopard' => 'leopard',
    'AC Leaf' => 'acleaf',
    'Isabelle' => 'isabelle',
    'Nicholas Cage' => 'thecage'
);

?>
</head>
<body style="margin: 0; overflow: hidden">
    <input type="hidden" id="parent_notation" value="">
    <input type="hidden" id="parent_roll" value="0">

    <div id="waitform"></div>
    <div class="control_panel noselect">
        <p id="loading_text">Loading libraries, please wait a bit...</p>
        <div id="success_text" style="color: green">&nbsp;</div>
        <div id="error_text" style="color: red">&nbsp;</div>
        <button id="reconnect">Reconnect</button>
    </div>

    <div id="loginform" style="display: table; background-color: #f4f4f4; position: absolute; height: 100%; width: 100%;">
    <div style="display: table-cell; vertical-align: middle">
    <div style="margin-left: auto; margin-right: auto; width: 100%">
        <div class="loginform">
            <div class="lform">
                <div>Player Name</div>
                <input id="input_user" type="text" value=""></input>
                <div>Room Name</div>
                <input id="input_room" type="text" value=""></input>
                <div>Dice</div>
                <select id="login_color" name="login_color">
                    <?php foreach ($ColorSets as $group => $values) {
                        ?><optgroup label="<?= $group ?>"><?
                        foreach ($values as $name => $value) {
                            ?> <option value="<?= $value ?>"<?= ($_GET['color'] == $value) ? 'selected="selected"' : '' ?>><?= $name ?></option> <?
                        }
                        ?></optgroup><?
                    } ?>
                </select>
                <select id="login_texture" name="login_texture">
                    <?php foreach ($Textures as $name => $value) {
                        ?> <option value="<?= $value ?>"<?= ($_GET['texture'] == $value) ? 'selected="selected"' : '' ?>><?= $name ?></option> <?
                    } ?>
                </select>
                <br/>
                <span id="login_colorname"></span>
            </div>
            <br/>
            <button id="button_join">enter</button>
            <p/>
            <!-- <div class="smalllabel">
                created using <a href="http://threejs.org">three.js</a> and
                <a href="http://cannonjs.org">cannon.js</a>,
                powered by <a href="https://developers.google.com/appengine/">Google App Engine</a>,
                <br/>
                true random numbers generated with <a href="http://random.org">random.org</a>
            </div> -->
        </div>
    </div>
    </div>
    </div>

    <div id="desk" class="noselect" style="position: relative; float: left">
    <div id="info_div" style="display: none">
        <div class="center_field">
            <span id="label"></span>
        </div>
        <div class="center_field">
            <div class="bottom_field">
                <span id="labelhelp"><!--click to continue or tap and drag again--></span>
            </div>
        </div>
    </div>
    <div id="selector_div" style="display: none">
        <div class="center_field">
            <div id="sethelp">
                <!--choose your dice set by clicking each one,<br/>
                tap and drag on free space of screen or hit throw button to roll-->
            </div>
        </div>
        <div class="center_field">
            <div>
                <input type="text" id="set" name="set" value="4d6"></input><br/>
                <button id="throw">Throw</button>
                <button id="clear">Reset</button>
            </div>
            <form id="optionform" action="" method="get">
                <select id="color" name="color">
                    <?php foreach ($ColorSets as $group => $values) {
                        ?><optgroup label="<?= $group ?>"><?
                        foreach ($values as $name => $value) {
                            ?> <option value="<?= $value ?>"<?= ($_GET['color'] == $value) ? 'selected="selected"' : '' ?>><?= $name ?></option> <?
                        }
                        ?></optgroup><?
                    } ?>
                </select>
                <select id="texture" name="texture">
                    <?php foreach ($Textures as $name => $value) {
                        ?> <option value="<?= $value ?>"<?= ($_GET['texture'] == $value) ? 'selected="selected"' : '' ?>><?= $name ?></option> <?
                    } ?>
                </select>
                <br/>
                <span id="colorname"></span>
            </form>
        </div>
    </div>
    <div id="canvas"></div>
    <div class="info-field">
        <span id="info_field" style="display: none"></span>
    </div>
    </div>

    <div id="log" class="teal-chat" style="display: none"></div>
    <button id="logout">logout</button>

    <script src="./libs/three.min.js"></script>
    <script src="./libs/cannon.min.js"></script>

    <script type="text/javascript" src="./includes/teal.js"></script>
    <script type="text/javascript" src="./includes/teal.chat.js"></script>
    <script type="text/javascript" src="./includes/colorsets.js"></script>
    <script type="text/javascript" src="./includes/dice.js"></script>
    <script type="text/javascript" src="./includes/login.js"></script>
    <script type="text/javascript" defer="defer">
        
		preload_and_init();

		window.addEventListener("message", receiveMessage, false);

        function receiveMessage(event) {
            console.log(event);

            if (event.origin !== "https://www.improved-initiative.com") return;

            parent_notation = $t.id('parent_notation');
            parent_roll = $t.id('parent_roll');

            parent_notation.value = event.data;
            parent_roll.value = "1";
            $t.raise(parent_notation, 'change');
            $t.raise(parent_roll, 'change');
        }
    </script>

</body>
</html>
