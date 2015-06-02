#!/bin/bash
set -e

bower install --allow-root --config.interactive=false
npm install

./node_modules/karma/bin/karma start

