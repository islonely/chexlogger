/*
 *	This is the configuration file for Chexlogger. It's similar to a conf.json
 *	file, but I was to lazy to program one in since V doesn't have globals.
 */

const(
	// the port which the local server will be run on
	// this doesn't matter as long as you choose a port that's
	// not already in use on your system
	// this can be values between 1 and 65535
	port = 4444

	// the file where your receipts are stored. If you wish to create a
	// new database change this filename
	dbfile = 'personal.db'

	// default values to autofill new receipt form with
	auto_form_fill_description = ''
	auto_form_fill_payment_method = ''
	auto_form_fill_discount = ''
	auto_form_fill_taxes = ''
	auto_form_fill_item_description = ''
	auto_form_fill_item_quantity = ''
	auto_form_fill_item_price = ''

	// ui theme
	// values include red, yellow, blue, green, cyan
	// NOTE: currently does nothing
	theme = 'red'
)