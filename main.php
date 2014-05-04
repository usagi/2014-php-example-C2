<?php

define( 'RESULT_RESULT'   , 'result'    );
define( 'RESULT_EXCEPTION', 'exception' );

define( 'REQUEST_COMMAND', 'command' );
define( 'REQUEST_PARAMS' , 'params'  );

require_once 'lib.php/error_to_exception.php';

require_once 'lib.php/bernoulli_random.php';

final class commands_t
{
  static public function time()      { return time(); }
  static public function microtime() { return microtime(); }
  static public function mt_rand( $params )
  {
    if ( isset( $params[ 1 ] ) && isset( $params[ 0 ] ) )
      return mt_rand( $params[ 0 ], $params[ 1 ] );
    return mt_rand();
  }
  static public function bernoulli_random( $params )
  {
    if ( isset( $params[ 0 ] ) )
      return bernoulli_random( $params[ 0 ] );
    return bernoulli_random();
  }
  static public function bernoulli_random_trial( $params )
  {
    $counter  = 0;
    $function = isset( $params[ 0 ] )
      ? function() use( $params ) { return bernoulli_random( $params[ 0 ] ); }
      : function(){ return bernoulli_random(); }
      ;
    
    do
      ++$counter;
    while ( ! $function() );
    
    return $counter;
  }
  
  static public function files( $params )
  {
    return [ 'aaa', 'bbb', 'ccc' ];
  }
}

try
{
  $result =
  [ RESULT_RESULT    => null
  , RESULT_EXCEPTION => null
  ];
  
  $reflection_commands = new ReflectionClass( 'commands_t' );
  
  if ( isset( $_REQUEST[ REQUEST_COMMAND ] ) )
    $command = $_REQUEST[ REQUEST_COMMAND ];
  else
    throw new RuntimeException( 'request has not command.' );
  
  if ( isset( $_REQUEST[ REQUEST_PARAMS ] ) )
    $params  = is_array( $_REQUEST[ REQUEST_PARAMS ] )
      ?   $_REQUEST[ REQUEST_PARAMS ]
      : [ $_REQUEST[ REQUEST_PARAMS ] ]
      ;
  else
    $params = [];
  
  if ( $reflection_commands -> hasMethod( $command ) )
    $result[ RESULT_RESULT ] = commands_t :: $command ( $params );
  else
    throw new RuntimeException( 'unknown command.' );
  
}
catch ( Exception $e )
{
  $result[ RESULT_RESULT    ] = null;
  $result[ RESULT_EXCEPTION ] = $e -> getMessage();
}
finally
{
  response( $result );
}

function response( $result )
{
  header( 'content-type: text/javascript; charset=utf-8' );
  echo json_encode( $result );
  exit();
}
