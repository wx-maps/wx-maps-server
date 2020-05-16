var five = require("johnny-five");
var pixel = require("node-pixel");
var Raspi = require("raspi-io").RaspiIO;

var opts = {io: new Raspi(), repl: false };
opts.port = process.argv[2] || "";

var board = new five.Board(opts);
var strip = null;

var fps = 60; // how many frames per second do you want to try?

board.on("ready", function() {

  console.log("Board ready, lets add light");

  strip = new pixel.Strip({
      color_order: pixel.COLOR_ORDER.GRB,
      board: this,
      controller: "I2CBACKPACK",
      strips: [30],
  });

  strip.on("ready", function() {
    console.log("Gogogo");
    dynamicRainbow()
  });


  function dynamicRainbow( delay ){
    console.log( 'dynamicRainbow' );

    var showColor;
    var cwi = 0; // colour wheel index (current position on colour wheel)
    var foo = setInterval(function(){
        if (++cwi > 255) {
            cwi = 0;
        }

      try{
        for(var i = 0; i < strip.length; i++) {
            showColor = colorWheel( ( cwi+i ) & 255 );
            strip.pixel( i ).color( showColor );
        }
        strip.show();
      }catch{
        console.log('errror');
      }
    }, 1000/delay);
  }

  // Input a value 0 to 255 to get a color value.
  // The colors are a transition r - g - b - back to r.
  function colorWheel( WheelPos ){
    var r,g,b;
    WheelPos = 255 - WheelPos;

    if ( WheelPos < 85 ) {
        r = 255 - WheelPos * 3;
        g = 0;
        b = WheelPos * 3;
    } else if (WheelPos < 170) {
        WheelPos -= 85;
        r = 0;
        g = WheelPos * 3;
        b = 255 - WheelPos * 3;
    } else {
        WheelPos -= 170;
        r = WheelPos * 3;
        g = 255 - WheelPos * 3;
        b = 0;
    }
    // returns a string with the rgb value to be used as the parameter
    return "rgb(" + r +"," + g + "," + b + ")";
  }
});
