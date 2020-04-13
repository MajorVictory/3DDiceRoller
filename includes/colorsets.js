
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
    'paper': './textures/paper.png',
    'speckles': './textures/speckles.png',
    'glitter': './textures/glitter.png',
    'stars': './textures/stars.png',
    'stainedglass': './textures/stainedglass.png',
    'skulls': './textures/skulls.png',
    'leopard': './textures/leopard.jpg',
    'astral': './textures/astral.png',
    'acleaf': './textures/acleaf.png',
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

    return {background: background, foreground: foreground };
}

function getColorSet(colorsetname) {
    var desc = '';
    var fgcolor = '#aaaaaa';
    var bgcolor = '#202020';
    var outline = 'black';
    var texture = '';

    switch (colorsetname.toLowerCase()) {

        case 'white':
            fgcolor = '#000000'; 
			outline = '#FFFFFF';
            bgcolor = '#FFFFFF'; 
            texture = getTexture('none');
            desc = 'White';
            break;
        case 'radiant': 
            fgcolor = '#F9B333';
            bgcolor = '#FFFFFF';  
            texture = getTexture('paper');
            desc = 'Radiant';
            break;
        case 'fire': 
            //fgcolor = ['#000000','#000000','#000000','#ffffff','#ffffff'];
            fgcolor = '#f8d84f';  
            bgcolor = ['#f8d84f','#f9b02d','#f43c04','#910200','#4c1009']; 
            texture = getTexture('fire');
            desc = 'Fire';
            break; 
        case 'ice': 
            fgcolor = '#60E9FF'; 
            bgcolor = ['#214fa3','#3c6ac1','#253f70','#0b56e2','#09317a']; 
            texture = getTexture('ice');
            desc = 'Ice';
            break; 
        case 'poison': 
            fgcolor = '#D6A8FF'; 
            bgcolor = ['#313866','#504099','#66409e','#934fc3','#c949fc']; 
            texture = getTexture('cloudy');
            desc = 'Poison';
            break; 
        case 'acid': 
            fgcolor = '#A9FF70';
            bgcolor = ['#a6ff00', '#83b625','#5ace04','#69f006','#b0f006','#93bc25']; 
            texture = getTexture('marble');
            desc = 'Acid';
            break; 
        case 'thunder': 
            fgcolor = '#FFC500'; 
            bgcolor = '#7D7D7D'; 
            texture = getTexture('cloudy');
            desc = 'Thunder';
            break; 
        case 'lightning': 
            fgcolor = '#FFC500';
            outline = '#7D7D7D';
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
            fgcolor = '#60E9FF';
            bgcolor = ['#87b8c4', '#77a6b2','#6b98a3','#5b8691','#4b757f']; 
            texture = getTexture('water');
            desc = 'Water';
            break; 
        case 'earth': 
            fgcolor = '#6C9943';
            bgcolor = ['#346804', '#184200','#527f22', '#3a1d04', '#56341a','#331c17','#5a352a','#302210']; 
            texture = getTexture('speckles');
            desc = 'Earth';
            break; 
        case 'force': 
            fgcolor = 'white';
            outline = '#570000';
            bgcolor = ['#FF97FF', '#FF68FF','#C651C6']; 
            texture = getTexture('stars');
            desc = 'Force';
            break;
        case 'psychic': 
            fgcolor = '#D6A8FF';
            bgcolor = ['#313866','#504099','#66409E','#934FC3','#C949FC','#313866'];  
            texture = getTexture('speckles');
            desc = 'Psychic';
            break;
        case 'necrotic': 
            fgcolor = '#ffffff'; 
            bgcolor = '#6F0000'; 
            texture = getTexture('skulls');
            desc = 'Necrotic';
            break;
        case 'test': 
            fgcolor = ['#00FF00','#0000FF','#FF0000']; 
            bgcolor = ['#FF0000','#00FF00','#0000FF']; 
            texture = getTexture('none');
            desc = 'Test';
            break; 
        case 'rainbow': 
            fgcolor = ['#FF5959','#FFA74F','#FFFF56','#59FF59','#2374FF','#00FFFF','#FF59FF'];
            bgcolor = ['#900000','#CE3900','#BCBC00','#00B500','#00008E','#008282','#A500A5']; 
            texture = getTexture('none');
            desc = 'Rainblow';
            break; 
        case 'random': 
            fgcolor = [];
            bgcolor = [];
            outline = [];
            texture = getTexture('random');

            for (var i = 0; i < 6; i++) {
                var randcolor = randomColor();

                if (texture.name != '') {
                	fgcolor.push(randcolor.foreground); 
                	outline.push(randcolor.background);
                	bgcolor.push(randcolor.background);
                } else {
                	fgcolor.push(randcolor.foreground); 
                	outline.push('black');
                	bgcolor.push(randcolor.background);
                }
            } 

            desc = 'RaNdOm';
            break;
        case 'breebaby': 
            fgcolor = ['#5E175E', '#564A5E','#45455E','#3D5A5E','#1E595E','#5E3F3D','#5E1E29','#283C5E','#25295E'];
            outline = 'white';
            bgcolor = ['#FE89CF', '#DFD4F2','#C2C2E8','#CCE7FA','#A1D9FC','#F3C3C2','#EB8993','#8EA1D2','#7477AD'];  
            texture = getTexture('marble');
            desc = 'Pastel Sunset, for Breyanna';
            break;
        case 'pinkdreams': 
            fgcolor = 'white';
            outline = '#570000';
            bgcolor = ['#ff007c', '#df73ff','#f400a1','#df00ff','#ff33cc'];  
            texture = getTexture('marble');
            desc = 'Pink Dreams, for Ethan';
            break;
        case 'inspired': 
            fgcolor = '#FFD800';
            outline = '#8E8E86';
            bgcolor = '#C4C4B6';  
            texture = getTexture('none');
            desc = 'Inspired, for Austin';
            break;
        case 'bloodmoon': 
            fgcolor = '#CDB800';
            bgcolor = '#6F0000';  
            texture = getTexture('marble');
            desc = 'Blood Moon, for Jared';
            break;
        case 'starynight': 
            fgcolor = '#4F708F';
            outline = 'white';
            bgcolor = ['#091636','#233660','#4F708F','#8597AD','#E2E2E2'];
            texture = getTexture('speckles');
            desc = 'Stary Night, for Mai';
            break;
        case 'glitterparty': 
            fgcolor = 'white';
            outline = 'none';
            bgcolor = ['#FFB5F5','#7FC9FF','#A17FFF'];
            texture = getTexture('glitter');
            desc = 'Glitter Party, for Austin';
            break;
        case 'astralsea': 
            fgcolor = '#565656';
            outline = 'none';
            bgcolor = 'white';
            texture = getTexture('astral');
            desc = 'The Astral Sea, for Austin';
            break;
        case 'leopard': 
            fgcolor = '#ffffff';
            bgcolor = '#FFCC40';  
            texture = getTexture('leopard');
            desc = 'Leopard Print';
            break;
        case 'covid': 
            var colors = getColorSet('acid');
            fgcolor = colors.foreground;
            bgcolor = colors.background;  
            texture = getTexture('fire');
            desc = 'Covid-19';
            break;
        case 'acleaf': 
            fgcolor = '#00FF00'; 
            bgcolor = '#07540A'; 
            texture = getTexture('acleaf');
            desc = 'Animal Crossing Leaf';
            break;
        case 'isabelle': 
            fgcolor = 'black';
            fgcolor = 'white';
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
        case 'black': default: 
            fgcolor = '#ffffff'; 
            bgcolor = '#000000'; 
            texture = getTexture('none');
            desc = 'Default Black';
            if (colorsetname.toLowerCase() != 'black') colorsetname = '';
            break;
    }

    var colors = {name: colorsetname.toLowerCase(), foreground: fgcolor, background: bgcolor, outline: outline, texture: texture, description: desc};
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

    var urlargs = [];
    var colordata = getColorSet(colorset);
    var texturedata = getTexture(texture);

    if (colorset && colorset.length > 0) {
    	$t.dice.materials_cache = {};
    	$t.dice.cache_hits = 0;
    	$t.dice.cache_misses = 0;

        $t.dice.label_color = colordata.foreground;
        $t.dice.label_outline = colordata.outline;
        $t.dice.dice_color = colordata.background;
        $t.dice.dice_texture = colordata.texture.texture;

        if (texture == null) {
            texture = colordata.texture.name;
            texturedata = getTexture(texture);
        }

        urlargs.push('colorset='+colordata.name);

	    if (update) {
		    $t.selectByValue($t.id('color'), colorset);
	    }
    }

    if (texture || texture == '') {
        $t.dice.dice_texture = texturedata.texture;

        urlargs.push('texture='+texturedata.name);

        if (update) {
		    $t.selectByValue($t.id('texture'), texturedata.name);
	    }
    }

    if (update && urlargs.length > 0) {

        var urltext = 'Dice Theme: <a href="?'+urlargs.join('&')+'">'+colordata.description+'</a>';

        $t.empty($t.id('colorname'));
        $t.id('colorname').innerHTML = urltext;
    }
}