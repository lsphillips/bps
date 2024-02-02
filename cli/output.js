import chalk from 'chalk-template';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function printLine (message)
{
	console.log(message);
}

export function printError (error)
{
	const message = (error instanceof Error) ? error.message : error;

	console.log(chalk `{bold.red ✖} ${message}`);
}

export function printSuccess (message)
{
	console.log(chalk `{bold.green ✔} ${message}`);
}
