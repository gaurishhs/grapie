#!/usr/bin/env bun
// ^^^^ This is the shebang line, which tells the OS to run this file with bun 

process.argv = process.argv.slice(2);

const helpMessage = `Grapie is a framework for building web applications with Bun.
It is designed to be simple, fast, and easy to use.

Documentation can be found at https://grapie.gaurishsethia.me

Usage:
    grapie [command]

Commands:
    new     Create a new Grapie application
    dev     Start the development server
    build   Build the application for production

Flags:
    -h, --help      Show this message
    -v, --version   Show the version

Use "grapie [command] --help" for more information about a command.
`

if (process.argv.length == 0) {
    console.log(helpMessage);
    // Exit the process with a success code
    process.exit(0);
}

const command = process.argv[0];

if (command == "--help" || command == "-h") {
    console.log(helpMessage);
    process.exit(0);
}

if (command == "--version" || command == "-v") {
    console.log("0.0.1");
    process.exit(0);
}

