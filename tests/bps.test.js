import {
	join
} from 'path';
import {
	readFile
} from 'fs/promises';
import {
	expect
} from 'chai';
import {
	parse,
	apply,
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

describe('bps', function ()
{
	describe('parse(patch)', function ()
	{
		it('should correctly parse a patch', async function ()
		{
			// Setup.
			const file = await readFixtureAsBinary('patch.bps');

			// Setup.
			const actions = [
				{ type : ActionType.SourceRead, length : 6                           },
				{ type : ActionType.TargetRead, bytes : stringToBytes('Universe')    },
				{ type : ActionType.SourceCopy, length : 8, offset : 25              },
				{ type : ActionType.SourceCopy, length : 12, offset : -14            },
				{ type : ActionType.TargetRead, bytes : stringToBytes('D')           },
				{ type : ActionType.SourceCopy, length : 13, offset : -20            },
				{ type : ActionType.TargetRead, bytes : stringToBytes('A\nGoodbye ') },
				{ type : ActionType.TargetCopy, length : 9, offset : 6               },
				{ type : ActionType.TargetCopy, length : 16, offset : 35             },
				{ type : ActionType.TargetRead, bytes : stringToBytes(' (again)\n')  }
			];

			// Act.
			const patch = parse(file);

			// Assert sizes.
			expect(patch.sourceSize).to.equal(33);
			expect(patch.targetSize).to.equal(92);

			// Assert checksums.
			expect(patch.sourceChecksum).to.equal(3872773615);
			expect(patch.targetChecksum).to.equal(2072082465);
			expect(patch.patchChecksum).to.equal(360538905);

			// Assert actions.
			expect(patch.actions).to.have.length(actions.length);

			// Assert actions.
			actions.forEach((action, i) => expect(
				patch.actions[i]
			).to.eql(action));
		});

		it('should throw an error if the patch does not start with the correct BPS header', async function ()
		{
			// Setup.
			const file = await readFixtureAsBinary('patch-with-incorrect-header.bps');

			// Act & Assert.
			expect(() => parse(file)).to.throw(Error);
		});

		it('should throw an error if the patch does not match the embedded checksum', async function ()
		{
			// Setup.
			const file = await readFixtureAsBinary('patch-with-invalid-checksum.bps');

			// Act & Assert.
			expect(() => parse(file)).to.throw(Error);
		});
	});

	describe('apply(patch, source)', function ()
	{
		it('should correctly apply a patch to the source', async function ()
		{
			// Setup.
			const source = Buffer.from('Hello World\nLine A\nLine B\nLine C\n', 'utf8');

			// Setup.
			const patch = parse(
				await readFixtureAsBinary('patch.bps')
			);

			// Act.
			const target = apply(patch, source);

			// Assert.
			expect(
				bytesToString(target)
			).to.equal('Hello Universe\nLine C\nLine B\nLine D\nLine A\nLine A\nGoodbye Universe\nGoodbye Universe (again)\n');
		});

		it('should throw an error if the source does not match the checksum stated in the patch', async function ()
		{
			// Setup.
			const source = Buffer.from('Hello Pluto\nLine C\nLine B\nLine A\n', 'utf8');

			// Setup.
			const patch = parse(
				await readFixtureAsBinary('patch.bps')
			);

			// Act & Assert.
			expect(() => apply(patch, source)).to.throw(Error);
		});

		it('should throw an error if the result does not match the checksum stated in the patch', async function ()
		{
			// Setup.
			const source = Buffer.from('Hello World\nLine A\nLine B\nLine C\n', 'utf8');

			// Setup.
			const patch = parse(
				await readFixtureAsBinary('patch-with-invalid-target-checksum.bps')
			);

			// Act & Assert.
			expect(() => apply(patch, source)).to.throw(Error);
		});
	});
});
