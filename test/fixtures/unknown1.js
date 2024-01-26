#!/usr/bin/env node
const bade = require('../../lib');

bade('bin')
	.option('--bool', 'flag defined')
	.option('-g, --global', 'global flag')

	.command('foo', '', { alias: 'f' })
	.option('-l, --local', 'command flag')
	.action(opts => {
		console.log(`~> ran "foo" with ${JSON.stringify(opts)}`);
	})

	.parse(process.argv, {
		unknown: () => false
	});
