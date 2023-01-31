#!/usr/bin/env bun
// ^^^^ This is the shebang line, which tells the OS to run this file with bun 

process.argv = process.argv.slice(2);

if (process.argv.length == 0) {
    // Help message
}