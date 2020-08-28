"use strict";
import {Teal} from './Teal.js';

export const TEXTURELIST = {
	'cloudy': {
		name: 'Clouds (Transparent)',
		composite: 'destination-in',
		source: './textures/cloudy.png',
		bump: './textures/cloudy.alt.png'
	},
	'cloudy_2': {
		name: 'Clouds',
		composite: 'multiply',
		source: './textures/cloudy.alt.png',
		bump: './textures/cloudy.alt.png'
	},
	'fire': {
		name: 'Fire',
		composite: 'multiply',
		source: './textures/fire.png',
		bump: './textures/fire.png',
		material: 'metal'
	},
	'marble': {
		name: 'Marble',
		composite: 'multiply',
		source: './textures/marble.png',
		bump: '',
		material: 'glass'
	},
	'water': {
		name: 'Water',
		composite: 'destination-in',
		source: './textures/water.png',
		bump: './textures/water.png',
		material: 'glass'
	},
	'ice': {
		name: 'Ice',
		composite: 'destination-in',
		source: './textures/ice.png',
		bump: './textures/ice.png',
		material: 'glass'
	},
	'paper': {
		name: 'Paper',
		composite: 'multiply',
		source: './textures/paper.png',
		bump: './textures/paper-bump.png',
		material: 'wood'
	},
	'speckles': {
		name: 'Speckles',
		composite: 'multiply',
		source: './textures/speckles.png',
		bump: './textures/speckles.png',
		material: 'none'
	},
	'glitter': {
		name: 'Glitter',
		composite: 'multiply',
		source: './textures/glitter.png',
		bump: './textures/glitter-bump.png',
		material: 'none'
	},
	'glitter_2': {
		name: 'Glitter (Transparent)',
		composite: 'destination-in',
		source: './textures/glitter-alpha.png',
		bump: '',
		material: 'none'
	},
	'stars': {
		name: 'Stars',
		composite: 'multiply',
		source: './textures/stars.png',
		bump: './textures/stars.png',
		material: 'none'
	},
	'stainedglass': {
		name: 'Stained Glass',
		composite: 'multiply',
		source: './textures/stainedglass.png',
		bump: './textures/stainedglass-bump.png',
		material: 'glass'
	},
	'wood': {
		name: 'Wood',
		composite: 'multiply',
		source: './textures/wood.png',
		bump: './textures/wood.png',
		material: 'wood'
	},
	'metal': {
		name: 'Stainless Steel',
		composite: 'multiply',
		source: './textures/metal.png',
		bump: './textures/metal-bump.png',
		material: 'metal'
	},
	'skulls': {
		name: 'Skulls',
		composite: 'multiply',
		source: './textures/skulls.png',
		bump: './textures/skulls.png'
	},
	'leopard': {
		name: 'Leopard',
		composite: 'multiply',
		source: './textures/leopard.png',
		bump: './textures/leopard.png',
		material: 'wood'
	},
	'tiger': {
		name: 'Tiger',
		composite: 'multiply',
		source: './textures/tiger.png',
		bump: './textures/tiger.png',
		material: 'wood'
	},
	'cheetah': {
		name: 'Cheetah',
		composite: 'multiply',
		source: './textures/cheetah.png',
		bump: './textures/cheetah.png',
		material: 'wood'
	},
	'dragon': {
		name: 'Dragon',
		composite: 'multiply',
		source: './textures/dragon.png',
		bump: './textures/dragon-bump.png',
		material: 'none'
	},
	'lizard': {
		name: 'Lizard',
		composite: 'multiply',
		source: './textures/lizard.png',
		bump: './textures/lizard.png',
		material: 'none'
	},
	'bird': {
		name: 'Bird',
		composite: 'multiply',
		source: './textures/feather.png',
		bump: './textures/feather-bump.png',
		material: 'wood'
	},
	'astral': {
		name: 'Astral Sea',
		composite: 'multiply',
		source: './textures/astral.png',
		bump: './textures/stars.png',
		material: 'none'
	},
	'acleaf': {
		name: 'AC Leaf',
		composite: 'multiply',
		source: './textures/acleaf.png',
		bump: './textures/acleaf.png',
		material: 'none'
	},
	'thecage': {
		name: 'Nicholas Cage',
		composite: 'multiply',
		source: './textures/thecage.png',
		bump: '',
		material: 'metal'
	},
	'isabelle': {
		name: 'Isabelle',
		composite: 'source-over',
		source: './textures/isabelle.png',
		bump: '',
		material: 'none'
	},
	'bronze01': {
		name: 'bronze01',
		composite: 'difference',
		source: './textures/bronze/01.png',
		bump: '',
		material: 'metal'
	},
	'bronze02': {
		name: 'bronze02',
		composite: 'difference',
		source: './textures/bronze/02.png',
		bump: '',
		material: 'metal'
	},
	'bronze03': {
		name: 'bronze03',
		composite: 'difference',
		source: './textures/bronze/03.png',
		bump: '',
		material: 'metal'
	},
	'bronze03a': {
		name: 'bronze03a',
		composite: 'difference',
		source: './textures/bronze/03a.png',
		bump: '',
		material: 'metal'
	},
	'bronze03b': {
		name: 'bronze03b',
		composite: 'difference',
		source: './textures/bronze/03b.png',
		bump: '',
		material: 'metal'
	},
	'bronze04': {
		name: 'bronze04',
		composite: 'difference',
		source: './textures/bronze/04.png',
		bump: '',
		material: 'metal'
	},
	'none': {
		name: 'None',
		composite: 'source-over',
		source: '',
		bump: '',
		material: ''
	},
	'': {
		name: '~ Preset ~',
		composite: 'source-over',
		source: '',
		bump: '',
		material: ''
	}
};

export const THEMES = {
	'default': {
		name: 'Solid Color',
		author: 'MajorVictory',
		showColorPicker: true,
		surface: 'wood_tray',
		colors: {fg: '#9794ff', bg: '#0b1a3e'},
		cubeMap: ['envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg']
	},
	'blue-felt': {
		name: 'Blue Felt',
		author: 'MajorVictory',
		showColorPicker: true,
		surface: 'felt',
		colors: {fg: '#9794ff', bg: '#0b1a3e'},
		// ['', '', 'top', 'bottom', '', ''] -- looking down/camera view
		cubeMap: ['envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg']
	},
	'red-felt': {
		name: 'Red Felt',
		author: 'MajorVictory',
		showColorPicker: true,
		surface: 'felt',
		colors: {fg: '#ff9494', bg: '#4d1e1e'},
		cubeMap: ['envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg']
	},
	'green-felt': {
		name: 'Green Felt',
		author: 'MajorVictory',
		showColorPicker: true,
		surface: 'felt',
		colors: {fg: '#97ff94', bg: '#244d1e'},
		// ['', '', 'top', 'bottom', '', ''] -- looking down/camera view
		cubeMap: ['envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg','envmap.jpg']
	},
	'taverntable': {
		name: 'Old Tavern Table',
		author: 'MajorVictory',
		showColorPicker: true,
		surface: 'wood_table',
		colors: {fg: '#9794ff', bg: '#0b1a3e'},
		cubeMap: ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']
	},
	'mahogany': {
		name: '(Mah-Hog-Any)',
		author: 'MajorVictory',
		showColorPicker: true,
		surface: 'wood_table',
		colors: {fg: '#9794ff', bg: '#0b1a3e'},
		cubeMap: ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']
	},
	'stainless': {
		name: 'Stainless Steel',
		author: 'MajorVictory',
		showColorPicker: true,
		surface: 'metal',
		colors: {fg: '#9794ff', bg: '#0b1a3e'},
		cubeMap: ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']
	},
	'cyberpunk': {
		name: 'Neo-New-Future-City',
		author: 'MajorVictory',
		showColorPicker: true,
		surface: 'metal',
		colors: {fg: '#3494A6', bg: '#440B28'},
		cubeMap: ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']
	},
	'cagetown': {
		name: 'Cage Town',
		author: 'MajorVictory',
		showColorPicker: true,
		surface: 'wood_table',
		colors: {fg: '#D7A866', bg: '#282811'},
		cubeMap: ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']
	}
};

export const COLORSETS = {
	'coin_default': {
		name: 'Gold Coin',
		description: 'Gold Dragonhead Coin',
		category: 'Other',
		foreground: '#f6c928',
		background: '#f6c928',
		outline: 'none',
		texture: 'metal'
	},
	'coin_silver': {
		name: 'Silver Coin',
		description: 'Gold Dragonhead Coin',
		category: 'Other',
		foreground: '#f6c928',
		background: '#f6c928',
		outline: 'none',
		texture: 'metal'
	},
	'radiant': {
		name: 'Radiant',
		category: 'Damage Types',
		foreground: '#F9B333',
		background: '#FFFFFF',
		outline: '',
		texture: 'paper',
		description: 'Radiant'
	},
	'fire': {
		name: 'Fire',
		category: 'Damage Types',
		foreground: '#f8d84f',
		background: ['#f8d84f','#f9b02d','#f43c04','#910200','#4c1009'],
		outline: 'black',
		texture: 'fire',
		description: 'Fire'
	},
	'ice': {
		name: 'Ice',
		category: 'Damage Types',
		foreground: '#60E9FF',
		background: ['#214fa3','#3c6ac1','#253f70','#0b56e2','#09317a'],
		outline: 'black',
		texture: 'ice',
		description: 'Ice'
	},
	'poison': {
		name: 'Poison',
		category: 'Damage Types',
		foreground: '#D6A8FF',
		background: ['#313866','#504099','#66409e','#934fc3','#c949fc'],
		outline: 'black',
		texture: 'cloudy',
		description: 'Poison'
	},
	'acid': {
		name: 'Acid',
		category: 'Damage Types',
		foreground: '#A9FF70',
		background: ['#a6ff00', '#83b625','#5ace04','#69f006','#b0f006','#93bc25'],
		outline: 'black',
		texture: 'marble',
		description: 'Acid'
	},
	'thunder': {
		name: 'Thunder',
		category: 'Damage Types',
		foreground: '#FFC500',
		background: '#7D7D7D',
		outline: 'black',
		texture: 'cloudy',
		description: 'Thunder'
	},
	'lightning': {
		name: 'Lightning',
		category: 'Damage Types',
		foreground: '#FFC500',
		background: ['#f17105', '#f3ca40','#eddea4','#df9a57','#dea54b'],
		outline: '#7D7D7D',
		texture: 'ice',
		description: 'Lightning'
	},
	'air': {
		name: 'Air',
		category: 'Damage Types',
		foreground: '#ffffff',
		background: ['#d0e5ea', '#c3dee5','#a4ccd6','#8dafb7','#80a4ad'],
		outline: 'black',
		texture: 'cloudy',
		description: 'Air'
	},
	'water': {
		name: 'Water',
		category: 'Damage Types',
		foreground: '#60E9FF',
		background: ['#87b8c4', '#77a6b2','#6b98a3','#5b8691','#4b757f'],
		outline: 'black',
		texture: 'water',
		description: 'Water'
	},
	'earth': {
		name: 'Earth',
		category: 'Damage Types',
		foreground: '#6C9943',
		background: ['#346804', '#184200','#527f22', '#3a1d04', '#56341a','#331c17','#5a352a','#302210'],
		outline: 'black',
		texture: 'speckles',
		description: 'Earth'
	},
	'force': {
		name: 'Force',
		category: 'Damage Types',
		foreground: 'white',
		background: ['#FF97FF', '#FF68FF','#C651C6'],
		outline: '#570000',
		texture: 'stars',
		description: 'Force'
	},
	'psychic': {
		name: 'Psychic',
		category: 'Damage Types',
		foreground: '#D6A8FF',
		background: ['#313866','#504099','#66409E','#934FC3','#C949FC','#313866'],
		outline: 'black',
		texture: 'speckles',
		description: 'Psychic'
	},
	'necrotic': {
		name: 'Necrotic',
		category: 'Damage Types',
		foreground: '#ffffff',
		background: '#6F0000',
		outline: 'black',
		texture: 'skulls',
		description: 'Necrotic'
	},
	'breebaby': {
		name: 'Pastel Sunset',
		category: 'Custom Sets',
		foreground: ['#5E175E', '#564A5E','#45455E','#3D5A5E','#1E595E','#5E3F3D','#5E1E29','#283C5E','#25295E'],
		background: ['#FE89CF', '#DFD4F2','#C2C2E8','#CCE7FA','#A1D9FC','#F3C3C2','#EB8993','#8EA1D2','#7477AD'],
		outline: 'white',
		texture: 'marble',
		description: 'Pastel Sunset, for Breyanna'
	},
	'pinkdreams': {
		name: 'Pink Dreams',
		category: 'Custom Sets',
		foreground: 'white',
		background: ['#ff007c', '#df73ff','#f400a1','#df00ff','#ff33cc'],
		outline: '#570000',
		texture: 'skulls',
		description: 'Pink Dreams, for Ethan'
	},
	'inspired': {
		name: 'Inspired',
		category: 'Custom Sets',
		foreground: '#FFD800',
		background: '#C4C4B6',
		outline: '#8E8E86',
		texture: 'none',
		description: 'Inspired, for Austin'
	},
	'bloodmoon': {
		name: 'Blood Moon',
		category: 'Custom Sets',
		foreground: '#CDB800',
		background: '#6F0000',
		outline: 'black',
		texture: 'marble',
		description: 'Blood Moon, for Jared'
	},
	'starynight': {
		name: 'Stary Night',
		category: 'Custom Sets',
		foreground: '#4F708F',
		background: ['#091636','#233660','#4F708F','#8597AD','#E2E2E2'],
		outline: 'white',
		texture: 'speckles',
		description: 'Stary Night, for Mai'
	},
	'glitterparty': {
		name: 'Glitter Party',
		category: 'Custom Sets',
		foreground: 'white',
		background: ['#FFB5F5','#7FC9FF','#A17FFF'],
		outline: 'none',
		texture: 'glitter',
		description: 'Glitter Party, for Austin'
	},
	'astralsea': {
		name: 'Astral Sea',
		category: 'Custom Sets',
		foreground: '#565656',
		background: 'white',
		outline: 'none',
		texture: 'astral',
		description: 'The Astral Sea, for Austin'
	},
	'bronze': {
		name: 'Thylean Bronze',
		description: 'Thylean Bronze by @SpencerThayer',
		category: 'Custom Sets',
		foreground: ['#FF9159','#FFB066','#FFBF59','#FFD059'],
		background: ['#705206','#7A4E06','#643100','#7A2D06'],
		outline: ['#3D2D03','#472D04','#301700','#471A04'],
		edge: ['#FF5D0D','#FF7B00','#FFA20D','#FFBA0D'],
		texture: ['bronze01','bronze02','bronze03','bronze03a','bronze03b','bronze04']
	},
	'dragons': {
		name: 'Here be Dragons',
		category: 'Custom Sets',
		foreground: '#FFFFFF',
		// 			[ red,       black,     blue,      green      white      gold,      silver,    bronze,    copper     brass
		background: ['#B80000', '#4D5A5A', '#5BB8FF', '#7E934E', '#FFFFFF', '#F6ED7C', '#7797A3', '#A78437', '#862C1A', '#FFDF8A'],
		outline: 'black',
		texture: ['dragon', 'lizard'],
		description: 'Here be Dragons'
	},
	'birdup': {
		name: 'Bird Up',
		category: 'Custom Sets',
		foreground: '#FFFFFF',
		background: ['#F11602', '#FFC000', '#6EC832', '#0094BC', '#05608D', '#FEABB3', '#F75680', '#F3F0DF', '#C7A57F'],
		outline: 'black',
		texture: 'bird',
		description: 'Bird Up!'
	},
	'tigerking': {
		name: 'Tiger King',
		category: 'Other',
		foreground: '#ffffff',
		background: '#FFCC40',
		outline: 'black',
		texture: ['leopard', 'tiger', 'cheetah'],
		description: 'Leopard Print'
	},
	'covid': {
		name: 'COViD',
		category: 'Other',
		foreground: '#A9FF70',
		background: ['#a6ff00', '#83b625','#5ace04','#69f006','#b0f006','#93bc25'],
		outline: 'black',
		texture: 'fire',
		description: 'Covid-19'
	},
	'acleaf': {
		name: 'Animal Crossing',
		category: 'Other',
		foreground: '#00FF00',
		background: '#07540A',
		outline: 'black',
		texture: 'acleaf',
		description: 'Animal Crossing Leaf'
	},
	'isabelle': {
		name: 'Isabelle',
		category: 'Other',
		foreground: 'white',
		background: '#FEE5CC',
		outline: 'black',
		texture: 'isabelle',
		description: 'Isabelle'
	},
	'thecage': {
		name: 'Nicholas Cage',
		category: 'Other',
		foreground: '#ffffff',
		background: '#ffffff',
		outline: 'black',
		texture: 'thecage',
		description: 'Nicholas Cage'
	},
	'test': {
		name: 'Test',
		category: 'Colors',
		foreground: ['#00FF00','#0000FF','#FF0000'],
		background: ['#FF0000','#00FF00','#0000FF'],
		outline: 'black',
		texture: 'none',
		description: 'Test'
	},
	'rainbow': {
		name: 'Rainblow',
		category: 'Colors',
		foreground: ['#FF5959','#FFA74F','#FFFF56','#59FF59','#2374FF','#00FFFF','#FF59FF'],
		background: ['#900000','#CE3900','#BCBC00','#00B500','#00008E','#008282','#A500A5'],
		outline: 'black',
		texture: 'none',
		description: 'Rainblow'
	},
	'random': {
		name: 'RaNdOm',
		category: 'Colors',
		foreground: [],
		outline: [],
		background: [],
		texture: [],
		description: 'RaNdOm'
	},
	'black': {
		name: 'Black',
		category: 'Colors',
		foreground: '#ffffff',
		background: '#000000',
		outline: 'black',
		texture: 'none',
		description: 'Black',
	},
	'white': {
		name: 'White',
		category: 'Colors',
		foreground: '#000000',
		background: '#FFFFFF',
		outline: '#FFFFFF',
		texture: 'none',
		description: 'White'
	},


	'swrpg_abi': {
		name: 'Star Wars RPG - Ability',
		category: 'Star Wars™ RPG',
		foreground: '#00FF00',
		background: ['#3D9238','#52B848','#5EAC56','#9ECB9A'],
		outline: '#000000',
		texture: 'cloudy_2',
		description: 'Star Wars™ RPG Ability Dice'
	},
	'swrpg_pro': {
		name: 'Star Wars RPG - Proficiency',
		category: 'Star Wars™ RPG',
		foreground: '#FFFF00',
		background: ['#CABB1C','#F9E33B','#FFE900','#F0E49D'],
		outline: '#000000',
		texture: 'paper',
		description: 'Star Wars™ RPG Proficiency Dice'
	},
	'swrpg_dif': {
		name: 'Star Wars RPG - Difficulty',
		category: 'Star Wars™ RPG',
		foreground: '#8000FC',
		background: ['#39165F','#664B84','#50247E','#745F88'],
		outline: '#000000',
		texture: 'cloudy_2',
		description: 'Star Wars™ RPG Difficulty Dice'
	},
	'swrpg_cha': {
		name: 'Star Wars RPG - Challenge',
		category: 'Star Wars™ RPG',
		foreground: '#FF0000',
		background: ['#A91F32','#EB4254','#E51836','#BA3645'],
		outline: '#000000',
		texture: 'paper',
		description: 'Star Wars™ RPG Challenge Dice'
	},
	'swrpg_boo': {
		name: 'Star Wars RPG - Boost',
		category: 'Star Wars™ RPG',
		foreground: '#00FFFF',
		background: ['#4B9DC6','#689FC4','#85CFF2','#8FC0D8'],
		outline: '#000000',
		texture: 'glitter',
		description: 'Star Wars™ RPG Boost Dice'
	},
	'swrpg_set': {
		name: 'Star Wars RPG - Setback',
		category: 'Star Wars™ RPG',
		foreground: '#111111',
		background: ['#252223','#241F21','#282828','#111111'],
		outline: '#ffffff',
		texture: 'glitter',
		description: 'Star Wars™ RPG Setback Dice'
	},
	'swrpg_for': {
		name: 'Star Wars RPG - Force',
		category: 'Star Wars™ RPG',
		foreground: '#000000',
		background: ['#F3F3F3','#D3D3D3','#BABABA','#FFFFFF'],
		outline: '#FFFFFF',
		texture: 'stars',
		description: 'Star Wars™ RPG Force Dice'
	},


	'swa_red': {
		name: 'Armada Attack - Red',
		category: 'Star Wars™ Armada',
		foreground: '#ffffff',
		background: ['#440D19','#8A1425','#C72336','#C04551'],
		outline: 'none',
		texture: 'stainedglass',
		description: 'Star Wars™ Armada Red Attack Dice'
	},
	'swa_blue': {
		name: 'Armada Attack - Blue',
		category: 'Star Wars™ Armada',
		foreground: '#ffffff',
		background: ['#212642','#28286E','#2B348C','#3D4BB5','#5D64AB'],
		outline: 'none',
		texture: 'stainedglass',
		description: 'Star Wars™ Armada Blue Attack Dice'
	},
	'swa_black': {
		name: 'Armada Attack - Black',
		category: 'Star Wars™ Armada',
		foreground: '#ffffff',
		background: ['#252223','#241F21','#282828','#111111'],
		outline: 'none',
		texture: 'stainedglass',
		description: 'Star Wars™ Armada Black Attack Dice'
	},


	'xwing_red': {
		name: 'X-Wing Attack - Red',
		category: 'Star Wars™ X-Wing',
		foreground: '#ffffff',
		background: ['#440D19','#8A1425','#C72336','#C04551'],
		outline: 'none',
		texture: 'stars',
		description: 'Star Wars™ X-Wing Red Attack Dice'
	},
	'xwing_green': {
		name: 'X-Wing Attack - Green',
		category: 'Star Wars™ X-Wing',
		foreground: '#ffffff',
		background: ['#3D9238','#52B848','#5EAC56','#9ECB9A'],
		outline: 'none',
		texture: 'stars',
		description: 'Star Wars™ X-Wing Green Attack Dice'
	},


	'swl_atkred': {
		name: 'Legion Attack - Red',
		category: 'Star Wars™ Legion',
		foreground: '#ffffff',
		background: ['#440D19','#8A1425','#C72336','#C04551'],
		outline: 'none',
		texture: 'fire',
		description: 'Star Wars™ Legion Red Attack Dice'
	},
	'swl_atkblack': {
		name: 'Legion Attack - Black',
		category: 'Star Wars™ Legion',
		foreground: '#ffffff',
		background: ['#252223','#241F21','#282828','#111111'],
		outline: 'none',
		texture: 'fire',
		description: 'Star Wars™ Legion Black Attack Dice'
	},
	'swl_atkwhite': {
		name: 'Legion Attack - White',
		category: 'Star Wars™ Legion',
		foreground: '#000000',
		background: ['#ffffff','#DFF4FA','#BCBCBC','#F1EDE2','#F2ECE0'],
		outline: 'none',
		texture: 'fire',
		description: 'Star Wars™ Legion White Attack Dice'
	},
	'swl_defred': {
		name: 'Legion Defense - Red',
		category: 'Star Wars™ Legion',
		foreground: '#ffffff',
		background: ['#440D19','#8A1425','#C72336','#C04551'],
		outline: 'none',
		texture: 'fire',
		description: 'Star Wars™ Legion Red Defense Dice'
	},
	'swl_defwhite': {
		name: 'Legion Defense - White',
		category: 'Star Wars™ Legion',
		foreground: '#000000',
		background: ['#ffffff','#DFF4FA','#BCBCBC','#F1EDE2','#F2ECE0'],
		outline: 'none',
		texture: 'fire',
		description: 'Star Wars™ Legion White Defense Dice'
	}

};

export const COLORCATEGORIES = [
	'Custom Sets',
	'Damage Types',
	'Colors',
	'Other',
	'Star Wars™ RPG',
	'Star Wars™ Armada',
	'Star Wars™ X-Wing',
	'Star Wars™ Legion',
];

export class DiceColors {

	constructor() {
		this.textures = {};
		this.bumpmaps = {};
	}

	ImageLoader(sources, callback) {
		let images = {};
		let bumpmaps = {};
		let loadedImages = 0;
		let numImages = 0;

		let itemprops = Object.entries(sources);
		for (const [key, value] of itemprops) {
			if(value.source != '') {
				++numImages;
			}
			if(value.bump != '') {
				++numImages;
			}
		}


		for (const [key, value] of itemprops) {
	
			if(value.source == '' && value.bump == '') {
				continue;
			}

			let imagentry = {
				texture: '',
				bump: ''
			};

			if (value.source && value.source != '') {
	
				imagentry.texture = new Image();
				imagentry.texture.onload = function() {
		
					if (++loadedImages >= numImages) {
						callback(images);
					}
				};
				imagentry.texture.src = value.source;
			}

			if (value.bump && value.bump != '') {
	
				imagentry.bump = new Image();
				imagentry.bump.onload = function() {
		
					if (++loadedImages >= numImages) {
						callback(images);
					}
				};
				imagentry.bump.src = value.bump;
			}

			images[key] = imagentry;
		}
	}
		
	randomColor() {
		// random colors
		let rgb=[];
		rgb[0] = Math.floor(Math.random() * 254);
		rgb[1] = Math.floor(Math.random() * 254);
		rgb[2] = Math.floor(Math.random() * 254);

		// this is an attempt to make the foregroudn color stand out from the background color
		// it sometimes produces ok results
		let brightness = ((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) +  (parseInt(rgb[2]) * 114)) / 1000;
		let foreground = (brightness > 126) ? 'rgb(30,30,30)' : 'rgb(230,230,230)'; // high brightness = dark text, else bright text
		let background = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';

		return {background: background, foreground: foreground };
	}

	getColorSet(colorsetname) {
		let colorset = COLORSETS[colorsetname] || COLORSETS['random'];
		return colorset;
	}
	
	getTexture(texturename) {

	    if (Array.isArray(texturename)) {

	        let textures = [];
	        for(let i = 0, l = texturename.length; i < l; i++){
	            if (typeof texturename[i] == 'string') {
	                textures.push(this.getTexture(texturename[i]));
	            } else if (typeof texturename[i].name == 'string') {
	                textures.push(this.getTexture(texturename[i].name));
	            }
	        }
	        return textures;
	    }

	    if (!texturename || texturename == '') {
	        return {name:'',texture:'',composite:'',bump:'',data:{}};
	    }

	    if (texturename == 'none') {
	        return {name:'none',texture:'',composite:'',bump:'',data:{}};
	    }

	    if(texturename == 'random') {
	        let names = Object.keys(this.textures);
	        // add 'none' for possibility of no texture
	        names.pop(); //remove 'random' from this list

	        return this.getTexture(names[Math.floor(Math.random() * names.length)]);
	    }

	    if (this.textures[texturename] != null) {
	        return {
	        	name: texturename,
	        	texture: this.textures[texturename].texture,
	        	composite: TEXTURELIST[texturename].composite,
	        	bump: this.textures[texturename].bump || '',
	        	data: TEXTURELIST[texturename]
	        };
	    }
	    return {name:'',texture:'',composite:'',bump:'',data:{}};
	}

	initColorSets() {

		let sets = Object.entries(COLORSETS);
		for (const [name, data] of sets) {
			COLORSETS[name].id = name;
				COLORSETS[name].texture = this.getTexture(data.texture);
		}

		// generate the colors and textures for the random set
		for (let i = 0; i < 10; i++) {
				let randcolor = this.randomColor();
				let randtex = this.getTexture('random');

			if (randtex.name != '') {
				COLORSETS['random'].foreground.push(randcolor.foreground); 
				COLORSETS['random'].background.push(randcolor.background);
				COLORSETS['random'].outline.push(randcolor.background);
				COLORSETS['random'].texture.push(randtex);
			} else {
				COLORSETS['random'].foreground.push(randcolor.foreground); 
				COLORSETS['random'].background.push(randcolor.background);
				COLORSETS['random'].outline.push('black');
				COLORSETS['random'].texture.push('');
			}
		}
	}

	applyColorSet(colorsetid, texture = '', material = '', update = true) {

		var urlargs = [];
		var colordata = this.getColorSet(colorsetid);

		if (colorsetid && colorsetid.length > 0) {
			DiceRoller.DiceFactory.applyColorSet(colordata);


			if (texture == '' && !Array.isArray(colordata.texture)) {
				texture = colordata.texture.name;

				if (material == '' && !Array.isArray(colordata.texture.data)) {
					material = colordata.texture.data.material || '';
				}
			}

		}

		if (texture != '') DiceRoller.DiceFactory.applyTexture(this.getTexture(texture));
		if (material != '') DiceRoller.DiceFactory.applyMaterial(material);

		if (update) {
			Teal.selectByValue(Teal.id('color'), colorsetid);
			if (texture != '') Teal.selectByValue(Teal.id('texture'), texture);
			if (material != '') Teal.selectByValue(Teal.id('material'), material);

			urlargs.push('colorset='+colorsetid);
			if (texture != '') urlargs.push('texture='+texture);
			if (material != '') urlargs.push('material='+material);

			DiceRoller.DiceFavorites.settings.colorset.value = colorsetid;
			DiceRoller.DiceFavorites.settings.texture.value = (texture || '');
			DiceRoller.DiceFavorites.settings.material.value = (material || '');
		}

		if (update && urlargs.length > 0) {
			Teal.empty(Teal.id('colorname'));
			Teal.id('colorname').innerHTML = 'Theme: '+colordata.description+' - <a href="?'+urlargs.join('&')+'">🔗</a>';
			DiceRoller.DiceFavorites.storeSettings();
		}
	}
}