import resolve from '@rollup/plugin-node-resolve';
import * as pkg from './package.json';

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
	input: 'src/index.js',
	output: [{
		format: 'esm',
		file: `dist/${pkg.name}.js`,
		interop: false,
		freeze: false,
		strict: false
	}],
	plugins: [
		resolve()
	],
	external: [
		//...Object.keys(pkg.dependencies),
		...require('module').builtinModules,
	]
}

export default config;
