var continueButton = document.getElementById('continue');
var intro = document.getElementById('intro');
var hiddenDiv = document.getElementById('hiddenDiv1');

document.getElementById('continue').addEventListener('click', function() {
 	document.getElementById('hiddenDiv1').style.display = 'block';
 	document.getElementById('continue').style.display = 'none';
 	document.getElementById('intro').style.display = 'none';
 });

document.getElementById('razzle').addEventListener('click', function() {
	document.getElementById('hiddenDiv1').style.display = 'none';
	document.getElementById('hiddenDiv2Raz').style.display = 'block';
})