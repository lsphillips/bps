import crc32 from './crc32.js';
import {
	Header,
	ActionType,
	sourceReadAction,
	targetReadAction,
	sourceCopyAction,
	targetCopyAction
} from './definitions.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function getVarInt (view, offset, isLittleEndian = true)
{
	let value = 0,
	    shift = 1,
		byte = 0,
		position = offset;

	while (true) // eslint-disable-line no-constant-condition
	{
		byte = view.getUint8(position++, isLittleEndian);

		value += (byte & 0x7f) * shift;

		if (byte & 0x80)
		{
			return [value, position];
		}
		else
		{
			shift <<= 7;
			value += shift;
		}
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function parse (patch)
{
	const view = new DataView(patch.buffer);

	let isLittleEndian = true,
	    offset = 4,
	    sourceSize = 0,
	    targetSize = 0,
		metadataSize = 0,
		actions = [],
		sourceChecksum = 0,
		targetChecksum = 0,
		patchChecksum = 0;

	const header = view.getUint32(0, true);

	if (header === Header.BE)
	{
		isLittleEndian = false;
	}
	else if (header !== Header.LE)
	{
		throw new Error('Patch is not valid, it does not start with a valid `BPS1` header.');
	}

	[sourceSize,   offset] = getVarInt(view, offset, isLittleEndian);
	[targetSize,   offset] = getVarInt(view, offset, isLittleEndian);
	[metadataSize, offset] = getVarInt(view, offset, isLittleEndian);

	offset += metadataSize;

	while (offset < view.byteLength - 12)
	{
		let data = 0,
		    length = 0,
			action = 0;

		[data, offset] = getVarInt(view, offset, isLittleEndian);

		length = (data >> 2) + 1;

		switch (data & 3) // eslint-disable-line default-case
		{
			case ActionType.SourceRead :
				action = sourceReadAction(length);
				break;

			case ActionType.TargetRead :
				{
					let bytes = new Array(length);

					for (let i = 0; i < length; ++i)
					{
						bytes[i] = view.getUint8(offset++, isLittleEndian);
					}

					action = targetReadAction(bytes);
				}
				break;

			case ActionType.SourceCopy :
				{
					let relativeOffset = 0;
					[relativeOffset, offset] = getVarInt(view, offset, isLittleEndian);
					relativeOffset = (relativeOffset & 1 ? -1 : 1) * (relativeOffset >> 1);
					action = sourceCopyAction(relativeOffset, length);
				}
				break;

			case ActionType.TargetCopy :
				{
					let relativeOffset = 0;
					[relativeOffset, offset] = getVarInt(view, offset, isLittleEndian);
					relativeOffset = (relativeOffset & 1 ? -1 : 1) * (relativeOffset >> 1);
					action = targetCopyAction(relativeOffset, length);
				}
				break;
		}

		actions.push(action);
	}

	sourceChecksum = view.getUint32(offset + 0, isLittleEndian);
	targetChecksum = view.getUint32(offset + 4, isLittleEndian);
	patchChecksum  = view.getUint32(offset + 8, isLittleEndian);

	if (crc32(patch.subarray(0, -4)) !== patchChecksum)
	{
		throw new Error(`Patch is invalid, it does not have the expected checksum ${patchChecksum}.`);
	}

	return {
		sourceSize,
		targetSize,
		actions,
		sourceChecksum,
		targetChecksum,
		patchChecksum
	};
}
