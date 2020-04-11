
function ImageLoader(sources, callback) {
    var images = {};
    var loadedImages = 0;
    var numImages = 0;

    // get num of sources
    for (var src in sources) {
        numImages++;
    }

    for (var src in sources) {
        images[src] = new Image();
        images[src].onload = function() {

            if (++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].src = sources[src];
    }
}

var sources = {
    'cloudy': './textures/cloudy.png',
    'fire': './textures/fire.png',
    'marble': './textures/marble.png',
    'water': './textures/water.png',
    'ice': './textures/ice.png',
    'noise': './textures/noise.png',
    'thecage': './textures/thecage.png',
    'isabelle': './textures/isabelle.png'
};
var diceTextures = {};

function randomColor() {

    // random colors
    var rgb=[];
    rgb[0] = Math.floor(Math.random() * 254);
    rgb[1] = Math.floor(Math.random() * 254);
    rgb[2] = Math.floor(Math.random() * 254);

    var brightness = ((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) +  (parseInt(rgb[2]) * 114)) / 1000;
    var foreground = (brightness > 126) ? 'rgb(30,30,30)' : 'rgb(230,230,230)'; // high brightness = dark text, else bright text
    var background = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';

    return [background, foreground];
}

function getColorSet(colorsetname) {
    var desc = '';
    var fgcolor = '#aaaaaa';
    var bgcolor = '#202020';
    var texture = '';

    switch (colorsetname.toLowerCase()) {

        case 'white':
            fgcolor = '#000000'; 
            bgcolor = '#FFFFFF'; 
            texture = getTexture('none');
            desc = 'White';
            break;
        case 'radiant': 
            fgcolor = '#7E5400'; 
            bgcolor = '#C4C4B6'; 
            texture = getTexture('ice');
            desc = 'Radiant';
            break;
        case 'fire': 
            fgcolor = ['#000000','#000000','#000000','#ffffff','#ffffff']; 
            bgcolor = ['#f8d84f','#f9b02d','#f43c04','#910200','#4c1009']; 
            texture = getTexture('fire');
            desc = 'Fire';
            break; 
        case 'ice': 
            fgcolor = ['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff']; 
            bgcolor = ['#214fa3','#3c6ac1','#253f70','#0b56e2','#09317a']; 
            texture = getTexture('ice');
            desc = 'Ice';
            break; 
        case 'poison': 
            fgcolor = ['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff']; 
            bgcolor = ['#313866','#504099','#66409e','#934fc3','#c949fc']; 
            texture = getTexture('marble');
            desc = 'Poison';
            break; 
        case 'acid': 
            fgcolor = '#303030'; 
            bgcolor = ['#a6ff00', '#83b625','#5ace04','#69f006','#b0f006','#93bc25']; 
            texture = getTexture('marble');
            desc = 'Acid';
            break; 
        case 'thunder': 
            fgcolor = ['#000000', '#000000','#000000','#000000','#ffffff','#ffffff'] 
            bgcolor = ['#feffef', '#cff3e1','#9fb1bc','#7c90a0','#596869','#384142']; 
            texture = getTexture('cloudy');
            desc = 'Thunder';
            break; 
        case 'lightning': 
            fgcolor = ['#000000', '#000000','#000000','#000000','#000000'] 
            bgcolor = ['#f17105', '#f3ca40','#eddea4','#df9a57','#dea54b']; 
            texture = getTexture('ice');
            desc = 'Lightning';
            break; 
        case 'air': 
            fgcolor = '#ffffff';
            bgcolor = ['#d0e5ea', '#c3dee5','#a4ccd6','#8dafb7','#80a4ad']; 
            texture = getTexture('cloudy');
            desc = 'Air';
            break; 
        case 'water': 
            fgcolor = '#ffffff';
            bgcolor = ['#87b8c4', '#77a6b2','#6b98a3','#5b8691','#4b757f']; 
            texture = getTexture('water');
            desc = 'Water';
            break; 
        case 'earth': 
            fgcolor = ['#ffffff', '#ffffff','#ffffff','#000000','#000000', '#ffffff', '#ffffff','#ffffff','#ffffff','#ffffff']
            bgcolor = ['#346804', '#184200','#527f22','#96c65b','#77a53b', '#3a1d04', '#56341a','#331c17','#5a352a','#302210']; 
            texture = getTexture('noise');
            desc = 'Earth';
            break; 
        case 'force': 
            var colors = getColorSet('pinkdreams');
            fgcolor = colors.foreground;
            bgcolor = colors.background; 
            texture = getTexture('ice');
            desc = 'Force';
            break;
        case 'psychic': 
            var colors = getColorSet('poison');
            fgcolor = colors.foreground;
            bgcolor = colors.background;  
            texture = getTexture('ice');
            desc = 'Psychic';
            break;
        case 'test': 
            fgcolor = ['#00FF00','#0000FF','#FF0000']; 
            bgcolor = ['#FF0000','#00FF00','#0000FF']; 
            texture = getTexture('none');
            desc = 'Test';
            break; 
        case 'random': 
            fgcolor = [];
            bgcolor = [];

            for (var i = 0; i < 11; i++) {
                var randcolor = randomColor();
                fgcolor.push(randcolor[1]);
                bgcolor.push(randcolor[0]);
            } 

            var names = Object.getOwnPropertyNames(diceTextures);
            var texturelist = [];
            for (var i = names.length - 1; i >= 0; i--) {
                texturelist.push(diceTextures[names[i]]);
            }
            texture = {name:'random',texture:texturelist};

            desc = 'RaNdOm';
            break;
        case 'breebaby': 
            fgcolor = ['#5E175E', '#564A5E','#45455E','#3D5A5E','#1E595E','#5E3F3D','#5E1E29','#283C5E','#25295E'];
            bgcolor = ['#FE89CF', '#DFD4F2','#C2C2E8','#CCE7FA','#A1D9FC','#F3C3C2','#EB8993','#8EA1D2','#7477AD'];  
            texture = getTexture('marble');
            desc = 'Pastel Sunset, for Breyanna';
            break;
        case 'pinkdreams': 
            fgcolor = '#000000';
            bgcolor = ['#ff007c', '#df73ff','#f400a1','#df00ff','#ff33cc'];  
            texture = getTexture('marble');
            desc = 'Pink Dreams, for Ethan';
            break;
        case 'inspired': 
            fgcolor = '#936910';
            bgcolor = '#C4C4B6';  
            texture = getTexture('none');
            desc = 'Inspired, for Austin';
            break;
        case 'bloodmoon': 
            fgcolor = '#936910';
            bgcolor = '#400000';  
            texture = getTexture('marble');
            desc = 'Blood Moon, for Jared';
            break;
        case 'covid': 
            var colors = getColorSet('acid');
            fgcolor = colors.foreground;
            bgcolor = colors.background;  
            texture = getTexture('fire');
            desc = 'Covid-19';
            break;
        case 'isabelle': 
            fgcolor = '#000000';
            bgcolor = '#FEE5CC';  
            texture = getTexture('isabelle');
            desc = 'Isabelle';
            break;
        case 'thecage': 
            fgcolor = '#ffffff';
            bgcolor = '#ffffff';  
            texture = getTexture('thecage');
            desc = 'Nicholas Cage';
            break;
        case 'necrotic': case 'black': default: 
            fgcolor = '#ffffff'; 
            bgcolor = '#000000'; 
            texture = getTexture('none');
            desc = 'Default Black';
            break;
    }

    var colors = {foreground: fgcolor, background: bgcolor, texture: texture, description: desc};
    return colors;
}

function getTexture(texturename) {

    if (texturename == 'none') {
        return {name:'',texture:''};
    }

    if(texturename == 'random') {
        var names = Object.getOwnPropertyNames(diceTextures);
        // add blank for possibility of no texture
        names.push('');

        return getTexture(names[Math.floor(Math.random() * names.length)]);
    }

    if (diceTextures[texturename] != null) {
        return { name:texturename, texture:diceTextures[texturename] };
    }
    return {name:'',texture:''};
}

function applyColorSet(colorset, texture = null, update = true) {


    if (colorset && colorset.length > 0) {
		var colordata = getColorSet(colorset);
        $t.dice.label_color = colordata.foreground;
        $t.dice.dice_color = colordata.background;
        $t.dice.dice_texture = colordata.texture.texture;

        if (texture == null) texture = colordata.texture.name;

	    if (update) {
	    	$t.empty($t.id('login_colorname'));
	    	$t.empty($t.id('colorname'));
		    $t.inner("Dice Theme: "+colordata.description, $t.id('login_colorname'));
		    $t.inner("Dice Theme: "+colordata.description, $t.id('colorname'));
		    $t.selectByValue($t.id('login_color'), colorset);
		    $t.selectByValue($t.id('color'), colorset);
	    }
    }

    if (texture || texture == '') {
		var texturedata = getTexture(texture);
        $t.dice.dice_texture = texturedata.texture;

        if (update) {
		    $t.selectByValue($t.id('login_texture'), texturedata.name);
		    $t.selectByValue($t.id('texture'), texturedata.name);
	    }
    }
}