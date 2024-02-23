import {
	Header,
	ActionType,
	sourceReadAction,
	targetReadAction,
	sourceCopyAction,
	targetCopyAction,
	checksum
} from './spec.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function readVarValue (view, offset)
{
	let value    = 0,
	    shift    = 1,
	    byte     = 0,
	    position = offset;

	while (true) // eslint-disable-line no-constant-condition
	{
		byte = view.getUint8(position++);

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
	    offset         = 0,
	    sourceSize     = 0,
	    targetSize     = 0,
		metadataSize   = 0,
		actions        = [],
		sourceChecksum = 0,
		targetChecksum = 0,
		patchChecksum  = 0;

	const header = view.getUint32(offset, true);

	if (header === Header.BE)
	{
		isLittleEndian = false;
	}
	else if (header !== Header.LE)
	{
		throw new Error('Patch is not valid, it does not start with a valid `BPS1` header.');
	}

	offset += 4;

	[sourceSize,   offset] = readVarValue(view, offset);
	[targetSize,   offset] = readVarValue(view, offset);
	[metadataSize, offset] = readVarValue(view, offset);

	offset += metadataSize;

	while (offset < view.byteLength - 12)
	{
		let data   = 0,
		    length = 0,
			action = 0;

		[data, offset] = readVarValue(view, offset);

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
					[relativeOffset, offset] = readVarValue(view, offset);
					relativeOffset = (relativeOffset & 1 ? -1 : 1) * (relativeOffset >> 1);
					action = sourceCopyAction(relativeOffset, length);
				}
				break;

			case ActionType.TargetCopy :
				{
					let relativeOffset = 0;
					[relativeOffset, offset] = readVarValue(view, offset);
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

	if (checksum(patch.subarray(0, -4)) !== patchChecksum)
	{
		throw new Error(`Patch is invalid, it does not have the expected checksum ${patchChecksum}.`);
	}

	return {
		instructions : {
			sourceSize,
			sourceChecksum,
			targetSize,
			targetChecksum,
			actions
		},
		checksum : patchChecksum
	};
}
