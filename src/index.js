import mri from 'mri';
import * as $ from './utils';
import {ALL, DEF} from './utils';

/**
 * Smooth (CLI) Operator for Bitburner.
 */
export class Bade {
	/**
	 * Constructs the chainable Bade instance.
	 * @param {NS} ns The Bitburner namespace.
	 * @param {string} [name] Your application name. Defaults to `ns.getScriptName()`
	 * @param {boolean} [isOne] Set this instance to be a single command program.
	 */
	constructor(ns, name, isOne) {
		let [bin, ...rest] = (name || ns.getScriptName()).split(/\s+/);
		isOne = isOne || rest.length > 0;

		/**
		 * @type {NS}
		 */
		this.ns = ns;

		/**
		 * The script that contains this program.
		 * @type {string}
		 */
		this.bin = bin;
		this.ver = '0.0.0';
		this.default = '';
		/**
		 * @type {{}}
		 */
		this.tree = {};
		// set internal shapes;
		this.command(ALL);
		this.command([DEF].concat(isOne ? rest : '<command>').join(' '));
		this.single = isOne;
		this.curr = ''; // reset
	}

	/**
	 * Creates a new command for your program.
	 * @param {string} str The usage pattern for your command. This will be shown in the `--help` output.
	 *
	 * Required arguments are wrapped with `<` and `>` characters; Example: `<foo>` and `<bar>`
	 *
	 * Optional arguments are wrapped with `[` and `]` characters; Example: `[foo]` and `[bar]`
	 *
	 * All arguments are positionally important. Optional arguments will be `undefined` if they are omitted.
	 * @param {string} [desc] The command's description.
	 * @param {{alias: (string|string[]), default: boolean}} [opts] Additional options for the command.
	 * - alias: Optionally define one or more aliases for the current command.
	 * - default: Manually set/force this command to be the default command. If no command is specified, this will run instead.
	 * @return Bade
	 */
	command(str, desc, opts = {}) {
		if (this.single) {
			throw new Error('Disable "single" mode to add commands');
		}

		// All non-([|<) are commands
		let cmd = [], usage = [], rgx = /(\[|<)/;
		str.split(/\s+/).forEach(x => {
			(rgx.test(x.charAt(0)) ? usage : cmd).push(x);
		});

		// Back to string~!
		cmd = cmd.join(' ');

		if (cmd in this.tree) {
			throw new Error(`Command already exists: ${cmd}`);
		}

		// re-include `cmd` for commands
		cmd.includes('__') || usage.unshift(cmd);
		usage = usage.join(' '); // to string

		this.curr = cmd;
		if (opts.default) this.default = cmd;

		this.tree[cmd] = {usage, alibi: [], options: [], alias: {}, default: {}, examples: []};
		if (opts.alias) this.alias(opts.alias);
		if (desc) this.describe(desc);

		return this;
	}

	/**
	 * Add a description to the current command.
	 * @param {string} str The description text for the current command. This will be included in the `--help` output.
	 * @return {Bade}
	 */
	describe(str) {
		this.tree[this.curr || DEF].describe = Array.isArray(str) ? str : $.sentences(str);
		return this;
	}

	/**
	 * Define one or more aliases for the current command.
	 *
	 * **Warning: Bade doesn't check if aliases are already in use**
	 * @param {string[]} names The list of alternative names.
	 * @return {Bade}
	 */
	alias(...names) {
		if (this.single) throw new Error('Cannot call `alias()` in "single" mode');
		if (!this.curr) throw new Error('Cannot call `alias()` before defining a command');
		let arr = this.tree[this.curr].alibi = this.tree[this.curr].alibi.concat(...names);
		arr.forEach(key => this.tree[key] = this.curr);
		return this;
	}

	/**
	 * Add an option to the current command.
	 * @param {string} str The option's flags, which may optionally include an alias. Separate flags with commas, or spaces.
	 * @param {string} desc The option's description.
	 * @param {string|number} val The default value for that option. If the flag is parsed, it always returns `true`. See [mri](https://github.com/lukeed/mri#minimist) for more info.
	 *
	 * **Note:** The flag return value will be cast to the same data type as the default value.
	 * @return {Bade}
	 */
	option(str, desc, val) {
		let cmd = this.tree[this.curr || ALL];

		let [flag, alias] = $.parse(str);
		if (alias && alias.length > 1) [flag, alias] = [alias, flag];

		str = `--${flag}`;
		if (alias && alias.length > 0) {
			str = `-${alias}, ${str}`;
			let old = cmd.alias[alias];
			cmd.alias[alias] = (old || []).concat(flag);
		}

		let arr = [str, desc || ''];

		if (val !== void 0) {
			arr.push(val);
			cmd.default[flag] = val;
		} else if (!alias) {
			cmd.default[flag] = void 0;
		}

		cmd.options.push(arr);
		return this;
	}

	/**
	 * Attach a callback to the current command.
	 * @param {(function(...any[]): void)} handler The function to run when the current command is executed.
	 *
	 * The parameters are based on positional arguments defined in the command's `usage`. The final parameter is used for all options, flags, and extra values.
	 * @return {Bade}
	 */
	action(handler) {
		this.tree[this.curr || DEF].handler = handler;
		return this;
	}

	/**
	 * Add an example for the current command.
	 * @param {string} str The example string to add. It will be prefixed with the program's name.
	 * @return {Bade}
	 */
	example(str) {
		this.tree[this.curr || DEF].examples.push(str);
		return this;
	}

	/**
	 * Sets the version that is shown when `--version` or `-v` are used.
	 * @param {string} str The new version number for the program.
	 * @return {Bade}
	 */
	version(str) {
		this.ver = str;
		return this;
	}

	/**
	 * Parse a set of CLI arguments
	 * @param {(string | number | boolean)[]} arr Your script's ns.args input.
	 * @param opts Additional parsing options.
	 * @return {void|{name: string, handler: function(...any[]), args: string[]}}
	 */
	parse(arr, opts = {}) {
		arr = arr.slice().map(a => a.toString()); // copy and convert all to string
		let offset = 0, tmp, idx, isVoid, cmd;
		let alias = {h: 'help', v: 'version'};
		let argv = mri(arr.slice(offset), {alias});
		let isSingle = this.single;
		let bin = this.bin;
		let name = '';

		if (isSingle) {
			cmd = this.tree[DEF];
		} else {
			// Loop thru possible command(s)
			let i = 1, xyz, len = argv._.length + 1;
			for (; i < len; i++) {
				tmp = argv._.slice(0, i).join(' ');
				xyz = this.tree[tmp];
				if (typeof xyz === 'string') {
					idx = (name = xyz).split(' ');
					arr.splice(arr.indexOf(argv._[0]), i, ...idx);
					i += (idx.length - i);
				} else if (xyz) {
					name = tmp;
				} else if (name) {
					break;
				}
			}

			cmd = this.tree[name];
			isVoid = (cmd === void 0);

			if (isVoid) {
				if (this.default) {
					name = this.default;
					cmd = this.tree[name];
					arr.unshift(name);
					offset++;
				} else if (tmp) {
					return $.error(this.ns, bin, `Invalid command: ${tmp}`);
				} //=> else: cmd not specified, wait for now...
			}
		}

		// show main help if relied on "default" for multi-cmd
		if (argv.help) return this.help(!isSingle && !isVoid && name);
		if (argv.version) return this._version();

		if (!isSingle && cmd === void 0) {
			return $.error(this.ns, bin, 'No command specified.');
		}

		let all = this.tree[ALL];
		// merge all objects :: params > command > all
		opts.alias = Object.assign(all.alias, cmd.alias, opts.alias);
		opts.default = Object.assign(all.default, cmd.default, opts.default);

		tmp = name.split(' ');
		idx = arr.indexOf(tmp[0], 0);
		if (!!~idx) arr.splice(idx, tmp.length);

		let vals = mri(arr.slice(offset), opts);
		if (!vals || typeof vals === 'string') {
			return $.error(this.ns, bin, vals || 'Parsed unknown option flag(s)!');
		}

		let segs = cmd.usage.split(/\s+/);
		let reqs = segs.filter(x => x.charAt(0) === '<');
		let args = vals._.splice(0, reqs.length);

		if (args.length < reqs.length) {
			if (name) bin += ` ${name}`; // for help text
			return $.error(this.ns, bin, 'Insufficient arguments!');
		}

		segs.filter(x => x.charAt(0) === '[').forEach(_ => {
			args.push(vals._.shift()); // adds `undefined` per [slot] if no more
		});

		args.push(vals); // flags & co are last
		let handler = cmd.handler;
		return opts.lazy ? {args, name, handler} : handler.apply(null, args);
	}

	/**
	 * Print the CLI help, optionally for a given command.
	 * @param {string} [str] The command to show the help for.
	 */
	help(str) {
		this.ns.tprint(
			$.help(this.bin, this.tree, str || DEF, this.single)
		);
	}

	_version() {
		this.ns.tprint(`${this.bin}, ${this.ver}`);
	}
}
