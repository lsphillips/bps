# Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.0.1 - 2024-02-25

### Fixed

- The CLI tool now reports the correct version.

## 2.0.0 - 2024-02-24

### Added

- Introduced the `bps.build()` function that enables you to build an instruction set from a source and a desired target.
- Introduced the `bps.serialize()` function that enables you to serialize an instruction set into a binary BPS buffer.
- Introduced the `create` command in the CLI tool that enables you to create a BPS patch file from a source file and a desired target file.

### Changed

- The result of `bps.parse()` has been changed, it now has a different shape. Instead of this object structure:
  ```
  {
    sourceSize : 0,
    sourceChecksum : 0,
    targetSize : 0,
    targetChecksum : 0,
    actions : [],
    patchChecksum : 0
  }
  ```
  You will instead recieve an object with this structure:
  ```
  {
    instructions : {
      sourceSize : 0,
      sourceChecksum : 0,
      targetSize : 0,
      targetChecksum : 0,
      actions : []
    },
    checksum : 0
  }
  ```
- The `bps.patch()` function no longer takes the entire patch previously returned by `bps.parse()` but instead just the instruction set.

## 1.0.0 - 2024-02-02

The initial public release.
