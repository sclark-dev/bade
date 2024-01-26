#!/usr/bin/env node
const bade = require('../../lib');

bade('bin')
	.command('foo')
	.alias('f', 'fo')
	.action(() => {
		console.log('~> ran "foo" action');
	})
	.parse(process.argv);
