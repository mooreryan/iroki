#!/bin/bash

tmp=/Users/moorer/projects/iroki_web/lalala.test.js

cat /Users/moorer/projects/iroki_web/app/assets/javascripts/newick.js \
    /Users/moorer/projects/iroki_web/app/assets/javascripts/parse_mapping_file.js \
    /Users/moorer/projects/iroki_web/spec/javascript/parse_mapping_file_test.js \
    /Users/moorer/projects/iroki_web/spec/javascript/newick_test.js \
    > $tmp
