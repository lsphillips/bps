import {
	readBinaryFile,
	writeBinaryFile
} from '../file.js';
import {
	printError,
	printSuccess
} from '../output.js';
import {
	parse,
	apply
} from '../../lib/bps.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default async function applyPatchFile (patch, source, output)
{
	try
	{
		const result = apply(
			parse(
				await readBinaryFile(patch)
			),
			await readBinaryFile(source)
		);

		await writeBinaryFile(output, result);

		printSuccess('Patch was applied successfully.');
	}
	catch (error)
	{
		printError(error);
	}
}
