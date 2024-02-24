import {
	Header,
	ActionType,
	checksum
} from './spec.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function getVarValueLength (value)
{
	let length = 0, data = value;

	while (true) // eslint-disable-line no-constant-condition
	{
		length++;

		data >>= 7;

		if (data === 0)
		{
			return length;
		}

		data--;
	}
}

function getActionLength (action)
{
	let length = getVarValueLength(
		((action.length - 1) << 2) + action.type
	);

	if (action.type === ActionType.TargetRead)
	{
		length += action.length;
	}
	else if (action.type === ActionType.SourceCopy || action.type === ActionType.TargetCopy)
	{
		length += getVarValueLength(
			(Math.abs(action.offset) << 1) + (action.offset < 0 ? 1 : 0)
		);
	}

	return length;
}

function writeVarValue (view, offset, value)
{
	let data = value, position = offset;

	while (true) // eslint-disable-line no-constant-condition
	{
		let x = data & 0x7f;

		data >>= 7;

		if (data === 0)
		{
			view.setUint8(position++, x | 0x80);

			break;
		}

		view.setUint8(position++, x);

		data--;
	}

	return position;
}

function writeAction (view, offset, action)
{
	let position = writeVarValue(
		view,
		offset,
		((action.length - 1) << 2) + action.type
	);

	if (action.type === ActionType.TargetRead)
	{
		action.bytes.forEach(byte => view.setUint8(position++, byte));
	}
	else if (action.type === ActionType.SourceCopy || action.type === ActionType.TargetCopy)
	{
		position = writeVarValue(
			view,
			position,
			(Math.abs(action.offset) << 1) + (action.offset < 0 ? 1 : 0)
		);
	}

	return position;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function serialize ({
	sourceSize,
	sourceChecksum,
	targetSize,
	targetChecksum,
	actions
})
{
	const patchSize = 4
	                + getVarValueLength(sourceSize)
	                + getVarValueLength(targetSize)
	                + getVarValueLength(0)
	                + actions.reduce((length, action) => length + getActionLength(action), 0)
	                + 4
	                + 4
	                + 4;

	const patch = new DataView(
		new ArrayBuffer(patchSize)
	);

	const buffer = new Uint8Array(patch.buffer);

	let offset = 0;

	patch.setUint32(offset, Header.LE, true);

	offset = 4;
	offset = writeVarValue(patch, offset, sourceSize);
	offset = writeVarValue(patch, offset, targetSize);
	offset = writeVarValue(patch, offset, 0);

	for (const action of actions)
	{
		offset = writeAction(patch, offset, action);
	}

	patch.setUint32(offset,     sourceChecksum, true);
	patch.setUint32(offset + 4, targetChecksum, true);

	const patchChecksum = checksum(
		buffer.subarray(0, -4)
	);

	patch.setUint32(offset + 8, patchChecksum, true);

	return {
		buffer, checksum : patchChecksum
	};
}
