import {
	describe,
	it
} from 'node:test';
import assert from 'node:assert';
import {
	join
} from 'node:path';
import {
	readFile
} from 'node:fs/promises';
import {
	parse,
	apply,
	build,
	serialize,
	ActionType
} from '../lib/bps.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function readFixtureAsBinary (fixture)
{
	return readFile(
		join('./tests/fixtures', fixture), null
	);
}

function bytesToString (bytes)
{
	return Buffer.from(bytes).toString();
}

function stringToBytes (string)
{
	return [
		...Buffer.from(string)
	];
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const Patch =
{
	file           : 'patch.bps',
	source         : 'Hello World\nLine A\nLine B\nLine C\n',
	sourceSize     : 33,
	sourceChecksum : 3872773615,
	target         : 'Hello Universe\nLine C\nLine B\nLine D\nLine A\nLine A\nGoodbye Universe\nGoodbye Universe (again)\n',
	targetSize     : 92,
	targetChecksum : 2072082465,
	checksum       : 360538905,
	actions        : [
		{ type : ActionType.SourceRead, length : 6 },
		{ type : ActionType.TargetRead, length : 8, bytes : stringToBytes('Universe') },
		{ type : ActionType.SourceCopy, length : 8, offset : 25 },
		{ type : ActionType.SourceCopy, length : 12, offset : -14 },
		{ type : ActionType.TargetRead, length : 1, bytes : stringToBytes('D') },
		{ type : ActionType.SourceCopy, length : 13, offset : -20 },
		{ type : ActionType.TargetRead, length : 10, bytes : stringToBytes('A\nGoodbye ') },
		{ type : ActionType.TargetCopy, length : 9, offset : 6 },
		{ type : ActionType.TargetCopy, length : 16, offset : 35 },
		{ type : ActionType.TargetRead, length : 9, bytes : stringToBytes(' (again)\n') }
	]
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

describe('bps', function ()
{
	describe('parse(patch)', function ()
	{
		it('should correctly parse a patch', async function ()
		{
			// Setup.
			const patch = await readFixtureAsBinary(Patch.file);

			// Act.
			const {
				instructions,
				checksum
			} = parse(patch);

			// Assert IO sizes.
			assert.equal(instructions.sourceSize, Patch.sourceSize);
			assert.equal(instructions.targetSize, Patch.targetSize);

			// Assert IO checksums.
			assert.equal(instructions.sourceChecksum, Patch.sourceChecksum);
			assert.equal(instructions.targetChecksum, Patch.targetChecksum);

			// Assert actions.
			assert.equal(instructions.actions.length, Patch.actions.length);

			// Assert actions.
			Patch.actions.forEach((action, i) => assert.deepEqual(instructions.actions[i], action));

			// Assert patch checksum.
			assert.equal(checksum, Patch.checksum);
		});

		it('should throw an error if the patch does not start with the correct BPS header', async function ()
		{
			// Setup.
			const file = await readFixtureAsBinary('patch-with-incorrect-header.bps');

			// Act & Assert.
			assert.throws(() => parse(file));
		});

		it('should throw an error if the patch does not match the embedded checksum', async function ()
		{
			// Setup.
			const file = await readFixtureAsBinary('patch-with-invalid-checksum.bps');

			// Act & Assert.
			assert.throws(() => parse(file));
		});
	});

	describe('apply(instructions, source)', function ()
	{
		it('should correctly apply an instruction set to the source', async function ()
		{
			// Setup.
			const source = Buffer.from(Patch.source, 'utf8');

			// Setup.
			const { instructions } = parse(
				await readFixtureAsBinary(Patch.file)
			);

			// Act.
			const target = apply(instructions, source);

			// Assert.
			assert.equal(bytesToString(target), Patch.target);
		});

		it('should throw an error if the source does not match the checksum stated in the instruction set', async function ()
		{
			// Setup.
			const source = Buffer.from('Hello Pluto\nLine C\nLine B\nLine A\n', 'utf8');

			// Setup.
			const patch = parse(
				await readFixtureAsBinary(Patch.file)
			);

			// Act & Assert.
			assert.throws(() => apply(patch, source));
		});

		it('should throw an error if the result does not match the checksum stated in the instruction set', async function ()
		{
			// Setup.
			const source = Buffer.from(Patch.source, 'utf8');

			// Setup.
			const patch = parse(
				await readFixtureAsBinary('patch-with-invalid-target-checksum.bps')
			);

			// Act & Assert.
			assert.throws(() => apply(patch, source));
		});
	});

	describe('build(source, target)', function ()
	{
		it('should correctly build an instruction set from a binary source and target', function ()
		{
			// Setup.
			const source = Buffer.from(Patch.source, 'utf8');
			const target = Buffer.from(Patch.target, 'utf8');

			// Act.
			const instructions = build(source, target);

			// Assert IO sizes.
			assert.equal(instructions.sourceSize, Patch.sourceSize);
			assert.equal(instructions.targetSize, Patch.targetSize);

			// Assert IO checksums.
			assert.equal(instructions.sourceChecksum, Patch.sourceChecksum);
			assert.equal(instructions.targetChecksum, Patch.targetChecksum);

			// Assert actions.
			assert.equal(instructions.actions.length, Patch.actions.length);

			// Assert actions.
			Patch.actions.forEach((action, i) => assert.deepEqual(instructions.actions[i], action));
		});
	});

	describe('serialize(instructions)', function ()
	{
		it('should correctly serialize an instruction set to a binary format with a valid checksum', async function ()
		{
			// Setup.
			const patch = await readFixtureAsBinary(Patch.file);

			// Act.
			const {
				buffer,
				checksum
			} = serialize({
				sourceSize     : Patch.sourceSize,
				sourceChecksum : Patch.sourceChecksum,
				targetSize     : Patch.targetSize,
				targetChecksum : Patch.targetChecksum,
				actions        : Patch.actions
			});

			// Assert checksum.
			assert.equal(checksum, Patch.checksum);

			// Assert buffer.
			assert.deepEqual(buffer, patch);
		});
	});
});
