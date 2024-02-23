import {
	printError,
	printSuccess
} from '../output.js';
import {
	readBinaryFile
} from '../file.js';
import {
	parse
} from '../../lib/bps.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default async function verifyPatchFile (patch)
{
	try
	{
		const {
			checksum
		} = parse(
			await readBinaryFile(patch)
		);

		printSuccess(`Patch has checksum ${checksum} and is valid.`);
	}
	catch (error)
	{
		printError(error);
	}
}
