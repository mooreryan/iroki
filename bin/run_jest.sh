#!/bin/bash

tmp=/Users/moorer/projects/iroki_web/jest.tmp.test.js

cat /Users/moorer/projects/iroki_web/app/assets/javascripts/parse_mapping_file.js \
    /Users/moorer/projects/iroki_web/spec/javascript/parse_mapping_file_test.js \
    > $tmp

jest --runTestsByPath $tmp

rm $tmp
