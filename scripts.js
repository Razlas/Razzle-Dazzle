var continueButton = document.getElementById('continue');
var intro = document.getElementById('intro');
var hiddenDiv = document.getElementById('hiddenDiv1');

var elementsDisplay = [document.getElementById('e1'), document.getElementById('e2'), document.getElementById('e3'), document.getElementById('e4')];

var windowLoaded = false;
var clearAll = false;

//Names: Gold Miner, TestWorker2, TestWorker3, TestWorker4
/*Upgrade Names:  
	GoldMiner: Reinforced Picks (Profit 1.5x)
	Lumberjacks: Reinforced Lumber Axes (Profit 1.5x)
	Stonecutter: Reinforced Chisels (Profit 1.5x)
	IronMiner: Reinforced Picks (Profit 1.5x)
	Blacksmiths: 
	Chef: 							
*/

var resources  = ['Gold', 'Wood', 'Stone', 'Metal', 'Crop'];
var SetRate = [0, 0, 0, 0, 0];
var GetRate = [0, 0, 0, 0, 0];
var resAmounts = [10000, 10000, 10000, 10000, 5000];
var playerStats = [0, 0, 0, 0, 0]; //Strength, Luck, ???, ???, ???
var updateRates = [null, null, null, null, null];


var buyAmount = 10;
var maxBuy = false;


// Cost scales: 5, 10, 15, 20

// document.addEventListener("keydown", function(event) {
//   console.log(event.which);

//   switch(event.which)
//   {
//   	case 16:
//   	buyAmount = 10;
//   	max = false;
//   	break;

//   	case 18:
//   	buyAmount = 100;
//   	max = false;
//   	break;

//   	case 91:
//   	max = true;
//   	break;

//   	default:
//   	buyAmount = 1;
//   	max = false;
//   }
// });


class Elem {
	constructor(name, goldC, woodC, stoneC, metalC, cropC, goldP, woodP,  stoneP, metalP, cropP) {
		this.name  	  = name;
		this.cost  	  = [goldC, woodC, stoneC, metalC, cropC];
		this.produce  = [goldP, woodP, stoneP, metalP, cropP];
		this.quantity = 0;

		this.upgrades = [];
		this.sendData();
	}

	buy() {
		var canBuy = true;
		var missing = " ";
		var numInvalid = 0;
		for(let i=0; i < this.cost.length; i++) {
			if(resAmounts[i]<this.cost[i]) {
				canBuy = false;
				numInvalid++;
				missing = missing + resources[i] + ", ";
			}
		}

		if(canBuy) {
			this.quantity+=1;
			for(let i = 0; i < this.cost.length; i++) {
				resAmounts[i] -= this.cost[i];
			}
			update();
			this.sendData();
			workerUpdate();
		} else {
			missing = missing.substring(0, missing.length - 2);
			alert("You do not have enough" + missing);
		}
	}

	sell() {
		if(this.quantity > 0) {
			this.quantity -= 1;
			for(let i = 0; i < this.cost.length;i++) {
				resAmounts[i]+=Math.floor(this.cost[i]/2);
			}
			update();
			this.sendData();
			workerUpdate();
		}
	}

	sendData() {
		var eName = document.getElementsByClassName(this.name+'Name');
		var eQuantity = document.getElementsByClassName(this.name+'Quantity');

		for (let i = 0; i < eName.length; i++) {
			eName[i].innerHTML = this.name;
		}


		for(let i = 0; i < eQuantity.length; i++) {
			eQuantity[i].innerHTML = this.quantity;
		}
		
		document.getElementById(this.name+'Buy').innerHTML = this.cost;
		document.getElementById(this.name+'Sell').innerHTML = Math.floor(this.getCost()[0]/2) + "," + Math.floor(this.getCost()[1]/2) + "," + Math.floor(this.getCost()[2]/2) + "," + Math.floor(this.getCost()[3]/2) + "," + Math.floor(this.getCost()[4]/2);
	}

	getCost() {return this.cost;}

	getQuantity() {return this.quantity;}
	getName() {return this.name;}
}

class Unlock {
	constructor(name, desc, subDesc, unlocked) {
		this.name = name;
		this.desc = desc;
		this.subDesc = subDesc;
		this.unlocked = unlocked;
	}

	isUnlocked() {return this.unlocked}
	getName() {return this.name.replace(/\s/g,'');}
	getDesc() {return this.desc;}
}

class Upgrade extends Unlock {
	constructor(name, desc, subDesc, unlocked, goldC, ref, goldPScalar, woodPScalar, stonePScalar, metalPScalar, cropPScalar) {
		super(name, desc, subDesc, unlocked);

		this.goldC = goldC;
		this.ref = ref;
		this.scalars = [goldPScalar, woodPScalar, stonePScalar, metalPScalar, cropPScalar];
	}

	buy() {
		if(this.goldC <= resAmounts[0]) {
			this.unlocked = true;
 			resAmounts[0] -= this.goldC;
		} else alert("You do not have enough gold to purchase this upgrade");
	}
}

var elements = [new Elem('GoldMiner', 10, 10, 10, 10, 5, 1, 0, 0, 0, -0.2), 
				new Elem('Lumberjack', 50, 50, 50, 50, 25, 0, 1, 0, 0, -0.2), 
				new Elem('Stonecutter', 100, 100, 100, 100, 50, 0, 0, 1, 0, -0.2), 
				new Elem('IronMiner', 200, 200, 200, 200, 100, 0, 0, 0, 1, -0.2),
				new Elem('Farmer', 50, 200, 100, 5, 10, 0, 0, 0, 0, 1)];


var upgrades = [new Upgrade('Reinforced Picks', "Your picks feel sturdier than ever!", "Gold Miners are 2x as efficient!", false, 100, 0, 2, 1, 1, 1, 1),
				new Upgrade('Super Reinforced Picks', "Your picks feel super sturdy!", "Gold Miners are 2x as efficient!", false, 500, 0, 2, 1, 1, 1, 1),
				new Upgrade('Super Duper Reinforced Picks', "Your picks feel...incredibly sturdy!", "Gold Miners are 2x as efficient!", false, 5000, 0, 2, 1, 1, 1, 1),
				new Upgrade('Unfathomably Reinforced Picks', "The might of your picks is indescribable...", "Gold Miners are 2x as efficient!", false, 25000, 0, 2, 1, 1, 1, 1)];

				/*new Upgrade('Sharpened Lumber Axes', "Your axes feel sharper than ever!", 100, 1, 1, 2, 1, 1, 1),
				/*new Upgrade('Super Sharp Lumber Axes', "Your axes feel super sharp!", 500, 1, 1, 2, 1, 1, 1),
				/*new Upgrade('Super Duper Sharp Lumber Axes', "Your axes feel...incredibly sharp!", 5000, 1, 1, 2, 1, 1, 1),
				/*new Upgrade('Unfathomably Sharp Lumber Axes', "The blades of your axes glint with indescribable menace...", 25000, 1, 1, 2, 1, 1, 1),
				
				/*new Upgrade('')
				

				*/

var unlocks =  [new Unlock('Knows Picking', "You can really get all up in those...rocks...", "Purchased a Gold Miner", false),
				new Unlock('Getting Wood', "You know your way around a trunk! A tree trunk, that is...", "Purchased a Lumberjack", false),
				new Unlock('Hoes Only', "You're one with the land", "Purchased a Farmer", false)];





function update() {

	workerUpdate();
	setCaches();

	for(let i = 0; i < elements.length; i++) {
		elements[i].sendData();
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

	for(let j = 0; j < materialRep.length; j++) {
		for(let i = 0; i < materialRep[j].length; i++) {
			materialRep[j][i].innerHTML = repNames[j];
		}
	}

	// playerStats[0] = elements[0].getQuantity(); //Str
	// playerStats[1] = 0; //???
	// playerStats[2] = 0; //???
	// playerStats[3] = 0; //???
	// playerStats[4] = 0;

	showElements();
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
					for(let l=0; l<upgrades.length; l++) {
						if(upgrades[l].ref==j&&upgrades[l].unlocked) {
							mult*=upgrades[l].scalars[i];
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
		document.getElementById('rate'+i).innerHTML = Math.round((GetRate[i]) * 100)/100;
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
}

function setCaches() {
	let elemQuan = []; 
	let unlockedUpgrades = [];

	if(clearAll) {
		localStorage.removeItem("elements");
		localStorage.removeItem("resources");
		localStorage.removeItem("upgrades");
	}

	if(!windowLoaded) {
		for(let i = 0; i < elements.length; i++) {
			elemQuan[i] = elements[i].getQuantity();
		}


		for(let i=0; i<upgrades.length; i++) {
			unlockedUpgrades[i] = Number(upgrades[i].unlocked);
		}

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
		}

		windowLoaded = !windowLoaded;

	}
}


for(let i = 0; i < elements.length; i++) {
	document.getElementById(elements[i].getName()+'Buy').onclick = function() {elements[i].buy();}
	document.getElementById(elements[i].getName()+'Sell').onclick = function() {elements[i].sell();}
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

window.onload = function() {
	windowLoaded = true;
	setCaches();
	update();
}