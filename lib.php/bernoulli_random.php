<?php

function bernoulli_random( $true_ratio = 0.5 )
{
  return $true_ratio > mt_rand() / mt_getrandmax();
}