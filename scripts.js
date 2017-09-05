var continueButton = document.getElementById('continue');
var intro = document.getElementById('intro');
var hiddenDiv = document.getElementById('hiddenDiv1');

var elementsDisplay = [document.getElementById('e1'), document.getElementById('e2'), document.getElementById('e3'), document.getElementById('e4')];

var windowLoaded = false;
var clearAll = true;

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

	getCost() {
		return this.cost;
	}

	getQuantity() {return this.quantity;}
	getName() {return this.name;}
}

var elements = [new Elem('GoldMiner', 10, 10, 10, 10, 5, 1, 0, 0, 0, -0.2), 
				new Elem('Lumberjack', 50, 50, 50, 50, 25, 0, 1, 0, 0, -0.2), 
				new Elem('Stonecutter', 100, 100, 100, 100, 50, 0, 0, 1, 0, -0.2), 
				new Elem('IronMiner', 200, 200, 200, 200, 100, 0, 0, 0, 1, -0.2),
				new Elem('Farmer', 50, 200, 100, 5, 10, 0, 0, 0, 0, 1)];


window.onload = function() {
	windowLoaded = true;
	setCaches();
	update();
}

function update() {

	workerUpdate();
	setCaches();

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

	playerStats[0] = elements[0].getQuantity(); //Str
	playerStats[1] = 0; //???
	playerStats[2] = 0; //???
	playerStats[3] = 0; //???
	playerStats[4] = 0;

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
					GetRate[i]+=elements[j].produce[i]*elements[j].getQuantity();
				}
			}
		}
	}

	for(let i=0; i<updateRates.length; i++) {
		if(GetRate[i]!==SetRate[i]) {
			SetRate[i] = GetRate[i];
			clearInterval(updateRates[i]);
			updateRates[i] = setInterval(getUpdates[i], 1000/Math.abs(GetRate[i]));
		}
	}

	for(let i=0; i<GetRate.length; i++) {
		document.getElementById('rate'+i).innerHTML = Math.round((GetRate[i]) * 100)/100;
	}
}

var getUpdates = [
	goldMineUpdate,
	woodChopUpdate,
	stoneMineUpdate,
	metalMineUpdate,
	cropHarvestUpdate
];

function goldMineUpdate() {
	if(GetRate[0]!== 0){
		if(GetRate[0] > 0) {
			resAmounts[0]++;
		} else resAmounts[0]--;
		update();
	}
}

function woodChopUpdate() {
	if(GetRate[1]!==0){
		if(GetRate[1]>0) {
			resAmounts[1]++;
		} else resAmounts[1]--;
		update();
	}
}

function stoneMineUpdate() {
	if(GetRate[2]!==0){
		if(GetRate[2]>0) {
			resAmounts[2]++;
		} else resAmounts[2]--;
		update();
	}
}

function metalMineUpdate() {
	if(GetRate[3]!==0){
		if(GetRate[3]>0) {
			resAmounts[3]++;
		} else resAmounts[3]--;
		update();
	}
}

function cropHarvestUpdate() {
	if(GetRate[4]!==0){
		if(GetRate[4]>0) {
			resAmounts[4]++;
		} else resAmounts[4]--;
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

	if(clearAll) {
		for(let i = 0; i < elements.length; i++) {
			localStorage.removeItem(elements[i].getName()+"Quantity");
		}

		for(let i = 0; i < resources.length; i++) {
			localStorage.removeItem(resources[i]);
		}
	}

	if(!windowLoaded) {
		for(let i = 0; i < elements.length; i++) {
			localStorage[elements[i].getName()+"Quantity"] = elements[i].getQuantity();
		}

		for(let i = 0; i < resources.length; i++) {
			localStorage[resources[i]] = resAmounts[i];
		}
	}

	if(windowLoaded) {
		for(let i = 0; i < elements.length; i++) {
			if(!localStorage.getItem(elements[i].getName()+"Quantity")) {
				localStorage.setItem(elements[i].getName()+"Quantity", elements[i].getQuantity());
			} else {
				elements[i].quantity = parseInt(localStorage[elements[i].getName()+"Quantity"]);
				elements[i].sendData();
			}
		}

		for(let i = 0; i < resources.length; i++) {
			if(!localStorage.getItem(resources[i])) {
				localStorage.setItem(resources[i], resAmounts[i]);
			} else {
				resAmounts[i] = parseInt(localStorage[resources[i]]);
			}
		}

		windowLoaded = !windowLoaded;
	}
}

document.getElementById('GoldMinerBuy').onclick  = function() {elements[0].buy();}
document.getElementById('GoldMinerSell').onclick = function() {elements[0].sell();}

document.getElementById('LumberjackBuy').onclick  = function() {elements[1].buy();}
document.getElementById('LumberjackSell').onclick = function() {elements[1].sell();}

document.getElementById('StonecutterBuy').onclick  = function() {elements[2].buy();}
document.getElementById('StonecutterSell').onclick = function() {elements[2].sell();}

document.getElementById('IronMinerBuy').onclick  = function() {elements[3].buy();}
document.getElementById('IronMinerSell').onclick = function() {elements[3].sell();}

document.getElementById('FarmerBuy').onclick = function() {elements[4].buy();}
document.getElementById('FarmerSell').onclick = function() {elements[4].sell();}

function openTab(thisClass, thisID, targetClass, targetID) {
	var tabContent = document.getElementsByClassName(targetClass);

	for(let i = 0; i < tabContent.length; i++) {
		tabContent[i].style.display = "none";
		document.getElementsByClassName(thisClass)[i].className = thisClass;
	}

	document.getElementById(targetID).style.display = "block";
	document.getElementById(thisID).className = thisClass + " active";
}