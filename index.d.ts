import type * as mri from "mri";
import {NS} from "./NetscriptDefinitions";

export type Handler = (...args: any[]) => any;
export type Value = number | string | boolean | null;

export interface LazyOutput {
	name: string;
	handler: Handler;
	args: string[];
}

/**
 * Smooth (CLI) Operator for Bitburner.
 */
export class Bade {
	/**
	 * Constructs the chainable Bade instance.
	 * @param ns The Bitburner namespace.
	 * @param name Your application name. Defaults to `ns.getScriptName()`
	 * @param isOne Set this instance to be a single command program.
	 */
	constructor(ns: NS, name?: string, isOne?: boolean);

	/**
	 * Creates a new command for your program.
	 * @param usage The usage pattern for your command. This will be shown in the `--help` output.
	 *
	 * Required arguments are wrapped with `<` and `>` characters; Example: `<foo>` and `<bar>`
	 *
	 * Optional arguments are wrapped with `[` and `]` characters; Example: `[foo]` and `[bar]`
	 *
	 * All arguments are positionally important. Optional arguments will be `undefined` if they are omitted.
	 * @param description The command's description.
	 * @param options Additional options for the command.
	 * - alias: Optionally define one or more aliases for the current command.
	 * - default: Manually set/force this command to be the default command. If no command is specified, this will run instead.
	 */
	command(usage: string, description?: string, options?: {
		alias?: (string | string[]),
		default?: boolean;
	}): Bade;

	/**
	 * Add an option to the current command.
	 * @param flag The option's flags, which may optionally include an alias. Separate flags with commas, or spaces.
	 * @param description The option's description.
	 * @param defaultValue The default value for that option. If the flag is parsed, it always returns `true`. See [mri](https://github.com/lukeed/mri#minimist) for more info.
	 *
	 * **Note:** The flag return value will be cast to the same data type as the default value.
	 */
	option(flag: string, description?: string, defaultValue?: Value): Bade;

	/**
	 * Attach a callback to the current command.
	 * @param handler The function to run when the current command is executed.
	 *
	 * The parameters are based on positional arguments defined in the command's `usage`. The final parameter is used for all options, flags, and extra values.
	 */
	action(handler: Handler): Bade;

	/**
	 * Add a description to the current command.
	 * @param text The description text for the current command. This will be included in the `--help` output.
	 */
	describe(text: (string | string[])): Bade;

	/**
	 * Define one or more aliases for the current command.
	 *
	 * **Warning: Bade doesn't check if aliases are already in use**
	 * @param names The list of alternative names.
	 */
	alias(...names: string[]): Bade;

	/**
	 * Add an example for the current command.
	 * @param usage The example string to add. It will be prefixed with the program's name.
	 */
	example(usage: string): Bade;

	/**
	 * Parse a set of CLI arguments without running any actions.
	 * @param arr Your script's ns.args input.
	 * @param opts Additional parsing options.
	 */
	parse(arr: (string | number | boolean)[], opts: { lazy: true } & mri.Options): LazyOutput;

	/**
	 * Parse a set of CLI arguments
	 * @param arr Your script's ns.args input.
	 * @param opts Additional parsing options.
	 */
	parse(arr: (string | number | boolean)[], opts?: { lazy?: boolean } & mri.Options): void;

	/**
	 * Sets the version that is shown when `--version` or `-v` are used.
	 * @param value The new version number for the program.
	 */
	version(value: string): Bade;

	/**
	 * Print the CLI help, optionally for a given command.
	 * @param cmd The command to show the help for.
	 */
	help(cmd?: string): void;
}
