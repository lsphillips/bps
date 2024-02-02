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
 * Represents an action that copies bytes from the source to the target.
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
 * Represents an action that writes data stored in the patch to the target.
 */
export interface TargetReadAction
{
	/**
	 * A discriminator value to distinguish from other types of actions.
	 */
	type : ActionType.TargetRead;

	/**
	 * The bytes to write to the target.
	 */
	bytes : number[];
}

/**
 * Represents an action that seeks to a location of the source and copies data from that location to the target.
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
 * Represents an action that seeks to a location of the target and copies data from that location to the target.
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
 * Represents a BPS patch.
 */
export interface Patch
{
	/**
	 * The expected size (in bytes) that the source should be.
	 */
	sourceSize : number;

	/**
	 * A CRC32 checksum used to verify the source.
	 */
	sourceChecksum : number,

	/**
	 * The expected size (in bytes) that the target should be.
	 */
	targetSize : number;

	/**
	 * A CRC32 checksum used to verify the target.
	 */
	targetChecksum : number,

	/**
	 * The actions describing how to sequentially create a new target from the source.
	 */
	actions : (SourceReadAction | TargetReadAction | SourceCopyAction | TargetCopyAction)[];

	/**
	 * A CRC32 checksum used to verify the patch itself.
	 */
	patchChecksum : number;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Parses and validates a binary patch.
 *
 * @returns The parsed patch file.
 *
 * @param patch The patch to be parsed.
 *
 * @throws {@link Error} When the patch does not start with a valid BPS header (`BPS1`).
 * @throws {@link Error} When the patch does not match the embedded checksum.
 */
export function parse(patch : Uint8Array) : Patch;

/**
 * Applies a patch to a binary source.
 *
 * @returns The resulting target.
 *
 * @param patch  The patch to be applied. This needs to be an already parsed patch, see {@link parse}.
 * @param source The binary source to be patched.
 *
 * @throws {@link Error} When the source does not match the checksum stated in the patch.
 * @throws {@link Error} When the resulting target does not match the checksum states in the patch.
 */
export function apply(patch : Patch, source : Uint8Array) : Uint8Array;
