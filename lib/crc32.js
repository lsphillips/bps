import crc32algorithm from 'crc-32';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default function crc32 (buffer)
{
	return crc32algorithm.buf(buffer) >>> 0;
}
