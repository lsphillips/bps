import {
	readBinaryFile,
	writeBinaryFile
} from '../file.js';
import {
	printError,
	printSuccess
} from '../output.js';
import {
	build,
	serialize
} from '../../lib/bps.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default async function createPatchFile (source, target, output)
{
	try
	{
		const patch = serialize(
			build(
				await readBinaryFile(source),
				await readBinaryFile(target)
			)
		);

		await writeBinaryFile(output, patch.buffer);

		printSuccess(`Patch was generated successfully with checksum ${patch.checksum}.`);
	}
	catch (error)
	{
		printError(error);
	}
}
