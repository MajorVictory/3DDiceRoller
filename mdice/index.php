<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xml:lang="en" lang="en" xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="keywords" content="DnD, dangeon and dragons, roleplay, dice, roller, 3D, RPG, wargame"/>
<meta name="description" content="Online 3D dice roller"/>
<title>teal multiplayer 3d dice roller</title>

<style type="text/css">@import "../includes/main.css";</style>
<style type="text/css">@import "../includes/dice.css";</style>
<style type="text/css">@import "../includes/login.css";</style>

</head>

<body style="margin: 0; overflow: hidden">
    <div id="waitform"></div>
    <div class="control_panel noselect">
        <p id="loading_text">Loading libraries, please wait a bit...</p>
    </div>

    <div id="loginform" style="display: table; background-color: #f4f4f4; position: absolute; height: 100%; width: 100%;">
    <div style="display: table-cell; vertical-align: middle">
    <div style="margin-left: auto; margin-right: auto; width: 100%">
        <div class="loginform">
            <div class="lform">
                <div>player</div>
                <input id="input_user" type="text" value=""></input>
                <div>room</div>
                <input id="input_room" type="text" value=""></input>
            </div>
            <br/>
            <button id="button_join">enter</button>
            <p/>
            <div id="error_text" style="color: red">&nbsp;</div>
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
                <span id="labelhelp">click to continue or tap and drag again</span>
            </div>
        </div>
    </div>
    <div id="selector_div" style="display: none">
        <div class="center_field">
            <div id="sethelp">
                choose your dice set by clicking the dices or by direct input of notation,<br/>
                tap and drag on free space of screen or hit throw button to roll
            </div>
        </div>
        <div class="center_field">
            <input type="text" id="set" value="4d6"></input><br/>
            <button id="clear">clear</button>
            <button style="margin-left: 0.6em" id="throw">throw</button>
        </div>
    </div>
    <div id="canvas"></div>
    <div class="info-field">
        <span id="info_field" style="display: none"></span>
    </div>
    </div>

    <div id="log" class="teal-chat" style="display: none"></div>
    <button id="logout">logout</button>

    <script src="../libs/three.min.js"></script>
    <script src="../libs/cannon.min.js"></script>

    <script type="text/javascript" src="../includes/teal.js"></script>
    <script type="text/javascript" src="../includes/teal.chat.js"></script>
    <script type="text/javascript" src="../includes/dice.js"></script>
    <script type="text/javascript" src="../includes/login.js"></script>
    <script type="text/javascript" defer="defer">
        login_initialize($t.id('desk'));
    </script>

</body>
</html>
