var continueButton = document.getElementById('continue');
var intro = document.getElementById('intro');
var hiddenDiv = document.getElementById('hiddenDiv');

var elemOne   = document.getElementById('elem1');
var elemTwo   = document.getElementById('elem2');
var elemThree = document.getElementById('elem3');
var elemFour  = document.getElementById('elem4');

var e1buy  = document.getElementById('e1buy');
var e1sell = document.getElementById('e1sell');
var e2buy  = document.getElementById('e2buy');
var e2sell = document.getElementById('e2sell');
var e3buy  = document.getElementById('e3buy');
var e3sell = document.getElementById('e3sell');
var e4buy  = document.getElementById('e4buy');
var e4sell = document.getElementById('e4sell');

var tr2 = document.getElementById('e2');
var tr3 = document.getElementById('e3');
var tr4 = document.getElementById('e4');

var goldMiner = setInterval(goldMiner, 5000);


var names = ['Gold Miner', 'TestWorker2', 'TestWorker3', 'TestWorker4'];
var resources  = ['Gold', 'Wood', 'Stone', 'Metal', 'Crop'];
var resAmounts = [1000, 1000, 1000, 1000, 1000];


class Elem {
	constructor(name, goldC, woodC, stoneC, metalC, cropC) {
		this.name   	= name;
		this.cost 		= [goldC, woodC, stoneC, metalC, cropC];
		this.quantity 	= 0;
		this.subject 	= subject;
		this.affect 	= this.affect;
	}

	buy() {
		var canBuy = true;
		var missing = " ";
		var numInvalid = 0;
		for(var i=0; i < this.cost.length; i++) {
			if(resAmounts[i]<this.cost[i]) {
				canBuy = false;
				numInvalid++;
				missing = missing + resources[i] + ", ";
			}
		}

		if(canBuy) {
			this.quantity+=1;
			for(var i = 0; i < this.cost.length; i++) {
				resAmounts[i] -= this.cost[i];
			}
			update();
		} else {
			missing = missing.substring(0, missing.length - 2);
			// if(missing > 1) {
			// 	missing = missing.substr(0, missing.lastIndexOf(',') - 1) + " or " + missing.substr(missing.lastIndexOf(',' + 1), missing.length);)
			// }
			alert("You do not have enough" + missing);
		}
	}

	sell() {
		if(this.quantity > 0) {
			this.quantity -= 1;
			for(var i=0; i < this.cost.length;i++) {
				resAmounts[i]+=Math.floor(this.cost[i]/2);
			}
			update();
		}
	}

	getCost() {
		return this.cost;
	}

	getQuantity() {return this.quantity;}
	getName() {return this.name;}
}

let firstElement = new Elem(names[0], 10, 10, 10, 10, 5); 
let secondElement = new Elem(names[1], 50, 50, 50, 50, 25);
let thirdElement = new Elem(names[2], 100, 100, 100, 100, 50);
let fourthElement = new Elem(names[3], 200, 200, 200, 200, 100);

function update() {
	var g = resources[0] + ": " + resAmounts[0];
	var w = resources[1] + ": " + resAmounts[1];
	var s = resources[2] + ": " + resAmounts[2];
	var m = resources[3] + ": " + resAmounts[3];
	var c = resources[4] + ": " + resAmounts[4];
	
	showElements();

	document.getElementById('gold').innerHTML = g;
	document.getElementById('wood').innerHTML = w;
	document.getElementById('stone').innerHTML = s;
	document.getElementById('metal').innerHTML = m;
	document.getElementById('crop').innerHTML = c;

	document.getElementById('elem1').innerHTML = firstElement.getName();
	document.getElementById('elem2').innerHTML = secondElement.getName();
	document.getElementById('elem3').innerHTML = thirdElement.getName();
	document.getElementById('elem4').innerHTML = fourthElement.getName();

	document.getElementById('e1q').innerHTML = firstElement.getQuantity();
	document.getElementById('e2q').innerHTML = secondElement.getQuantity();
	document.getElementById('e3q').innerHTML = thirdElement.getQuantity();
	document.getElementById('e4q').innerHTML = fourthElement.getQuantity();

	document.getElementById('e1buy').innerHTML = firstElement.getCost();
	document.getElementById('e2buy').innerHTML = secondElement.getCost();
	document.getElementById('e3buy').innerHTML = thirdElement.getCost();
	document.getElementById('e4buy').innerHTML = fourthElement.getCost();

	document.getElementById('e1sell').innerHTML = Math.floor(firstElement.getCost()[0]/2) + "," + Math.floor(firstElement.getCost()[1]/2) + "," + Math.floor(firstElement.getCost()[2]/2) + "," + Math.floor(firstElement.getCost()[3]/2) + "," + Math.floor(firstElement.getCost()[4]/2);
	document.getElementById('e2sell').innerHTML = Math.floor(secondElement.getCost()[0]/2) + "," + Math.floor(secondElement.getCost()[1]/2) + "," + Math.floor(secondElement.getCost()[2]/2) + "," + Math.floor(secondElement.getCost()[3]/2) + "," + Math.floor(secondElement.getCost()[4]/2);
	document.getElementById('e3sell').innerHTML = Math.floor(thirdElement.getCost()[0]/2) + "," + Math.floor(thirdElement.getCost()[1]/2) + "," + Math.floor(thirdElement.getCost()[2]/2) + "," + Math.floor(thirdElement.getCost()[3]/2) + "," + Math.floor(thirdElement.getCost()[4]/2);
	document.getElementById('e4sell').innerHTML = Math.floor(fourthElement.getCost()[0]/2) + "," + Math.floor(fourthElement.getCost()[1]/2) + "," + Math.floor(fourthElement.getCost()[2]/2) + "," + Math.floor(fourthElement.getCost()[3]/2) + "," + Math.floor(fourthElement.getCost()[4]/2);
}

function showElements() {
	if(firstElement.getQuantity() >= 5) {
		tr2.style.display = 'table-row';
	}

	if(secondElement.getQuantity() >= 5) {
		tr3.style.display = 'table-row';
	}

	if(thirdElement.getQuantity() >= 5) {
		tr4.style.display = 'table-row';
	}
}

window.onload = function() {
	update();

}

function goldMiner() {
	resAmounts[0] += firstElement.getQuantity()*2;
	resAmounts[5] -= firstElement.getQuantity();
	update();
}


e1buy.onclick  = function() {firstElement.buy();}
e1sell.onclick = function() {firstElement.sell();}

e2buy.onclick  = function() {secondElement.buy();}
e2sell.onclick = function() {secondElement.sell();}

e3buy.onclick  = function() {thirdElement.buy();}
e3sell.onclick = function() {thirdElement.sell();}

e4buy.onclick  = function() {fourthElement.buy();}
e4sell.onclick = function() {fourthElement.sell();}

function openTab(tabGroup, tabName) {
	var i, tabContent, tabLinks;

	tabContent = document.getElementsByClassName(tabGroup);
	for(i = 0; i < tabContent.length; i++) {
		tabContent[i].style.display = "none";
	}

	document.getElementById(tabName).style.display = "block";
}

