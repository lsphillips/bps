#!/usr/bin/env node

import {
	Command
} from 'commander';
import apply from './commands/apply.js';
import verify from './commands/verify.js';
import create from './commands/create.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const program = new Command()
	.name('bps')
	.version('2.0.1')
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

program
	.command('create')
	.description('creates a patch from a source and a desired target.')
	.argument('<source>', 'the source file')
	.argument('<target>', 'the target file')
	.argument('<output>', 'the location to write the patch to')
	.action(create);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

program.parse(process.argv);
