export function getWord (data, location)
{
	let word = data.getUint8(location);

	if (location < data.byteLength - 1)
	{
		word |= data.getUint8(location + 1) << 8;
	}

	return word;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class WordTable
{
	#locations = new Array(65536);

	constructor (data = null)
	{
		if (data)
		{
			for (let i = 0, l = data.byteLength; i < l; ++i)
			{
				this.addWordLocation(getWord(data, i), i);
			}
		}
	}

	addWordLocation (word, location)
	{
		const locations = this.#locations[word];

		if (locations)
		{
			locations.push(location);
		}
		else
		{
			this.#locations[word] = [location];
		}
	}

	getWordLocations (word)
	{
		return this.#locations[word] ?? [];
	}
}
