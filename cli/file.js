import {
	resolve,
	dirname
} from 'node:path';
import {
	readFile,
	mkdir,
	writeFile
} from 'node:fs/promises';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export async function readBinaryFile (file)
{
	try
	{
		return readFile(file, null);
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
		const directory = dirname(file);

		await mkdir(directory, {
			recursive : true
		});

		await writeFile(file, data, null);
	}
	catch
	{
		const path = resolve(file);

		throw new Error(`Could not write to file ${file} (${path}), make sure you have the relevant permissions.`);
	}
}
