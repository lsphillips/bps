import {
	getWord,
	WordTable
} from './word-utilities.js';
import {
	ActionType,
	sourceReadAction,
	targetReadAction,
	sourceCopyAction,
	targetCopyAction,
	checksum
} from './spec.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function getSourceReadAction (source, target, {
	outputOffset
})
{
	let length = 0,
	    offset = outputOffset;

	while (
		offset < source.byteLength &&
		offset < target.byteLength &&
		source.getUint8(offset) === target.getUint8(offset)
	)
	{
		length++;
		offset++;
	}

	return sourceReadAction(length);
}

function getTargetReadAction (target, {
	outputOffset,
	targetReadLength
})
{
	const bytes = [], offset = outputOffset - targetReadLength;

	for (let i = 0; i < targetReadLength; ++i)
	{
		bytes.push(
			target.getUint8(offset + i)
		);
	}

	return targetReadAction(bytes);
}

function getSourceCopyAction (source, target, {
	word,
	outputOffset,
	sourceRelativeOffset,
	sourceWordTable
})
{
	let length = 0,
	    offset = 0;

	const locations = sourceWordTable.getWordLocations(word);

	for (const location of locations)
	{
		let match = 0, x = location, y = outputOffset;

		while (
			x < source.byteLength &&
			y < target.byteLength &&
			source.getUint8(x++) === target.getUint8(y++)
		)
		{
			match++;
		}

		if (match > length)
		{
			length = match;
			offset = location;
		}
	}

	return sourceCopyAction(offset - sourceRelativeOffset, length);
}

function getTargetCopyAction (target, {
	word,
	outputOffset,
	targetRelativeOffset,
	targetWordTable
})
{
	let length = 0,
	    offset = 0;

	const locations = targetWordTable.getWordLocations(word);

	for (const location of locations)
	{
		let match = 0, x = location, y = outputOffset;

		while (
			y < target.byteLength &&
			target.getUint8(x++) === target.getUint8(y++)
		)
		{
			match++;
		}

		if (match > length)
		{
			length = match;
			offset = location;
		}
	}

	return targetCopyAction(offset - targetRelativeOffset, length);
}

function getMostEffectiveAction (...actions)
{
	let action = actions[0];

	for (let i = 1, l = actions.length; i < l; ++i)
	{
		if (actions[i].length > action.length)
		{
			action = actions[i];
		}
	}

	return action;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function build (input, output)
{
	const sourceSize     = input.byteLength;
	const sourceChecksum = checksum(input);
	const targetSize     = output.byteLength;
	const targetChecksum = checksum(output);
	const actions        = [];

	const source = new DataView(
		input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength)
	);
	const target = new DataView(
		output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength)
	);

	const handle = {
		outputOffset         : 0,
		word                 : 0,
		sourceRelativeOffset : 0,
		sourceWordTable      : new WordTable(source),
		targetRelativeOffset : 0,
		targetWordTable      : new WordTable(),
		targetReadLength     : 0
	};

	while (handle.outputOffset < targetSize)
	{
		handle.word = getWord(target, handle.outputOffset);

		const sourceRead = getSourceReadAction(source, target, handle);
		const sourceCopy = getSourceCopyAction(source, target, handle);
		const targetCopy = getTargetCopyAction(target, handle);

		handle.targetWordTable.addWordLocation(
			handle.word,
			handle.outputOffset
		);

		const action = getMostEffectiveAction(sourceRead, sourceCopy, targetCopy);

		if (action.length < 4)
		{
			const length = Math.min(1, targetSize - handle.outputOffset);

			handle.targetReadLength += length;
			handle.outputOffset     += length;
		}
		else
		{
			if (handle.targetReadLength)
			{
				actions.push(
					getTargetReadAction(target, handle)
				);

				handle.targetReadLength = 0;
			}

			handle.outputOffset += action.length;

			if (action.type === ActionType.SourceCopy)
			{
				handle.sourceRelativeOffset = (action.offset + handle.sourceRelativeOffset) + action.length;
			}

			if (action.type === ActionType.TargetCopy)
			{
				handle.targetRelativeOffset = (action.offset + handle.targetRelativeOffset) + action.length;
			}

			actions.push(action);
		}
	}

	if (handle.targetReadLength)
	{
		actions.push(
			getTargetReadAction(target, handle)
		);
	}

	return {
		sourceSize,
		sourceChecksum,
		targetSize,
		targetChecksum,
		actions
	};
}
