#!/usr/bin/env node
const bade = require('../../lib');

bade('bin')
	.command('foo', 'original')
	.command('foo', 'duplicate')
	.action(() => {
		console.log('~> ran "foo" action');
	})
	.parse(process.argv);
