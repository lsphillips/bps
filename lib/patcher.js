import {
	ActionType,
	checksum
} from './spec.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function apply ({
	sourceChecksum,
	targetSize,
	targetChecksum,
	actions
}, input)
{
	if (checksum(input) !== sourceChecksum)
	{
		throw new Error('Source is not compatible with the patch, it does not have the expected checksum.');
	}

	const source = new DataView(
		input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength)
	);
	const target = new DataView(
		new ArrayBuffer(targetSize)
	);

	let outputOffset         = 0,
	    sourceRelativeOffset = 0,
		targetRelativeOffset = 0;

	for (const action of actions)
	{
		switch (action.type)
		{
			case ActionType.SourceRead :

				for (let i = 0; i < action.length; ++i)
				{
					target.setUint8(
						outputOffset + i, source.getUint8(outputOffset + i)
					);
				}

				outputOffset += action.length;

				break;

			case ActionType.TargetRead :

				for (let i = 0, l = action.bytes.length; i < l; ++i)
				{
					target.setUint8(
						outputOffset++, action.bytes[i]
					);
				}

				break;

			case ActionType.SourceCopy :

				sourceRelativeOffset += action.offset;

				for (let i = 0; i < action.length; ++i)
				{
					target.setUint8(
						outputOffset++, source.getUint8(sourceRelativeOffset++)
					);
				}

				break;

			case ActionType.TargetCopy :

				targetRelativeOffset += action.offset;

				for (let i = 0; i < action.length; ++i)
				{
					target.setUint8(
						outputOffset++, target.getUint8(targetRelativeOffset++)
					);
				}

				break;

			default :
				throw new Error('Patch is invalid, it contains an invalid action type.');
		}
	}

	const result = new Uint8Array(target.buffer);

	if (checksum(result) !== targetChecksum)
	{
		throw new Error('Resulting target is not valid, it does not have the expected checksum.');
	}

	return result;
}
