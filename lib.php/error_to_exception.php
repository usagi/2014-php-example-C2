<?php

set_error_handler
( function( $errno, $errstr, $errfile, $errline )
  {
    throw new RuntimeException( "php error: $errno $errstr $errfile $errline" );
  }
);