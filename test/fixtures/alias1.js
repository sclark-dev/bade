#!/usr/bin/env node
const bade = require('../../lib');

bade('bin <type> [dir]')
	.alias('error')
	.parse(process.argv);
