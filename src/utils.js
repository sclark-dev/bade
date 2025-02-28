export const ALL = '__all__';
export const DEF = '__default__';

export const GAP = 4;
export const __ = '  ';
export const NL = '\n';

/**
 * @param {string[]} arr
 * @return {string|string[]}
 */
export function format(arr) {
	if (!arr.length) return '';
	let len = maxLen(arr.map(x => x[0])) + GAP;
	let join = a => a[0] + ' '.repeat(len - a[0].length) + a[1] + (a[2] == null ? '' : `  (default ${a[2]})`);
	return arr.map(join);
}

/**
 * @template T
 * @param {T[]} arr
 * @return {T}
 */
export function maxLen(arr) {
	let c = 0, d = 0, l = 0, i = arr.length;
	if (i) while (i--) {
		d = arr[i].length;
		if (d > c) {
			l = i;
			c = d;
		}
	}
	return arr[l].length;
}

/**
 * @template T
 * @param {T} s
 * @return {T}
 */
export function noop(s) {
	return s;
}

/**
 * @param {string} str
 * @param {string[]} arr
 * @param {function(any):string} fn
 * @return {string}
 */
export function section(str, arr, fn) {
	if (!arr || !arr.length) return '';
	let i = 0, out = '';
	out += (NL + __ + str);
	for (; i < arr.length; i++) {
		out += (NL + __ + __ + fn(arr[i]));
	}
	return out + NL;
}

/**
 * @param {string} bin
 * @param {{}} tree
 * @param key
 * @param {boolean} single
 * @return {string}
 */
export function help(bin, tree, key, single) {
	let out = '', cmd = tree[key], pfx = `$ ${bin}`, all = tree[ALL];
	let prefix = s => `${pfx} ${s}`.replace(/\s+/g, ' ');

	// update ALL & CMD options
	let tail = [['-h, --help', 'Displays this message']];
	if (key === DEF) tail.unshift(['-v, --version', 'Displays current version']);
	cmd.options = (cmd.options || []).concat(all.options, tail);

	// write options placeholder
	if (cmd.options.length > 0) cmd.usage += ' [options]';

	// description ~> text only; usage ~> prefixed
	out += section('Description', cmd.describe, noop);
	out += section('Usage', [cmd.usage], prefix);

	if (!single && key === DEF) {
		let key, rgx = /^__/, help = '', cmds = [];
		// General help :: print all non-(alias|internal) commands & their 1st line of helptext
		for (key in tree) {
			if (typeof tree[key] == 'string' || rgx.test(key)) continue;
			if (cmds.push([key, (tree[key].describe || [''])[0]]) < 3) {
				help += (NL + __ + __ + `${pfx} ${key} --help`);
			}
		}

		out += section('Available Commands', format(cmds), noop);
		out += (NL + __ + 'For more info, run any command with the `--help` flag') + help + NL;
	} else if (!single && key !== DEF) {
		// Command help :: print its aliases if any
		out += section('Aliases', cmd.alibi, prefix);
	}

	out += section('Options', format(cmd.options), noop);
	out += section('Examples', cmd.examples.map(prefix), noop);

	return out;
}

/**
 * @param {NS} ns
 * @param {string} bin
 * @param {*} str
 * @param num
 */
export function error(ns, bin, str, num = 1) {
	let out = section('ERROR', [str], noop);
	out += (NL + __ + `Run \`$ ${bin} --help\` for more info.` + NL);
	ns.tprint(`ERROR: ${out}`);
	ns.exit();
}

// Strips leading `-|--` & extra space(s)
/**
 * @param {string} str
 * @return {string[]}
 */
export function parse(str) {
	return (str || '').split(/^-{1,2}|,|\s+-{1,2}|\s+/).filter(Boolean);
}

// @see https://stackoverflow.com/a/18914855/3577474
/**
 * @param {string} str
 * @return {string[]}
 */
export function sentences(str) {
	return (str || '').replace(/([.?!])\s*(?=[A-Z])/g, '$1|').split('|');
}
