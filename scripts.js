var contButton = document.getElementById('contButton');
var intro = document.getElementById('intro');
var hiddenDiv = document.getElementById('hiddenDiv');

var elemOne = document.getElementById('elem1');
var elemTwo = document.getElementById('elem2');
var elemThree = document.getElementById('elem3');
var elemFour = document.getElementById('elem4');

var tr2 = document.getElementById('e2');
var tr3 = document.getElementById('e3');
var tr4 = document.getElementById('e4');

var prices = ['10', '50', '100', '200'];
var money = 100000;

class Elem { 
	constructor(name, cost, costScale) {
		this.name = name;
		this.initialCost = cost;
		this.costScale = costScale;
		this.quantity = 0;
		this.cost = cost;
	}

	setNewPrice() {
		this.cost = Math.floor(this.initialCost * (Math.pow(this.costScale, this.quantity)));
	}

	buy() {
		if(money >= this.cost) {
			money -= this.cost;
			this.quantity+=1;
			this.setNewPrice();
			update();
		} else if(this.quantity < this.cost) {
			alert("You don't have enough money to do that.")
		}
	}

	sell() {
		if(this.quantity > 0) {
			this.quantity -= 1;
			money += Math.floor(this.cost/2);
			this.setNewPrice();
			update();
		}
	}

	getQuantity() {return this.quantity;}
	getCost() {return this.cost;}
	getName() {return this.name;}
}

let firstElement = new Elem("Test", prices[0], 1.1); 
let secondElement = new Elem("Test2", prices[1], 1.1);
let thirdElement = new Elem("Test3", prices[2], 1.1);
let fourthElement = new Elem("Test4", prices[3], 1.1);


function update() {
	var m =  "Money: " + money;
	
	showElements();

	document.getElementById('money').innerHTML = m;

	document.getElementById('e1q').innerHTML = firstElement.getQuantity();
	document.getElementById('e2q').innerHTML = secondElement.getQuantity();
	document.getElementById('e3q').innerHTML = thirdElement.getQuantity();
	document.getElementById('e4q').innerHTML = fourthElement.getQuantity();

	document.getElementById('e1buy').innerHTML = firstElement.getCost();
	document.getElementById('e2buy').innerHTML = secondElement.getCost();
	document.getElementById('e3buy').innerHTML = thirdElement.getCost();
	document.getElementById('e4buy').innerHTML = fourthElement.getCost();

	document.getElementById('e1sell').innerHTML = Math.floor(firstElement.getCost()/2);
	document.getElementById('e2sell').innerHTML = Math.floor(secondElement.getCost()/2);
	document.getElementById('e3sell').innerHTML = Math.floor(thirdElement.getCost()/2);
	document.getElementById('e4sell').innerHTML = Math.floor(fourthElement.getCost()/2);
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

e1buy.onclick = function() {firstElement.buy();}
e1sell.onclick = function() {firstElement.sell();}

e2buy.onclick = function() {secondElement.buy();}
e2sell.onclick = function() {secondElement.sell();}

e3buy.onclick = function() {thirdElement.buy();}
e3sell.onclick = function() {thirdElement.sell();}

e4buy.onclick = function() {fourthElement.buy();}
e4sell.onclick = function() {fourthElement.sell();}

contButton.onclick = function() {
	intro.style.display = "none";
	hiddenDiv.style.display = "block";
	contButton.style.display = "none";
}

contButton.onclick = function() {
	intro.style.display = "none";
	hiddenDiv.style.display = "block";
	contButton.style.display = "none";
}
