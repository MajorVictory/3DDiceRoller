<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xml:lang="en" lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="keywords" content="DnD, dangeon and dragons, roleplay, dice, roller, 3D, RPG, wargame"/>
<meta name="description" content="Online 3D dice roller"/>
<title>3d dice roller</title>
<style type="text/css">@import "./includes/main.css";</style>
<style type="text/css">@import "./includes/dice.css";</style>
<!-- Original Source: http://www.teall.info/2014/01/online-3d-dice-roller.html -->
</head>
<body style="margin: 0">
    <input type="hidden" id="parent_notation" value="">
    <input type="hidden" id="parent_roll" value="0">
    <div id="info_div" style="display: none">
        <div class="center_field">
            <span id="label"></span>
        </div>
        <div class="center_field">
            <div class="bottom_field">
                <span id="labelhelp">click to continue or tap and drag again</span>
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
        <?php
        $ColorSets = array(
            'Damage Types' => array(
                'Acid' => 'acid',
                'Air' => 'air',
                'Earth' => 'earth',
                'Fire' => 'fire',
                'Force' => 'force',
                'Lightning' => 'lightning',
                'Necrotic' => 'necrotic',
                'Poison' => 'Poison',
                'Psychic' => 'psychic',
                'Radiant' => 'radiant',
                'Thunder' => 'thunder',
                'Water' => 'water'
            ),
            'Colors' => array(
                'Black' => 'black',
                'White' => 'white',
                'Random' => 'random',
            ),
            'Custom Sets' => array(
                'Pastel Sunset' => 'breebaby',
                'Pink Dreams' => 'pinkdreams',
                'Inspired' => 'inspired',
                'Blood Moon' => 'bloodmoon',
            ),
            'Memes' => array(
                'COVID-19' => 'covid',
                'Isabelle' => 'isabelle',
                'Nicholas Cage' => 'thecage',
            )
        );

        $Textures = array(
            'Random' => 'random',
            'Cloudy' => 'cloudy',
            'Fire' => 'fire',
            'Ice' => 'ice',
            'Water' => 'water',
            'Marble' => 'marble',
            'Speckles' => 'noise',
            'Isabelle' => 'isabelle',
            'Nicholas Cage' => 'thecage'
        );

        ?>
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

    <script src="./libs/three.min.js"></script>
    <script src="./libs/cannon.min.js"></script>
    <script type="text/javascript" src="./includes/teal.js"></script>
    <script type="text/javascript" src="./includes/dice.js"></script>
    <script type="text/javascript" src="./includes/main.js"></script>
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
