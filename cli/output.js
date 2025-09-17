export function printLine (message)
{
	console.log(message);
}

export function printError (error)
{
	const message = (error instanceof Error) ? error.message : error;

	if (process.stdout.isTTY)
	{
		console.log(`\x1b[1m\x1b[31m✖\x1b[0m ${message}`);
	}
	else
	{
		printLine(message);
	}
}

export function printSuccess (message)
{
	if (process.stdout.isTTY)
	{
		console.log(`\x1b[1m\x1b[32m✔\x1b[0m ${message}`);
	}
	else
	{
		printLine(message);
	}
}
