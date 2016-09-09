var angle = {
    toDeg: function(rad) {
        return 180/(Math.PI/rad);
    },
    toRad: function(deg) { 
        return (Math.PI/180)*deg;
    }
}

window.onload = function() {
    var canvas     = document.getElementById("canvas"),
        context    = canvas.getContext("2d"),
        width      = canvas.width  = window.innerWidth,
        height     = canvas.height = window.innerHeight,
        canvasData = context.getImageData(0, 0, width, height),
        centerY    = height/2,
        centerX    = width/2;
  
    var planets = [],
        opts    = {
          planet_count: 50,
          min_mass: 100,
          max_mass: 2E3,
          randomize_velocities: false,
          randomize_colors: true,
          reset: function() { randomizePlanets(); }
        };

    /* Simultanious keypresses */
    onkeydown = onkeyup = function(e) {
      keymap[e.keyCode] = e.type;
    }

    function gravitateTo(planet, obj) {
      var r   = planet.pos.distanceTo(obj.pos),
          f   = (obj.mass)/(r*r),
          phi = planet.pos.angleTo(obj.pos);
      
      return new Vector.createPolar(phi, f);
    }
    
    /* Dumb collision detection */
    function isInCircle(cpos, pos, r) {
      var dx = pos.x-cpos.x,
          dy = pos.y-cpos.y;
      
      return dx*dx+dy*dy < r*r;
    }
  
    function doGravity(planet, p, k) {
      var g = gravitateTo(planet, p); 
      //planet.velocity.addTo(g);
      //planet.pos.addTo(planet.velocity);
      return g;
    }
  
    function doPhysics() {
      for (var i = 0; i < planets.length; i++) {
        var planet = planets[i];
        /* Compute gravities and velocities */
        for (var j = 0, k = 0; j < planets.length; j++) {
          if (planet != planets[j]) {
            planet.pos.addTo(gravitateTo(planet,planets[j]));
          }
        }
        //planet.velocity.addTo(gv);
        planet.pos.addTo(planet.velocity);
        /* Compute position, detect collision */
        for (var j = 0; j < planets.length; j++) {
          /* Merge planets on collision */
          if (planet != planets[j] 
                && isInCircle(planet.pos, planets[j].pos, planet.size)) {
              if (planets[j].mass < planet.size) {
                planet.color = planets[j].color; 
              }
              planet.size += planets[j].size;
              planet.mass += planets[j].mass;
              //planet.velocity.subFrom(planets[j].velocity);
              planets.splice(j, 1); 
          }
        }
      }
    }

    function doKeys() {
        if (keymap[37] == 'keydown') { // left
          ship.heading -= 0.08;
          keymap[37] == undefined;
        }
        if (keymap[38] == 'keydown') { // up
          var v = Vector.createPolar(ship.heading-Math.PI/2, 0.1);
          ship.velocity.addTo(v);
          ship.img = assets.rocket_flame;
          keymap[38] == undefined;
        } else if (keymap[38] == 'keyup') {
          ship.img = assets.rocket;
          keymap[38] == undefined;
        }
        if (keymap[39] == 'keydown') { // right
          ship.heading += 0.08;
          keymap[39] == undefined;
        }
        if (keymap[32] == 'keyup') { // space
          createProjectile();
          keymap[32] = undefined;
        }
      //keymap = [];
    }
 
    function myRandom(min, max) {
      return Math.floor(Math.random()*(max-min)+min);
    }
  
    function randomColor() {
      var rgb = new Array(3);
      for (var i = 0; i < rgb.length; i++) {
        rgb[i] = myRandom(30, 255).toString(16);
      }
      return '#' + rgb.join('');
    }
  
    function randomizePlanets() {
      if (planets.length != 0) {
        planets.splice(0, planets.length);
      }
      for (var i = 0; i < opts.planet_count; i++) {
        var pmass = myRandom(opts.min_mass, opts.max_mass);
        var pvel = new Vector(0,0);
        if (opts.randomize_velocities) {
          pvel = new Vector.createPolar(angle.toRad(myRandom(0, 360)), myRandom(0,2)); 
        }
        var pcolor = '#ffffff';
        if (opts.randomize_colors) {
          pcolor = randomColor(); 
        }
        var planet = {
          mass: pmass,
          //gravities: new Array(opts.planet_count),
          //velocity: new Vector(0,0),
          velocity: pvel,
          color: pcolor,
          pos: new Vector(myRandom(0,width), myRandom(0,height)),
          size: pmass / 5E2 + 5
        };
        planets.push(planet);
        console.log(planet);
      }
    }
  
    function drawPlanets() {
      context.clearRect(0, 0, width, height);
      for (var i = 0; i < planets.length; i++) {
        var planet = planets[i];
        context.beginPath();
        context.arc(planet.pos.x, planet.pos.y, planet.size, 0, Math.PI*2);
        context.fillStyle = planet.color;
        context.fill()
        context.closePath();
      }
    }
  
    function render() {
        drawPlanets();
        doPhysics();
        window.requestAnimationFrame(render);
    };
    var gui = new dat.GUI({width: 300});
    gui.add(opts, 'planet_count', 1, 150).step(1);
    gui.add(opts, 'min_mass');
    gui.add(opts, 'max_mass');
    gui.add(opts, 'randomize_velocities');
    gui.add(opts, 'randomize_colors');
    gui.add(opts, 'reset');
    randomizePlanets();
    render();
}
