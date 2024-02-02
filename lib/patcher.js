import crc32 from './crc32.js';
import {
	ActionType
} from './definitions.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function apply (patch, file)
{
	if (crc32(file) !== patch.sourceChecksum)
	{
		throw new Error('Source file is not compatible with the patch, it does not have the expected checksum.');
	}

	const source = new DataView(
		file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
	);
	const target = new DataView(
		new ArrayBuffer(patch.targetSize)
	);

	let resultOffset = 0,
	    sourceRelativeOffset = 0,
		targetRelativeOffset = 0;

	for (const action of patch.actions)
	{
		switch (action.type)
		{
			case ActionType.SourceRead :

				for (let i = 0; i < action.length; ++i)
				{
					target.setUint8(
						resultOffset + i, source.getUint8(resultOffset + i)
					);
				}

				resultOffset += action.length;

				break;

			case ActionType.TargetRead :

				for (let i = 0, l = action.bytes.length; i < l; ++i)
				{
					target.setUint8(
						resultOffset++, action.bytes[i]
					);
				}

				break;

			case ActionType.SourceCopy :

				sourceRelativeOffset += action.offset;

				for (let i = 0; i < action.length; ++i)
				{
					target.setUint8(
						resultOffset++, source.getUint8(sourceRelativeOffset++)
					);
				}

				break;

			case ActionType.TargetCopy :

				targetRelativeOffset += action.offset;

				for (let i = 0; i < action.length; ++i)
				{
					target.setUint8(
						resultOffset++, target.getUint8(targetRelativeOffset++)
					);
				}

				break;

			default :
				throw new Error('Patch is invalid, it contains an invalid action type.');
		}
	}

	const result = new Uint8Array(target.buffer);

	if (crc32(result) !== patch.targetChecksum)
	{
		throw new Error('Resulting file is not valid, it does not have the expected checksum.');
	}

	return result;
}
