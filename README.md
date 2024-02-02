# `bps`

[![Available from NPM](https://img.shields.io/npm/v/bps.svg?maxAge=900)](https://www.npmjs.com/package/bps)
[![Built using GitHub Action](https://github.com/lsphillips/bps/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/lsphillips/bps/actions)

A library and CLI tool for creating and applying BPS patches. BPS is short for **Binary Patching System**. A BPS patch contains the difference between two binary files, the source and the target, and can be used to transform the source file into the target file. For more information, please read the [BPS specification](https://www.romhacking.net/documents/746/).

## Usage

This module can be treated as an ES module:

``` js
import * as bps from 'bps';
// or
import { parse, apply, ActionType } from 'bps';
```

This module can also be treated as a CommonJS module:

``` js
const bps = require('bps');
// or
const { parse, apply, ActionType } = require('bps');
```

### Parsing a BPS patch

You can a parse and validate a binary BPS patch:

``` js
const file = await fs.readFile('patch.bps', null);

try
{
  const patch = parse(file);
}
catch (error)
{
  // Throws an error when the patch is invalud, e.g. when
  // the patch doesn't have a valid BPS header.
}
```

A patch object will have the following fields:

| Property         | Type       | Description                                                                     |
| ---------------- | :--------: | ------------------------------------------------------------------------------- |
| `sourceSize`     | `number`   | The expected size (in bytes) that the source should be.                         |
| `sourceChecksum` | `number`   | A CRC32 checksum used to verify the source.                                     |
| `targetSize`     | `number`   | The expected size (in bytes) that the target should be.                         |
| `targetChecksum` | `number`   | A CRC32 checksum used to verify the target.                                     |
| `actions`        | `Object[]` | The actions describing how to sequentially create a new target from the source. |
| `patchChecksum`  | `number`   | A CRC32 checksum used to verify the patch itself.                               |

There are four types of action objects, each with a `type` discriminator property. The four action types are:

- `ActionType.SourceRead` \
  Represents an action that copies bytes from the source to the target. These action objects will have the following properties:
  - `length` - The number of bytes to copy from the source.
- `ActionType.TargetRead` \
  Represents an action that writes data stored in the patch to the target. These action objects will have the following properties:
  - `bytes` - The bytes to write to the target.
- `ActionType.SourceCopy` \
  Represents an action that seeks to a location of the source and copies data from that location to the target. These action objects will have the following properties:
  - `offset` - The amount to move the source relative offset by (can be negative to move backwards).
  - `length` - The number of bytes to copy from the source.
- `ActionType.TargetCopy` \
  Represents an action that seeks to a location of the target and copies data from that location to the target. These action objects will have the following properties:
  - `offset` - The amount to move the target relative offset by (can be negative to move backwards).
  - `length` - The number of bytes to copy from the target.

### Applying a BPS patch

Once you have parsed a BPS patch, you can then apply it to a binary source:

``` js
const source = await fs.readFile('source.txt', null);

try
{
  const target = apply(patch, source);
}
catch (error)
{
  // Throws an error when the provided source does not
  // match the checksum stated by the patch.
}
```

**Important Note:** The source is not modified! The result is a new binary buffer.

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
  -V, --version                    output the version number
  -h, --help                       display help for command

Commands:
  verify <patch>                   verifies a patch file
  apply <patch> <source> <output>  applies a patch to a file
  help [command]                   display help for command
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
