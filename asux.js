#!/usr/bin/env node



//decison made: Each subfolder or org.ASUX (like this one org.ASUX.cmdline) will be a standalone project ..
// .. as in: this asux.js is EXPECTING to see cmdline-arguments **as if** it were entered by user on shell-prompt



//--------------------------
var fs = require("fs");     // https://nodejs.org/api/fs.html#fs_fs_accesssync_path_mode 

if ( ! process.env.ORGASUXHOME ) {
	console.error("ERROR: You must define the ENVIRONMENT variable 'ORGASUXHOME' accurately.  A simple way is to run asux.js from the __ROOT__ (org.ASUX) project of the org.ASUX hierarchy-of-projects at GitHub.com." );
	process.exit(99);
}
// file-included - Not a 'require'
eval( fs.readFileSync( process.env.ORGASUXHOME +'/bin/asux-common.js' ) + '' );

//==========================================================
var COMMAND = "unknown"; // will be set based on what the user enters on the commandline.

//==========================================================
/* attach options to a command */
/* if a command does NOT define an action (see .action invocation), then the options are NOT validated */
/* For Git-like submodule commands.. ..
 *	When .command() is invoked with a description argument, no .action(callback) should be called to handle sub-commands.
 *	Otherwise there will be an error.
 *	By avoiding .action(), you tell commander that you're going to use separate executables for sub-commands, much like git(1) and other popular tools.
 *	The commander will try to search the executables in the directory of the entry script (if this file is TopCmd.js) for names like:- TopCmd-install.js TopCmd-search.js
 *	Specifying true for opts.noHelp (see noHelp)  will remove the subcommand from the generated help output.
*/

CmdLine
	.version('1.0', '-v, --version')
	.usage('[options] <commands ...>')
	.option('--verbose', 'A value that can be increased by repeating', 0)
	.option('--offline', 'A value that can be increased by repeating', 0)
.command('sdk ...', 'use the ASUX.org interface to AWS CLI (really no good reason to)', { isDefault: false, noHelp: false } )
.command('cfn ...', 'create new cloudformation templates', { isDefault: false, noHelp: false } )
	;

//==========================
// Custom HELP output .. must be before .parse() since node's emit() is immediate

CmdLine.on('--help', function(){
	console.log('')
	console.log('Examples:');
	console.log('  $ %s --help', __filename);
	console.log('  $ %s --verbose aws sdk list-regions', __filename);
	console.log('  $ %s --offline aws cfn .. ..', __filename);
});

//==========================
/* execute custom actions by listening to command and option events.
 */

CmdLine.on('option:verbose', function () {
	console.log("Yeah.  Going verbose" + this.verbose);
	process.env.VERBOSE = this.verbose;
});

CmdLine.on('option:offline', function () {
	if (process.env.VERBOSE) console.log("Yeah.  Going _OFFLINE_ " );
	process.env.OFFLINE = true;
});

CmdLine.on('command:cfn', function () {
	COMMAND="cfn";
	sendArgs2SubModule( DIR_orgASUXAWSCFN );
});

CmdLine.on('command:sdk', function () {
	COMMAND="sdk";
	// console.error( __filename +':\nProcessing ARGS command-line: ', CmdLine.args.join(' ') );
	// console.error( 'Processing FULL command-line: ', process.argv.join(' ') );
	sendArgs2SubModule( DIR_orgASUXAWSSDK ); // <-- defined in org.
});

// Like the 'default' in a switch statement.. .. After all of the above "on" callbacks **FAIL** to trigger, we'll end up here.
// If we end up here, then .. Show error about unknown command
CmdLine.on('command:*', function () {
	console.error( __filename +':\nInvalid command: %s\nSee --help for a list of available commands.', CmdLine.args.join(' '));
	console.error( 'FULL command-line: ', process.argv.join(' ') );
	process.exit(21);
});

//==========================
CmdLine.parse(process.argv);

//============================================================
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//============================================================

// The Node.js process will exit on its own if there is no additional work pending in the event loop.
// The process.exitCode property can be set to tell the process which exit code to use when the process exits gracefully.
process.exitCode = 0;

//EoScript