import {
	resolve
} from 'path';
import fs from 'fs-extra';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export async function readBinaryFile (file)
{
	try
	{
		return fs.readFile(file, null);
	}
	catch
	{
		const path = resolve(file);

		throw new Error(`Could not read file ${file} (${path}), it may not exist or you do not have permissions to read it.`);
	}
}

export async function writeBinaryFile (file, data)
{
	try
	{
		await fs.outputFile(file, data, null);
	}
	catch
	{
		const path = resolve(file);

		throw new Error(`Could not write to file ${file} (${path}), make sure you have the relevant permissions.`);
	}
}
