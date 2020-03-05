	// http://paulbourke.net/miscellaneous/interpolation/
	
	// we use this to interpolate the ship towards the mouse position
	function lerp(start, end, amt){
  		return start * (1-amt) + amt * end;
	}
	
	// we didn't use this one
	function cosineInterpolate(y1, y2, amt){
  		let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
  		return (y1 * (1 - amt2)) + (y2 * amt2);
	}
	
	// we use this to keep the ship on the screen
	function clamp(val, min, max){
        return val < min ? min : (val > max ? max : val);
    }
    
    // bounding box collision detection - it compares PIXI.Rectangles
	function rectsIntersect(a,b,aWidth, bWidth){
		var ab = a;
		var bb = b;
		return ab.x + aWidth/2 > bb.x - bWidth/2 && ab.x - aWidth/2 < bb.x + bWidth/2 && ab.y + ab.height/2 > bb.y - bb.height/2 && ab.y - bb.height/2 < bb.y + bb.height/2;
	}

    function rectsBottomIntersect(a,b,aWidth, bWidth){
		var ab = a;
		var bb = b;
        //console.log("dropYMax:   "+ab.y);
        //console.log("playerYMin: "+(bb.y - bb.height/2));
        //console.log("dropYMin:   "+(ab.y - ab.height/2));
        //console.log("playerYMax: "+(bb.y + bb.height/2));
		return ab.x + aWidth/2 > bb.x - bWidth/2 && ab.x - aWidth/2 < bb.x + bWidth/2 && ab.y - ab.height/2 < bb.y + bb.height/2 && ab.y > bb.y - bb.height/2;
	}
	
	// these 2 helpers are used by classes.js
	function getRandomUnitVector(){
		let x = getRandom(-1,1);
		let y = getRandom(-1,1);
		let length = Math.sqrt(x*x + y*y);
		if(length == 0){ // very unlikely
			x=1; // point right
			y=0;
			length = 1;
		} else{
			x /= length;
			y /= length;
		}
	
		return {x:x, y:y};
	}

	function getRandom(min, max) {
		return Math.random() * (max - min) + min;
	}