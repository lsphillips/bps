import {
	printLine,
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
			sourceSize,
			targetSize,
			sourceChecksum,
			targetChecksum,
			patchChecksum
		} = parse(
			await readBinaryFile(patch)
		);

		printLine(`Expects source file of size ${sourceSize} bytes with checksum ${sourceChecksum}.`);
		printLine(`Expects target file of size ${targetSize} bytes with checksum ${targetChecksum}.`);

		printSuccess(`Patch has checksum ${patchChecksum} and is valid.`);
	}
	catch (error)
	{
		printError(error);
	}
}
