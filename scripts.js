var elementsDisplay = [];
var upgradesDisplay = [];

// var upgradesAvailable = 0;

var windowLoaded = false;
var clearAll = false; 

//Names: Gold Miner, TestWorker2, TestWorker3, TestWorker4
/*Upgrade Names:  
	GoldMiner: Reinforced Picks (Profit 1.5x)
	Lumberjacks: Reinforced Lumber Axes (Profit 1.5x)
	Stonecutter: Reinforced Chisels (Profit 1.5x)
	IronMiner: Reinforced Picks (Profit 1.5x) 
	Blacksmiths:	Chef: 							
*/

var resources  = ['Gold', 'Wood', 'Stone', 'Metal', 'Crop'];
var SetRate = [0, 0, 0, 0, 0];
var GetRate = [0, 0, 0, 0, 0];
var resAmounts = [10000, 10000, 10000, 10000, 5000];
var playerStats = [0, 0, 0, 0, 0]; //Strength, Luck, ???, ???, ???
var updateRates = [null, null, null, null, null];

// var settings = [false, //Butt Replace
// 				false, 
// 				false,
// 				false,
// 				false];


var buyAmount = 1;
var maxBuy = false;

var razMiddleName = "";

// Cost scales: 5, 10, 15, 20

document.addEventListener("keydown", function keyBuyAmount(event) {
  console.log(event.which);

  switch(event.which) {
  	case 16: {	//shift
	  	buyAmount = 10;
	  	max = false;
	  	break;
  	}	

  	case 18: {	//option
	  	buyAmount = 100;
	  	max = false;
	  	break;
	}

  	case 91: { //command
	  	max = true;
	  	break;
 	}

  	default:
	  	buyAmount = 1;
	  	max = false;
  }

  update();
});

document.addEventListener("keyup", function resetBuyAmount() {
  buyAmount = 1;
  max = false;

  update();
});

function subtractPrice(cost) {
	let canBuy = true;
	let missing = " ";
	for(let i=0; i < cost.length; i++) {
		if(resAmounts[i] < cost[i]) {
			canBuy = false;
			missing = missing + resources[i] + ", ";
		}
	}
	if(canBuy) {
		for(let i = 0; i < cost.length; i++) {
			resAmounts[i] -= cost[i];
		}
	} else {
		missing = missing.substring(0, missing.length - 2);
		alert("You do not have enough" + missing);
	}
	return(canBuy);
}

class Unit {
	constructor(name, desc, goldC, woodC, stoneC, metalC, cropC) {
		this.name = name;
		this.desc = desc;
		this.cost = [goldC, woodC, stoneC, metalC, cropC];
		this.initialCost = [goldC, woodC, stoneC, metalC, cropC];
		this.quantity = 0;
		this.costScale = 1.05;
	}

	buy() {
		if(subtractPrice(this.cost)) {
			this.quantity+=buyAmount;
			update();
			this.sendData();
			workerUpdate();
			armyUpdate();
		}
	}

	sell() {
		if(this.quantity >= buyAmount) {
			this.quantity -= buyAmount;
			for(let i = 0; i < this.cost.length;i++) {
				resAmounts[i]+=Math.floor(this.cost[i]/2);
			}
			update();
			this.sendData();
			workerUpdate();
			armyUpdate();
		}
	}

	sendData() {
		var eName = document.getElementsByClassName(this.getName()+'Name');
		var eQuantity = document.getElementsByClassName(this.getName()+'Quantity');
		var c = [];

		for (let i = 0; i < this.cost.length; i++) {
			this.cost[i] = Math.round(this.initialCost[i] * Math.pow(this.costScale, this.quantity));
			c[i] = this.initialCost[i] * Math.pow(this.costScale, this.quantity);

			if(buyAmount >= 1)
			{
				for(let j = 0; j < buyAmount-1; j++)
				{
					this.cost[i] += c[i] * Math.pow(this.costScale, j);
				}

				this.cost[i] = Math.round(this.cost[i]);
			}
		}

		for (let i = 0; i < eName.length; i++) {
			eName[i].innerHTML = this.name;
		}

		for(let i = 0; i < eQuantity.length; i++) {
			eQuantity[i].innerHTML = this.quantity;
		}
		
		document.getElementById(this.getName()+'Buy').innerHTML = this.cost;
		document.getElementById(this.getName()+'Sell').innerHTML = Math.floor(this.getCost()[0]/2) + "," + Math.floor(this.getCost()[1]/2) + "," + Math.floor(this.getCost()[2]/2) + "," + Math.floor(this.getCost()[3]/2) + "," + Math.floor(this.getCost()[4]/2);
	}

	getCost() {return this.cost;}
	getDesc() {return this.desc;}
	getQuantity() {return this.quantity;}
	getName() {return this.name.replace(/\s/g, '');}
}

class Elem extends Unit {
	constructor(name, desc, goldC, woodC, stoneC, metalC, cropC, goldP, woodP,  stoneP, metalP, cropP) {
		super(name, desc, goldC, woodC, stoneC, metalC, cropC);

		this.produce  = [goldP, woodP, stoneP, metalP, cropP];

		this.upgrades = [];
		this.sendData();
	}
}

class ArmyUnit extends Unit {
	constructor(name, desc, goldC, woodC, stoneC, metalC, cropC, power) {
		super(name, desc, goldC, woodC, stoneC, metalC, cropC);
		
		this.power = power;
		this.costScale = 1.05;

		this.sendData();
	}
}

class Unlock {
	constructor(name, desc, subDesc, ref, trigger) { //Name, Description (splash), Sub Desc (informative), Reference (Affected Elemented), Trigger (Trigger Point), Unlocked (Bool)
		this.name = name;
		this.desc = desc;
		this.subDesc = subDesc;
		this.ref = ref;
		this.trigger = trigger;
		this.unlocked = false;
	}


	isUnlocked() {return this.name;}
	getFullName() {return this.name;}
	getName() {return this.name.replace(/\s/g, '');}
	getDesc() {return this.desc;}
	getSubDesc() {return this.subDesc}
}

class Upgrade extends Unlock {
	constructor(name, desc, subDesc, goldC, ref, trigger) {  //Scales
		super(name, desc, subDesc, ref, trigger); //Same

		this.goldC = goldC;
		this.unlocked = false;
	}

	buy() {
		if(this.getCost() <= resAmounts[0]) {
			this.unlocked = true;
 			resAmounts[0] -= this.goldC;
 			update();
		} else alert("You do not have enough gold to purchase this upgrade");
	}
	
	getID() {return this.id;}
	getCost() {return this.goldC;}
}

class ElemUpgrade extends Upgrade {
	constructor(name, desc, subDesc, goldC, ref, trigger, goldPScale, woodPScale, stonePScale, metalPScale, cropPScale) {
		super(name, desc, subDesc, goldC, ref, trigger);

		this.scales = [goldPScale, woodPScale, stonePScale, metalPScale, cropPScale];
	}
}

class ArmyUpgrade extends Upgrade {
	constructor(name, desc, subDesc, goldC, ref, trigger, scale) {
		super(name, desc, subDesc, goldC, ref, trigger);

		this.scale = scale;
	}
}

var elements = [new Elem('Gold Miner', 'temp', 10, 10, 10, 10, 5, 1, 0, 0, 0, -0.2), 
			 	new Elem('Lumberjack', 'temp',  50, 50, 50, 50, 25, 0, 1, 0, 0, -0.2), 
				new Elem('Stonecutter', 'temp',  100, 100, 100, 100, 50, 0, 0, 1, 0, -0.2), 
				new Elem('Iron Miner', 'temp', 200, 200, 200, 200, 100, 0, 0, 0, 1, -0.2),
				new Elem('Farmer', 'temp', 50, 200, 100, 5, 10, 0, 0, 0, 0, 1)];

var army 	 = [new ArmyUnit('Foot Soldier', 'temp', 10, 10, 10, 10, 5, 1),
				new ArmyUnit('Archer', 'temp', 50, 50, 50, 50, 25, 2),
				new ArmyUnit('Cannon', 'temp', 500, 500, 500, 500, 250, 10)];
				
let elemUpgrades = [
				//Gold Miners
				new ElemUpgrade('Reinforced Picks', "Your picks feel sturdier than ever!", "Gold Miners are 2x as efficient!", 100, 0, 5, 2, 1, 1, 1, 1),  //Price, Ref, Trigger, Multiplier
				new ElemUpgrade('Super Reinforced Picks', "Your picks feel super sturdy!", "Gold Miners are 2x as efficient!", 500, 0, 25, 2, 1, 1, 1, 1),
				new ElemUpgrade('Incredibly Reinforced Picks', "Your picks feel...incredibly sturdy!", "Gold Miners are 2x as efficient!", 5000, 0, 100, 2, 1, 1, 1, 1),
				new ElemUpgrade('Unfathomably Reinforced Picks', "The might of your picks is indescribable...", "Gold Miners are 2x as efficient!", 25000, 0, 250, 2, 1, 1, 1, 1),

				//Lumberjacks
				new ElemUpgrade('Sharpened Lumber Axes', "Your axes feel sharper than ever!", "Lumberjacks are 2x as efficient!", 100, 1, 5, 1, 2, 1, 1, 1), 
				new ElemUpgrade('Super Sharp Lumber Axes', "Your axes feel super sharp!", "Lumberjacks are 2x as efficient!", 500, 1, 25, 1, 2, 1, 1, 1),
				new ElemUpgrade('Incredibly Sharp Lumber Axes', "Your axes feel...incredibly sharp!", "Lumberjacks are 2x as efficient!", 5000, 1, 100, 1, 2, 1, 1, 1),
				new ElemUpgrade('Unfathomably Sharp Lumber Axes', "The blades of your axes glint with indescribable menace...", "Lumberjacks are 2x as efficient!", 25000, 1, 250, 1, 2, 1, 1, 1),
				new ElemUpgrade('Fast Jacking', "Your lumberjacks sure get the job done quick!", "Lumberjacks are 2x as efficient!", 100000, 1, 500, 1, 2, 1, 1, 1),
				new ElemUpgrade('Super Fast Jacking', "Your lumberjacks are really adept at...gathering wood!", "Lumberjacks are 2x as efficient!", 1000000, 1, 1000, 1, 2, 1, 1, 1),
				new ElemUpgrade('Insanely Fast Jacking', "You've never seen a lumberjack this effective!", "Lumberjacks are 2x as effecient!", 50000000, 1, 1250, 1, 2, 1, 1, 1),
				new ElemUpgrade('Master of Jacking', "You're a master of your craft", "Lumberjacks are 2x as effecient!", 250000000, 1, 1500, 1, 2, 1, 1, 1),

				//Stonecutters
				new ElemUpgrade('Chiseled Chisels', "Your chisels...have abs now?", "Stonecutters are 2x as efficient!", 100, 2, 5, 1, 1, 2, 1, 1),
				new ElemUpgrade('Crazy Chiseled Chisels', "Okay, the abs have abs too?", "Stonecutters are 2x as efficient!", 500, 2, 25, 1, 1, 2, 1, 1),
				new ElemUpgrade('Colossally Chiseled Chisels', "These chisels are giving the stonecutters body image issues...", "Stonecutters are 2x as efficient!", 5000, 2, 100, 1, 1, 2, 1, 1),
				new ElemUpgrade('Catastrophically Chiseled Chisels', "The FDA is investigating your chisels for performance-enhancing drug use...", "Stonecutters are 2x as efficient!", 25000, 2, 250, 1, 1, 2, 1, 1),

				//Iron Miners
				new ElemUpgrade('Reinforced Iron Picks', "Wait, didn't you already buy reinforced picks?", "Iron Miners are 2x as efficient!", 100, 3, 5, 1, 1, 1, 2, 1),
				new ElemUpgrade('Super Reinforced Iron Picks', "Seriously, I could've sworn you bought this already...", "Iron Miners are 2x as efficient!", 500, 3, 25, 1, 1, 1, 2, 1),
				new ElemUpgrade('Incredibly Reinforced Iron Picks', "Seriously, I could've sworn you bought this already...", "Iron Miners are 2x as efficient!", 5000, 3, 100, 1, 1, 1, 2, 1),
				new ElemUpgrade('Unfathomably Reinforced Iron Picks', "Deception is afoot...", "Iron Miners are 2x as efficient", 25000, 3, 250, 1, 1, 1, 2, 1),

				//Farmers
				new ElemUpgrade('Holy Hoes', "Our farmers, who art in heaven...hallowed be thy tools...", "Farmers are 2x as efficient!", 100, 4, 5, 1, 1, 1, 1, 2),
				new ElemUpgrade('Holier Hoes', "Thy harvst come, thy will be done...", "Farmers are 2x as efficient!", 500, 4, 25, 1, 1, 1, 1, 2),
				new ElemUpgrade('Even Holier Hoes', "Give us this day our daily crop...", "Farmers are 2x as efficient!", 5000, 4, 100, 1, 1, 1, 1, 2),
				new ElemUpgrade('Holiest Hoes', "And forgive us our GMOs...", "Farmers are 2x as efficient!", 25000, 4, 250, 1, 1, 1, 1, 2),

				];

let armyUpgrades = [
				//Soldier Upgrades
				new ArmyUpgrade('Knowledge of the Blade', "When you were partying, I studied the blade...", "Soldiers are 2x as powerful", 100, 0, 5, 2), //name, desc, subDesc, goldC, ref, trigger, scale
				new ArmyUpgrade('Cultivation of Inner Strength', "While others pursued vanity, I cultivated inner strength", "Soldiers are 2x as powerful", 500, 0, 25, 2),
				new ArmyUpgrade('Men At Arms', "Now that the world is on fire, you have the audacity to come to me for help?", "Soldiers are 2x as powerful", 5000, 0, 100, 2),
				new ArmyUpgrade('The Art of War', "If you know the enemy and know yourself, you need not fear the result of a hundred battles.", "Soldiers are 2x as powerful", 25000, 0, 250, 2),

				//Archer Upgrades
				new ArmyUpgrade('Heavy Crossbows', "These shots sure do pack a wallop!", "Archers are 2x as powerful", 100, 1, 5, 2),
				]

var upgrades = []
var upgradesCenter = elemUpgrades.length;

for(let i=0; i<elemUpgrades.length+armyUpgrades.length; i++) {
	if(i<elemUpgrades.length) {
		upgrades[i]=elemUpgrades[i];
	} else upgrades[i]=armyUpgrades[i-elemUpgrades.length];
}


var unlocks =  [
				new Unlock('Knows Picking', "You can really get all up in those...rocks...", "Purchased a Gold Miner", 0, 1),
				new Unlock('Getting Wood', "You know your way around a trunk! A tree trunk, that is...", "Purchased a Lumberjack", 1, 1),
				new Unlock('Rock Hard', "...", "Purchased a Stonecutter", 2, 1),
				new Unlock('Ironed Out', "Get those kinks settled once and for all!", "Purchased an Iron Miner", 3, 1),
				new Unlock('Hoes Only', "You're one with the land", "Purchased a Farmer", 4, 1)

				];


for(let i = 0; i < elements.length; i++) {
	elementsDisplay[i] = document.getElementById('e'+(i+1));
}

function update() {

	showElements();
	workerUpdate();
	setCaches();

	for(let i = 0; i < elements.length; i++) {
		elements[i].sendData();
	}
	for(let i = 0; i < army.length; i++) {
		army[i].sendData();
	}

	var repNames = [resources[0] + ": " + resAmounts[0], 
					resources[1] + ": " + resAmounts[1],
					resources[2] + ": " + resAmounts[2],
					resources[3] + ": " + resAmounts[3],
					resources[4] + ": " + resAmounts[4]];

	var materialRep = [document.getElementsByClassName('gold'), 
						document.getElementsByClassName('wood'), 
						document.getElementsByClassName('stone'), 
						document.getElementsByClassName('metal'), 
						document.getElementsByClassName('crop')];

	for(let i = 0; i < materialRep.length; i++) {
		for(let j = 0; j < materialRep[i].length; j++) {
			materialRep[i][j].innerHTML = repNames[i];
		}
	}

	// document.getElementById("").innerHTML = razMiddleName;

	// playerStats[0] = elements[0].getQuantity(); //Str
	// playerStats[1] = 0; //???
	// playerStats[2] = 0; //???
	// playerStats[3] = 0; //???
	// playerStats[4] = 0;

	// buttReplace();
}	

function workerUpdate() {
	for(let i=0; i<updateRates.length; i++) {
		GetRate[i]=0;
		for(let j=0; j<elements.length; j++) {
			if(elements[j].produce[i] !== 0) {
				let canAdd = true;
				for(let k=0; k<elements[j].produce.length; k++) {
					if(elements[j].produce[k]<0 && resAmounts[k] <= 0) {
						canAdd=false;
					}
				}
				if(canAdd) {
					let mult=1;
					for(let l=0; l<upgradesCenter; l++) {
						if(upgrades[l].ref==j&&upgrades[l].unlocked) {
							mult*=upgrades[l].scales[i];
						}
					}
					GetRate[i]+=elements[j].produce[i]*elements[j].getQuantity()*mult;
				}
			}
		}
	}

	for(let i=0; i<updateRates.length; i++) {
		if(GetRate[i]!==SetRate[i]) {
			SetRate[i] = GetRate[i];
			clearInterval(updateRates[i]);
			updateRates[i] = setInterval(function(){resourcesUpdate(i);}, 1000/Math.abs(GetRate[i]));
		}
	}
	for(let i=0; i<GetRate.length; i++) {
		document.getElementById('rate'+i).innerHTML = Math.round(GetRate[i]*100)/100;
	}
}

function armyUpdate() {
	playerStats[0]=0;
	for(let i=0; i<army.length; i++) {
		let mult=1;
		for(let j=upgradesCenter; j<upgrades.length; j++) {
			if(upgrades[j].ref==i&&upgrades[j].unlocked) {
				mult*=upgrades[j].scale;
			}
		}
		playerStats[0]+=army[i].power*army[i].quantity;
	}
}

function resourcesUpdate(i) {
	if(GetRate[i]!== 0){
		if(GetRate[i] > 0) {
			resAmounts[i]++;
		} else resAmounts[i]--;
		update();
	}
}

function showElements() {
	for(let i = 0; i < elements.length - 1; i++) {
		if(elements[i].getQuantity() >= 5) {
			elementsDisplay[i].style.display = 'table-row';
		}
	}

	for(let i = 0; i < upgrades.length; i++) {
		if(upgradesDisplay[i]!==null){
			if(upgrades[i].unlocked == true) {
				upgradesDisplay[i].style.display = 'none';
			} else if(i < upgradesCenter) {
				if(elements[upgrades[i].ref].getQuantity() >= upgrades[i].trigger) {
					upgradesDisplay[i].style.display="table-row";
				}
			} else if(army[upgrades[i].ref].getQuantity() >= upgrades[i].trigger) {
				upgradesDisplay[i].style.display="table-row";
			}
		}
	}
}

function setCaches() {
	let elemQuan = [];
	let armyQuan = []; 
	let unlockedUpgrades = [];

	if(clearAll) {
		localStorage.removeItem("army");
		localStorage.removeItem("elements");
		localStorage.removeItem("resources");
		localStorage.removeItem("upgrades");
	}

	if(!windowLoaded) {
		for(let i = 0; i < army.length; i++) {
			armyQuan[i] = army[i].getQuantity();
		}

		for(let i = 0; i < elements.length; i++) {
			elemQuan[i] = elements[i].getQuantity();
		}

		for(let i=0; i < upgrades.length; i++) {
			unlockedUpgrades[i] = Number(upgrades[i].unlocked);
		}

		localStorage.army = JSON.stringify(armyQuan);
		localStorage.elements = JSON.stringify(elemQuan);
		localStorage.resources = JSON.stringify(resAmounts);
		localStorage.upgrades = JSON.stringify(unlockedUpgrades);
	}

	if(windowLoaded) {
		if(!localStorage.getItem("elements")) {
			localStorage.setItem("elements", JSON.stringify(elemQuan));
		} else {
			parsedElemQuan = JSON.parse(localStorage.getItem("elements"));
			for(let i = 0; i < parsedElemQuan.length; i++) {
				elements[i].quantity = parsedElemQuan[i];
			}
		}

		if(!localStorage.getItem("army")) {
			localStorage.setItem("army", JSON.stringify(armyQuan));
		} else {
			parsedArmyQuan = JSON.parse(localStorage.getItem("army"));
			for(let i = 0; i < parsedArmyQuan.length; i++) {
				army[i].quantity = parsedArmyQuan[i];
			}
		}

		if(!localStorage.getItem("resources")) {
			localStorage.setItem("resources", JSON.stringify(resAmounts));
		} else {
			resAmounts = JSON.parse(localStorage.getItem("resources"));
		}

		if(!localStorage.getItem("upgrades")) {
			localStorage.setItem("upgrades", JSON.stringify(unlockedUpgrades))
		} else {
			parsedUnlockedUpgrades = JSON.parse(localStorage.getItem("upgrades"))
			for(let i = 0; i < parsedUnlockedUpgrades.length; i++) {
				upgrades[i].unlocked = parsedUnlockedUpgrades[i]; 
			}

			console.log(parsedUnlockedUpgrades);
		}

		windowLoaded = !windowLoaded;
	}
}


for(let i = 0; i < elements.length; i++) {
	document.getElementById(elements[i].getName()+'Buy').onclick = function() {elements[i].buy();}
	document.getElementById(elements[i].getName()+'Sell').onclick = function() {elements[i].sell();}
}

for(let i = 0; i < army.length; i++) {
	document.getElementById(army[i].getName()+'Buy').onclick = function() {army[i].buy();}
	document.getElementById(army[i].getName()+'Sell').onclick = function() {army[i].sell();}
}


function openTab(thisClass, thisID, targetClass, targetID) {
	var tabContent = document.getElementsByClassName(targetClass);

	for(let i = 0; i < tabContent.length; i++) {
		tabContent[i].style.display = "none";
		document.getElementsByClassName(thisClass)[i].className = thisClass;
	}

	document.getElementById(targetID).style.display = "block";
	document.getElementById(thisID).className = thisClass + " active";
}


function createUpgrades() {
	let tableRef = document.getElementById("upgrades_table");

	for(let i = 0; i < upgrades.length; i++) {
		let firstRow = tableRef.getElementsByTagName("tbody")[0];
		let newRow = tableRef.insertRow(tableRef.rows.length);
		for(let j = 0; j < 4; j++) {
			let newCells = newRow.insertCell(j);	
		}


		newRow.setAttribute("class", "upgrade_row");
		newRow.setAttribute("id", "u"+i);

		newRow.getElementsByTagName("td")[0].setAttribute("class", "upgrade"+i);
		newRow.getElementsByTagName("td")[1].setAttribute("class", "upgrade"+i+"SubDesc");
		newRow.getElementsByTagName("td")[2].setAttribute("class", "upgrade"+i+"Desc");
		newRow.getElementsByTagName("td")[3].innerHTML = "<a class='buy' id='upgrade"+i+"Buy' href='javascript:void(0);'></a>";

		upgradesDisplay[i] = document.getElementById('u'+i);



		for(let j = 0; j < document.getElementsByClassName("upgrade"+i).length; j++) {
			document.getElementsByClassName("upgrade"+i)[j].innerHTML = upgrades[i].getFullName();
		}


		for(let k = 0; k < document.getElementsByClassName("upgrade"+i+"SubDesc").length; k++) {
			document.getElementsByClassName("upgrade"+i+"SubDesc")[k].innerHTML = upgrades[i].getSubDesc();
		}

		for(let l = 0; l < document.getElementsByClassName("upgrade"+i+"Desc").length; l++) {
			document.getElementsByClassName("upgrade"+i+"Desc")[l].innerHTML = upgrades[i].getDesc();
		}

		document.getElementById("upgrade"+i+"Buy").innerHTML = upgrades[i].getCost();

		if(document.getElementById("upgrade"+i+"Buy") != null)	{
			document.getElementById("upgrade"+i+"Buy").addEventListener('click', function() {
				upgrades[i].buy(); 
			});
		}
	}
}

/* Settings Nonsense */

window.onload = function() {
	windowLoaded = true;
	setCaches();
	createUpgrades();
	update();
}