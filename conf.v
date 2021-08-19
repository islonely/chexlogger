/*
 *	This is the configuration file for Chexlogger. It's similar to a conf.json
 *	file, but I was to lazy to program one in since V doesn't have globals.
 */

const(
	// the precision of currency stored into database
	// 0: only calculate full dollars
	// 2: the hundredth of a dollar 2.51
	// 5: the hundred-thousandth of a dollar 2.51234
	// this should only be values 0 to 15 (see: https://stackoverflow.com/a/28047413)
	// values below 0 will cause the program to stop working
	// values above 15 will have the same effect as 15
	// WARNING: This is not working properly yet, so leave it at 2 for now
	currency_precision = 2

	// the port which the local server will be run on
	// this doesn't matter as long as you choose a port that's
	// not already in use on your system
	// this can be values between 1 and 65535
	port = 4444

	// this is the name of the sqlite database file
	database_file = 'chexlogger.db'
	// this will determine whether to store the .db file in /home/<user>/.local/share/chexlogger
	// or in the same directory as the chexlogger application
	store_local = true
)