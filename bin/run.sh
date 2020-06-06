#!/usr/bin/env bash

echo 'Welcome to your metar map!'

LOCK_FILE='/var/run/pigpio.pid'
if [[ -f $LOCK_FILE ]]; then
  echo 'Clearing GPIO lock'
  rm $LOCK_FILE
else
  echo 'GPIO lock is clear'
fi

node index.js
