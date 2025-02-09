import protectMeFromMyStupidity             from 'eslint-config-protect-me-from-my-stupidity';
import andFromWritingStupidNodeApplications from 'eslint-config-protect-me-from-my-stupidity/and/from-writing-stupid-node-applications';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default [
	{
		ignores : ['bps.js', 'bps.cjs', 'bps.cli.js']
	},
	...protectMeFromMyStupidity(),
	...andFromWritingStupidNodeApplications()
];
