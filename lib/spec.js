import crc32 from 'crc-32';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export const Header = Object.freeze({
	LE : 827543618,
	BE : 1112560433
});

export const ActionType = Object.freeze({
	SourceRead : 0,
	TargetRead : 1,
	SourceCopy : 2,
	TargetCopy : 3
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function sourceReadAction (length)
{
	return {
		type : ActionType.SourceRead, length
	};
}

export function targetReadAction (bytes)
{
	return {
		type : ActionType.TargetRead, bytes, length : bytes.length
	};
}

export function sourceCopyAction (offset, length)
{
	return {
		type : ActionType.SourceCopy, offset, length
	};
}

export function targetCopyAction (offset, length)
{
	return {
		type : ActionType.TargetCopy, offset, length
	};
}

export function checksum (buffer)
{
	return crc32.buf(buffer) >>> 0;
}
