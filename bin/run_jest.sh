#!/bin/bash

when-changed /Users/moorer/projects/iroki_web/app/assets/javascripts/* /Users/moorer/projects/iroki_web/spec/javascript/* -c /Users/moorer/projects/iroki_web/bin/cat_js.sh &

jest --runTestsByPath --watchAll lalala.test.js
