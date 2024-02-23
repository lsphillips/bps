/**
 * Represents a BPS action type.
 */
export enum ActionType
{
	/**
	 * Represents an action that copies bytes from the source to the target.
	 */
	SourceRead = 0,

	/**
	 * Represents an action that writes data stored in the patch to the target.
	 */
	TargetRead = 1,

	/**
	 * Represents an action that seeks to a location of the source and copies data from that location to the target.
	 */
	SourceCopy = 2,

	/**
	 * Represents an action that seeks to a location of the target and copies data from that location to the target.
	 */
	TargetCopy = 3
}

/**
 * Represents a BPS action that copies bytes from the source to the target.
 */
export interface SourceReadAction
{
	/**
	 * A discriminator value to distinguish from other types of actions.
	 */
	type : ActionType.SourceRead;

	/**
	 * The number of bytes to copy from the source.
	 */
	length : number;
}

/**
 * Represents a BPS action that writes data stored in the patch to the target.
 */
export interface TargetReadAction
{
	/**
	 * A discriminator value to distinguish from other types of actions.
	 */
	type : ActionType.TargetRead;

	/**
	 * The number of bytes to write to the target.
	 */
	length : number;

	/**
	 * The bytes to write to the target.
	 */
	bytes : number[];
}

/**
 * Represents a BPS action that seeks to a location of the source and copies data from that location to the target.
 */
export interface SourceCopyAction
{
	/**
	 * A discriminator value to distinguish from other types of actions.
	 */
	type : ActionType.SourceCopy;

	/**
	 * The amount to move the source relative offset by (can be negative to move backwards).
	 */
	offset : number;

	/**
	 * The number of bytes to copy from the source.
	 */
	length : number;
}

/**
 * Represents a BPS action that seeks to a location of the target and copies data from that location to the target.
 */
export interface TargetCopyAction
{
	/**
	 * A discriminator value to distinguish from other types of actions.
	 */
	type : ActionType.TargetCopy;

	/**
	 * The amount to move the target relative offset by (can be negative to move backwards).
	 */
	offset : number;

	/**
	 * The number of bytes to copy from the target.
     */
	length : number;
}

/**
 * Represents BPS instruction set.
 */
export interface PatchInstructions
{
	/**
	 * The expected size (in bytes) that the source should be.
	 */
	sourceSize : number;

	/**
	 * A CRC32 checksum used to verify the source.
	 */
	sourceChecksum : number;

	/**
	 * The expected size (in bytes) that the target should be.
	 */
	targetSize : number;

	/**
	 * A CRC32 checksum used to verify the target.
	 */
	targetChecksum : number;

	/**
	 * The actions describing how to sequentially create a new target from the source.
	 */
	actions : (SourceReadAction | TargetReadAction | SourceCopyAction | TargetCopyAction)[];
}

/**
 * Represents a BPS patch.
 */
export interface Patch
{
	/**
	 * The BPS patch.
	 */
	instructions : PatchInstructions;

	/**
	 * A CRC32 checksum used to verify the patch.
	 */
	checksum : number;
}

/**
 * Represents a binary BPS patch.
 */
export interface BinaryPatch
{
	/**
	 * The buffer containing the complete patch, including the BPS header and the CRC32 patch checksum.
	 */
	buffer : Uint8Array;

	/**
	 * The CRC32 checksum used to verify the patch.
	 */
	checksum : number;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Parses a BPS patch from a binary format.
 *
 * @returns The parsed patch.
 *
 * @param patch The patch to be parsed.
 *
 * @throws {@link Error} When the patch does not start with a valid BPS header (`BPS1`).
 * @throws {@link Error} When the patch does not match the embedded checksum.
 */
export function parse(patch : Uint8Array) : Patch;

/**
 * Applies a BPS instruction set to a binary source.
 *
 * @returns The resulting target.
 *
 * @param instructions The instruction set to be applied.
 * @param source       The binary source to be patched.
 *
 * @throws {@link Error} When the source does not match the expected checksum.
 * @throws {@link Error} When the resulting target does not match the expected checksum.
 */
export function apply(instructions : PatchInstructions, source : Uint8Array) : Uint8Array;

/**
 * Builds a BPS instruction set from a binary source and target.
 *
 * This prioritizes to produce a small set of instructions over being a fast operation.
 *
 * @returns The resulting patch.
 *
 * @param source The binary source.
 * @param target The binary target to be created after the source is patched.
 */
export function build(source : Uint8Array, target : Uint8Array) : PatchInstructions;

/**
 * Serializes a BPS instruction set into a binary BPS buffer.
 *
 * The binary result includes the BPS header and the CRC32 checksum of the patch.
 *
 * @returns The serialized binary patch.
 *
 * @param patch The instruction set to be serialized.
 */
export function serialize(instructions : PatchInstructions) : BinaryPatch;
