import type * as mri from 'mri';
import {NS} from "./NetscriptDefinitions";

type Arrayable<T> = T | T[];

declare function bade(ns: NS, usage: string, isSingle?: boolean): bade.Bade;

declare namespace bade {
	export type Handler = (...args: any[]) => any;
	export type Value = number | string | boolean | null;

	export interface LazyOutput {
		name: string;
		handler: Handler;
		args: string[];
	}

	export interface Bade {
		command(usage: string, description?: string, options?: {
			alias?: Arrayable<string>;
			default?: boolean;
		}): Bade;

		option(flag: string, description?: string, value?: Value): Bade;
		action(handler: Handler): Bade;
		describe(text: Arrayable<string>): Bade;
		alias(...names: string[]): Bade;
		example(usage: string): Bade;

		parse(arr: (string|number|boolean)[], opts: { lazy: true } & mri.Options): LazyOutput;
		parse(arr: (string|number|boolean)[], opts?: { lazy?: boolean } & mri.Options): void;

		version(value: string): Bade;
		help(cmd?: string): void;
	}
}

export = bade;
