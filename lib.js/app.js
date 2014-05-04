// This is your app code.
// You will modify this and create your app with the System.

var APP_TITLE       = 'the Initial Example @ 2014-php-example-C2';
var APP_DESCRIPTION = 'PHP backend power for the Web.';

// this is your app main prototype( something like a class ) ctor.
function my_app_ctor()
{
  // this is definition of property( member variable ).
  this.main_id = null;
  this.draw_id = null;
  this.initializing = 0;
  this.my_objects = [];
  
  // there are call member function at a construct time.
  this.initialize();
  this.run();
};

// this is definition of static property( static member variable ).
//   tips: its not object-wise, its so static.
my_app_ctor.prototype.update_rate_in_Hz          =     1; // 1 [Hz] = 1 [#/sec]
my_app_ctor.prototype.run_safety_delay_in_ms     =   100;
my_app_ctor.prototype.magical_stone_price_in_yen =  5000 / 85; // [yen]
my_app_ctor.prototype.flying_money_unit_in_yen   = 10000;      // [yen]
my_app_ctor.prototype.flying_money_unit_name     = 'Yukichi-san';
my_app_ctor.prototype.flying_money_image_urls    =
  [ 'image/yukichi_san_omote.jpg'
  , 'image/yukichi_san_ura.jpg'
  ];

// this is your app main prototype member function for initializing.
my_app_ctor.prototype.initialize = function()
{
  // write your app initializing code
  log( 'Hello, this is my_app::initialize!' );
  
  title      ( APP_TITLE );
  description( APP_DESCRIPTION );
  
  dom_playground.children().remove();
  dom_playground.append( '<canvas></canvas>' );
  this.canvas = $( '#playground canvas' );
  this.canvas.width ( '96.0ex' );
  this.canvas.height( '54.0ex' );
  this.canvas.click( function()
  {
    if ( this.main_id )
      this.stop();
    else
      this.run();
  }.bind( this ) );
  var native_canvas = this.canvas[0];
  native_canvas.width  = this.canvas.innerWidth();
  native_canvas.height = this.canvas.innerHeight();
  this.context = native_canvas.getContext('2d');
  
  // loading images with use safety initializing counter.
  this.flying_money_image_objects = [ ];
  for ( var key in this.flying_money_image_urls )
  {
    var url = this.flying_money_image_urls[ key ];
    var img = new Image();
    img.src = url;
    ++this.initializing;
    img.onload = function(){ --this.initializing; }.bind( this );
    this.flying_money_image_objects.push( img );
  }
}
  
// this is your app main prototype member function for running.
my_app_ctor.prototype.run = function()
{
  // write your app running code.
  if ( this.initializing !== 0 )
  {
    log_detail( WARN, 'run: initializing is not done yet, to auto retry at ' + this.run_safety_delay_in_ms + ' [ms] after.' );
    setTimeout( this.run.bind( this ), this.run_safety_delay_in_ms );
    return;
  }
  
  log( 'My app is running!' );
  
  // and then if you want to loop proc.
  //   tips: you cannot use busy loop in the javascript on the web-browser.
  this.main_id = setInterval( this.main.bind( this ), 1000.0 / this.update_rate_in_Hz );
  
  // and then id you want to drawing on the best timing.
  this.draw_before_time = moment().valueOf();
  this.draw_id = window.requestAnimationFrame( this.draw.bind( this ) );
};

// this is your app main prototype member function for main proc.
my_app_ctor.prototype.main = function()
{
  // write your app main proc code.
  log( 'Hi, its main on my_app!' );
  
  rpc
  ( { command: 'bernoulli_random_trial', params: 1 / 10000 }
  , function( r )
    {
      var count_of_magical_stones = r.result;
      log_detail( DEBUG, '1/10000 rare hit!! with ' + count_of_magical_stones + ' trials.' );
      var lost_money = Math.ceil( count_of_magical_stones * this.magical_stone_price_in_yen );
      log_detail( DEBUG, 'seem someone lost money ' + lost_money + ' [yen].' );
      var count_of_flying_money = Math.ceil( lost_money / this.flying_money_unit_in_yen );
      log_detail( DEBUG, count_of_flying_money + ' [' + this.flying_money_unit_name + ']s fly out.')
      var px = Math.random() * this.canvas.width();
      var py = Math.random() * this.canvas.height();
      for ( var n = 0; n < count_of_flying_money; ++n )
      {
        var vx = ( Math.random() - 0.5 ) * this.canvas.width()  / 1000;
        var vy = ( Math.random() - 0.5 ) * this.canvas.height() / 1000;
        var pr = Math.random() * Math.PI * 2.0;
        var vr = ( Math.random() - 0.5 ) * Math.PI * 2.0 / 1000;
        var ps = 0.7 + Math.random() * 0.3;
        var vs = -Math.random() / 1100;
        var img_index = Math.floor( Math.random() * this.flying_money_image_objects.length );
        var img = this.flying_money_image_objects[ img_index ];
        var my_object = new my_object_ctor( px, py, vx, vy, pr, vr, ps, vs, img );
        this.my_objects.push( my_object );
      }
    }.bind( this )
  );
};

// this is your app main prototype member function for draw proc.
my_app_ctor.prototype.draw = function()
{
  // tips: to overflow your app log area if enable this logging maybe.
  // log_detail( DEBUG, 'drawing now!' );
  
  var delta_time_in_ms = moment().valueOf() - this.draw_before_time;

  this.context.clearRect( 0, 0, 1024, 1024 );
  
  var updated_my_objects = [ ];
  
  for ( var key in this.my_objects )
  {
    var my_object = this.my_objects[ key ];
    
    my_object.update( delta_time_in_ms );
    
    var life_in_unorm = my_object.life_in_unorm();
    
    if ( life_in_unorm < 1.0 )
    {
      updated_my_objects.push( my_object );
      
      if ( life_in_unorm < 0.25 )
        this.context.globalAlpha = life_in_unorm * 4.0;
      else if ( life_in_unorm > 0.75 )
        this.context.globalAlpha = 1.0 - life_in_unorm;
      else
        this.context.globalAlpha = 1.0;
      
      this.context.translate( my_object.px, my_object.py );
      this.context.rotate( my_object.pr );
      this.context.scale( my_object.ps, my_object.ps );
      this.context.drawImage( my_object.img, 0, 0 );
      this.context.scale( 1 / my_object.ps, 1 / my_object.ps );
      this.context.rotate( -my_object.pr );
      this.context.translate( -my_object.px, -my_object.py );
    }
  }
  
  this.my_objects = updated_my_objects;
  
  // the requestAnimationFrame is need re-registration self for looping.
  this.draw_before_time = moment().valueOf();
  this.draw_id = window.requestAnimationFrame( this.draw.bind( this ) );
};

// this is your app main prototype member function for stopping main and draw looping.
my_app_ctor.prototype.stop = function()
{
  clearInterval              ( this.main_id );
  window.cancelAnimationFrame( this.draw_id );
  this.main_id = null;
  this.draw_id = null;
};

// this is your something object prototype ctor.
function my_object_ctor( px, py, vx, vy, pr, vr, ps, vs, img )
{
  this.px = px; // position x [pixel]
  this.py = py; // position y [pixel]
  this.vx = vx; // velocity x [pixel/ms]
  this.vy = vy; // velocity y [pixel/ms]
  this.pr = pr; // rotation [radians]
  this.vr = vr; // rotation velocity [radians/ms]
  this.ps = ps; // scaling [-]
  this.vs = vs; // scaling velocity [-/ms]
  this.img = img; // <img> DOM object
  this.time_in_ms = 0; // [ms]
};

my_object_ctor.prototype.destruction_time_in_ms = 1000;

my_object_ctor.prototype.update = function( delta_time_in_ms )
{
  this.time_in_ms += delta_time_in_ms;
  this.px += this.vx * delta_time_in_ms;
  this.py += this.vy * delta_time_in_ms;
  this.pr += this.vr * delta_time_in_ms;
  this.ps += this.vs * delta_time_in_ms;
}

my_object_ctor.prototype.life_in_unorm = function()
{
  return this.time_in_ms / this.destruction_time_in_ms;
}

var my_app;

function main()
{
  my_app = new my_app_ctor();
}

$( function() { main(); } );