#!/usr/bin/env node
const bade = require('../../lib');

bade('bin', true)
	.command('foo <bar>')
	.action((bar, opts) => {
		console.log(`~> ran "foo" with: ${JSON.stringify(opts)}`);
	})
	.parse(process.argv);
