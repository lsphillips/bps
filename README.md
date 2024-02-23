# `bps`

[![Available from NPM](https://img.shields.io/npm/v/bps.svg?maxAge=900)](https://www.npmjs.com/package/bps)
[![Built using GitHub Action](https://github.com/lsphillips/bps/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/lsphillips/bps/actions)

A library and CLI tool for creating and applying BPS patches. BPS is short for **Binary Patching System**. A BPS patch contains the difference between two binary files, the source and the target, and can be used to transform the source file into the target file. For more information, please read the [BPS specification](https://www.romhacking.net/documents/746/).

## Usage

This module can be treated as an ES module:

``` js
import * as bps from 'bps';
// or
import { parse, apply, build, serialize, ActionType } from 'bps';
```

This module can also be treated as a CommonJS module:

``` js
const bps = require('bps');
// or
const { parse, apply, build, serialize, ActionType } = require('bps');
```

### Parsing a BPS patch

You can parse a BPS binary patch into an instruction set:

``` js
const file = await fs.readFile('patch.bps', null);

try
{
  const {
    instructions,
    checksum
  } = bps.parse(file);
}
catch (error)
{
  // Throws an error when the patch is invalid, e.g. when
  // the patch doesn't have a valid BPS header.
}
```

### Applying a BPS patch

You can apply an instruction set to a binary source:

``` js
const source = await fs.readFile('source.txt', null);

try
{
  const target = bps.apply(instructions, source);
}
catch (error)
{
  // Throws an error when the provided source does not
  // match the checksum stated in the patch instructions.
}
```

### Building a BPS patch

You can build an instruction set from a source and a desired target:

``` js
const instructions = bps.build(
  await fs.readFile('source.txt', null),
  await fs.readFile('target.txt', null)
);
```

### Serializing a BPS patch

You can serialize an instruction set into a binary BPS buffer:

``` js
const {
  buffer,
  checksum
} = bps.serialize(instructions);

await fs.writeFile('patch.bps', buffer, null);
```

### Instruction sets

An instruction set will have the following fields:

| Property         | Type       | Description                                                                     |
| ---------------- | :--------: | ------------------------------------------------------------------------------- |
| `sourceSize`     | `number`   | The expected size (in bytes) that the source should be.                         |
| `sourceChecksum` | `number`   | A CRC32 checksum used to verify the source.                                     |
| `targetSize`     | `number`   | The expected size (in bytes) that the target should be.                         |
| `targetChecksum` | `number`   | A CRC32 checksum used to verify the target.                                     |
| `actions`        | `Object[]` | The actions describing how to sequentially create a new target from the source. |

An instruction set compromises of actions, an action results in bytes being appended to the target. Each action has the following properties:

- `type`\
  A discriminator property stating what type of action it is.
- `length`\
  The number of bytes that the action will write to the target.

The four action types are:

- `ActionType.SourceRead`\
  Represents an action that copies a number of bytes from the source to the target.
- `ActionType.TargetRead`\
  Represents an action that writes specified bytes to the target. These actions will have an additional property called `bytes` which will be an array of bytes to write to the target.
- `ActionType.SourceCopy`\
  Represents an action that seeks to a location (a.k.a. relative offset) in the source and copies a number of bytes from that location to the target. These actions will have an additional property called `offset` which describes the amount to move the source relative offset by, this can be negative to move backwards.
- `ActionType.TargetCopy`\
  Represents an action that seeks to a location (a.k.a. relative offset) in the target that has been produced up to this point and copies a number of bytes from that location to the target. These actions will have an additional property called `offset` which describes the amount to move the target relative offset by, this can be negative to move backwards.

## Getting started

This module is available through the Node Package Manager (NPM):

``` bash
npm install bps
```

**Please Note:** Versions of Node lower than v18.0.0 are not supported.

## CLI tool

This package also provides a CLI tool to help verify and apply patches. This package will add `bps` to your path and can be used like so:

``` text
Usage: bps [options] [command]

A tool for creating and applying BPS patches.

Options:
  -V, --version                      output the version number
  -h, --help                         display help for command

Commands:
  verify <patch>                     verifies a patch file
  apply <patch> <source> <output>    applies a patch to a file
  create <source> <target> <output>  creates a patch from a source and a desired target.
  help [command]                     display help for command
```

## Development

### Building

You can build UMD and ESM versions of this package that are minified:

``` bash
npm run build
```

### Testing

This package also has a robust test suite:

``` bash
npm test
```

This includes a code quality check using ESLint. Please refer to the `.eslintrc` files to familiar yourself with the rules.

## License

This project is released under the [MIT license](LICENSE.txt).
