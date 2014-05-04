// Do not modify this for your app.
// This is the system core file.
// You will modify your app in lib.js/app.js.

var dom_title;
var dom_header_title;
var dom_header_description;
var dom_header_file_php_container;
var dom_header_file_js_container;
var dom_header_file_html_container;
var dom_header_file_css_container;

var dom_main;
var dom_playground;
var dom_log_container;

var NULL  = 0
var DEBUG = 1;
var INFO  = 2;
var WARN  = 3;
var ERROR = 4;
var FATAL = 5;

var LOG_LEVEL       = DEBUG;
var LOG_FATAL_THROW = true;
var RPC_DEBUG_OUT   = true;

$( function() { initialize(); } );

function from_log_level_to_string( log_level )
{
  switch ( log_level )
  { case FATAL: return 'FATAL';
    case ERROR: return 'ERROR';
    case WARN : return 'WARN';
    case INFO : return 'INFO';
    case DEBUG: return 'DEBUG';
    case NULL : return 'NULL';
    
    default:
      log_detail( ERROR, 'from_log_level_to_string: unknown log_level( ' + log_level + ' )' );
      return 'UNKNOWN';
  }
}

function log( value )
{
  log_detail( INFO, value );
}

function log_detail( level, value )
{
  if ( level < LOG_LEVEL )
    return;
  
  var time         = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  var level_string = from_log_level_to_string( level );
  
  var tag_open  = '<li class="' + level_string + '"><ul>';
  var tag_body  = '<li class="level">[' + level_string + ']<li class="time">' + time + '<li class="message">' + value;
  var tag_close = '</ul></li>';
  
  dom_log_container.prepend( tag_open + tag_body + tag_close );
  
  if ( LOG_FATAL_THROW && level === FATAL )
    throw value;
}

function initialize_dom()
{
  dom_title              = $( 'title' );
  dom_header_title       = $( 'header > div > article > h1' );
  dom_header_description = $( 'header > div > article > p'  );
  dom_header_file_php_container  = $( 'header > div > nav > ul.php'  );
  dom_header_file_js_container   = $( 'header > div > nav > ul.js'   );
  dom_header_file_html_container = $( 'header > div > nav > ul.html' );
  dom_header_file_css_container  = $( 'header > div > nav > ul.css'  );
  dom_main               = $( '#main' );
  dom_playground         = $( '#playground' );
  dom_log_container      = $( '#log ul' );
}

function initialize_files()
{
  rpc ( { command: 'files', params: [ 'php' ] }
      , function( j )
        {
          log_detail( DEBUG  , 'got list of php files.');
        }
      , function( )
        {
          log_detail( ERROR  , 'could not got list of php files.');
        }
      );
}

function initialize()
{
  initialize_dom();
  initialize_files();
}

function rpc( data, f_succeeded, f_failed )
{
  if ( RPC_DEBUG_OUT )
  {
    var id = uuid();
    console.log( id, data, f_succeeded, f_failed );
  }
  
  if ( typeof( data ) !== typeof( { } ) )
  {
    log_detail( ERROR, 'rpc: invalid data' );
    return;
  }
  
  if ( typeof( data.command ) !== typeof( '' ) )
  {
    log_detail( ERROR, 'rpc: invalid command' );
    return;
  }
  
  if ( typeof( f_succeeded ) !== typeof( function(){} ) )
    f_succeeded = function(){};
    
  if ( typeof( f_failed ) !== typeof( function(){} ) )
    f_failed = function(){};
  
  $.ajax
  ( { type    : 'POST'
    , url     : 'main.php'
    , data    : data
    , dataType: 'json'
    , success: function( j )
      {
        if ( RPC_DEBUG_OUT )
          console.log( id, j );
        log_detail( DEBUG  , 'ajax call succeeded.');
        if ( j.exception )
           log_detail( ERROR, 'ajax result is exception: ' + j.exception );
        f_succeeded( j );
      }
    , error  : function()
      {
        log_detail( ERROR , 'ajax call failed.');
        f_failed();
      }
    }
  );
}

function title( value )
{
  dom_title.html( value );
  dom_header_title.html( value );
}

function description( value )
{ dom_header_description.html( value ); }

function php_files ( values ) { files( dom_header_file_php_container , values ); }
function js_files  ( values ) { files( dom_header_file_js_container  , values ); }
function html_files( values ) { files( dom_header_file_html_container, values ); }
function css_files ( values ) { files( dom_header_file_css_container , values ); }

function files( dom, values )
{
  dom.children().remove();
  for ( key in values )
    dom.append( '<li>' + values[ key ] + '</li>' );
}

// see: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function uuid()
{
  var buf = new Uint16Array( 8 );
  
  window.crypto.getRandomValues( buf );
  
  var S4 = function( num )
  {
    var ret = num.toString( 16 );
    
    while ( ret.length < 4 )
      ret = "0" + ret;
    
    return ret;
  };
  
  return  S4( buf[ 0 ] ) + S4( buf[ 1 ] )
        + "-"
        + S4( buf[ 2 ] )
        + "-"
        + S4( buf[ 3 ] )
        + "-"
        + S4( buf[ 4 ] )
        + "-"
        + S4( buf[ 5 ] ) + S4( buf[ 6 ] ) + S4( buf[ 7 ] )
        ;
}