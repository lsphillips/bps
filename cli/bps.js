#!/usr/bin/env node

import {
	Command
} from 'commander';
import apply from './commands/apply.js';
import verify from './commands/verify.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const program = new Command()
	.name('bps')
	.version('1.0.0')
	.description('A tool for creating and applying BPS patches.');

program
	.command('verify')
	.description('verifies a patch file')
	.argument('<patch>', 'the patch file to read')
	.action(verify);

program
	.command('apply')
	.description('applies a patch to a file')
	.argument('<patch>', 'the patch file to apply')
	.argument('<source>', 'the source file to patch')
	.argument('<output>', 'the location to write the patched file to')
	.action(apply);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

program.parse(process.argv);
