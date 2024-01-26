#!/usr/bin/env node
const bade = require('../../lib');

bade('bin')
	.alias('foo')
	.command('bar <src>')
	.parse(process.argv);
