import terser from '@rollup/plugin-terser';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function bundle (input, output)
{
	const plugins = [
		terser()
	];

	const external = [
		'crc-32',
		'path',
		'commander',
		'chalk-template',
		'fs-extra'
	];

	return {
		input,
		output,
		plugins,
		external
	};
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default
[
	bundle('cli/bps.js', {
		file : 'bps.cli.js',
		format : 'esm'
	}),

	bundle('lib/bps.js', {
		file : 'bps.js',
		format : 'esm'
	}),

	bundle('lib/bps.js', {
		file : 'bps.cjs',
		format : 'cjs',
		exports : 'named'
	})
];
