const SLOTS_PER_REEL = 12;
// radius = Math.round( ( panelWidth / 2) / Math.tan( Math.PI / SLOTS_PER_REEL ) ); 
// current settings give a value of 149, rounded to 150
const REEL_RADIUS = 150;

const AcceptableCombo = [  	[2, 3, 4, 3],
							[1, 2, 4, 3],
							[1, 1, 4, 3],
							[1, 1, 1, 3],
							[1, 1, 1, 1],
							[1, 1, 2, 2],
							[1, 1, 2, 3],
							[1, 1, 3, 3]
];

var ReelContent = new Array(100);

var previous = new Array(4);

function isAcceptableComboSoFar (ringindex) {
	var ret = false;
	for (var i = 0; i<AcceptableCombo.length; i++) {
		var rowcheck = true;
		
		for (var ii = 0; ii <= ringindex; ii++) { 
			if (AcceptableCombo[i][ii] != ReelContent[ii][0]) {
				rowcheck = false;
			}
		}
		if (rowcheck) {
			ret = true;
		}
	}
	
	if (ringindex == 3) {
		var prevCheck = true;
		for (var i = 0; i < 4; i++) {
			if (ReelContent[i][0] == previous[i]) {
				prevCheck = true && prevCheck;
			} else {
				prevCheck = false;
			}
		}
		if (prevCheck) {

			document.location.reload();
		} else {
			if (ret) {
				for (var i = 0; i < 4; i++) {
					previous[i] = ReelContent[i][0];
					console.log (previous[i]);
				}
				window.localStorage.clear();

				window.localStorage.setItem("previous0", previous[0]);
				window.localStorage.setItem("previous1", previous[1]);
				window.localStorage.setItem("previous2", previous[2]);
				window.localStorage.setItem("previous3", previous[3]);
				console.log ("store: " + previous);
			}
		}
		
	}

	return ret;
}

function parse_query_string(query) {
  var vars = query.split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1]);
    // If first entry with this name
    if (typeof query_string[key] === "undefined") {
      query_string[key] = decodeURIComponent(value);
      // If second entry with this name
    } else if (typeof query_string[key] === "string") {
      var arr = [query_string[key], decodeURIComponent(value)];
      query_string[key] = arr;
      // If third or later entry with this name
    } else {
      query_string[key].push(decodeURIComponent(value));
    }
  }
  return query_string;
}

function skewResults (ringindex, imagesInReel, number) {
	if (ringindex == 0) {
		if (number == 2) { //PD
			var seed = getSeed();
			number = ((seed)%imagesInReel)+1;
		}
	}
	if (ringindex == 1) {
		if (number == 2) { // CC0
			var seed = getSeed();
			number = ((seed)%imagesInReel)+1;
		}
	}
	
	return number;
}

function calcValues (ring, ringindex){
		var arr = new Array(SLOTS_PER_REEL)
	for (var i = 0; i < SLOTS_PER_REEL; i ++) {
		var imagesInReel = 3;
		if (ring[0].id == "ring3") {
			imagesInReel = 4;
		}
		
		var seed = getSeed();
		var number = ((seed + i)%imagesInReel)+1;
		
		number = skewResults(ringindex, imagesInReel, number);
		
		
		arr[i] = number;
	}
	
	ReelContent[ringindex] = arr;
	if (! isAcceptableComboSoFar(ringindex)) {
		console.log("re-iter");
		calcValues (ring, ringindex);
	}
	
}

function createSlots (ring, posqs, ringindex) {
	

	if (previous[0] == null) {
		console.log ("first");
		if (window.localStorage.getItem("previous0") != null ) {
			previous[0] = window.localStorage.getItem("previous0");
			previous[1] = window.localStorage.getItem("previous1");
			previous[2] = window.localStorage.getItem("previous2");
			previous[3] = window.localStorage.getItem("previous3");

			console.log ("getstorage: " + previous);
		}
	}
	
	calcValues(ring, ringindex);
	
	var slotAngle = 360 / SLOTS_PER_REEL;

	
	for (var ii = 0; ii < SLOTS_PER_REEL; ii ++) {
		
		var slot = document.createElement('div');
		
		slot.className = 'slot';

		var transform = 'rotateX(' + (slotAngle * ii) + 'deg) translateZ(' + REEL_RADIUS + 'px)';
		slot.style.transform = transform;

		var content = $(slot).append('<img src="images/' + ring[0].id +'/' + ReelContent[ringindex][ii] + '.png" width="75" height="75"  />');
		ring.append(slot);
	}
}

function getSeed() {
	// generate random number smaller than 13 then floor it to settle between 0 and 12 inclusive
	return Math.floor(Math.random()*(SLOTS_PER_REEL));
}


$(document).ready(function() {


	var query = window.location.search.substring(1);
	var qs = parse_query_string(query);
	console.log(qs);


	// initiate slots
	createSlots($('#ring1'),qs.r1,0);
 	createSlots($('#ring2'),qs.r2,1);
 	createSlots($('#ring3'),qs.r3,2);
 	createSlots($('#ring4'),qs.r4,3);
	
 	// hook start button
 	$('.go').on('click',function(){
		document.location.reload();
	})
	
	$('.ring').on('click',function(){

 	})

 });