#!/usr/bin/env node
const bade = require('../../lib');

bade('bin')
	.option('-g, --global', 'global flag')
	.option('--flag1', 'no alias or default')

	.command('foo', '', { alias: 'f' })
	.option('-l, --local', 'command flag')
	.option('--flag2', 'no alias or default')
	.action(opts => {
		console.log(`~> ran "foo" with ${JSON.stringify(opts)}`);
	})

	.parse(process.argv, {
		unknown: x => `Custom error: ${x}`
	});
