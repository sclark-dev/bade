#!/usr/bin/env node
const bade = require('../../lib');

bade('bin', true)
	.describe('hello description')
	.option('-g, --global', 'flag 1')
	.action(opts => {
		console.log(`~> ran "single" with: ${JSON.stringify(opts)}`);
	})
	.parse(process.argv);
