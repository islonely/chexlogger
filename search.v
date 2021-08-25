import vweb
import sqlite
import json
import time

// ['/search']
// pub fn (mut app App) search_no_query() vweb.Result {
// 	return app.redirect('/')
// }

['/search'; post]
pub fn (mut app App) search() vweb.Result {
	mut db := sqlite.connect(dbfile) or {
		println('Err: Failed to connect to SQLite database. This usually means the .db file is missing or corrupted.')
		exit(1)
	}
	defer {
		db.close() or {
			println('Err: Failed to close database.')
			exit(1)
		}
	}

	mut query := ''
	mut rows := []sqlite.Row{}
	mut err := -1
	if 'all' in app.form {
		query = 'SELECT * FROM receipts ORDER BY date DESC;'
		
	} else {
		query = 'SELECT * FROM receipts WHERE description LIKE \'%' + sql_escape(app.form['query']) + '%\' ESCAPE \'\\\';'
	}

	rows, err = db.exec(query)
	$if debug {
		println(divider)
		println('SQLite Query: $query')
		println('SQLite Response: ' + sqlite_err_to_string(err))
	}
	handle_sqlite_err(err)
	
	mut receipts := parse_rows(db, rows)
	$if debug {
		println(divider)
		println('Receipts from database:\n$receipts')
	}

	return app.json(json.encode_pretty(receipts))
}

fn sql_escape(str string) string {
	return str.replace_each(['\'', '\'\'',
			'"', '\"',
			'\\', '\\\\',
			'%', '\%',
			'_', '\_',
			'\n', '\\n',
			'\r', '\\r',
			byte(0).str(), '\\0',
			'\t', '\\t',
			'\u001A', '\\Z',
			'\b', '\\b'])
}

// parse_rows converts each row/receipts received from SQLite database
// into a corresponding Receit object
fn parse_rows(db sqlite.DB, rows []sqlite.Row) []Receipt {
	mut receipts := []Receipt{}

	for row in rows {
		// items are in a seperate table than receipts so we have to fetch them with another query
		query := 'SELECT * FROM items WHERE receiptid = ' + row.vals[0] + ';'
		item_rows, err := db.exec(query)
		$if debug {
			println(divider)
			println('SQLite Query: $query')
			println('SQLite Response: ' + sqlite_err_to_string(err))
		}
		handle_sqlite_err(err)
		
		// convert []sqlite.Row to []Item
		mut items := []Item{}
		for irow in item_rows {
			item := Item{
				description: irow.vals[1]
				quantity: irow.vals[2].int()
				price: irow.vals[3].f64() / currency_multiplier
			}
			items << item
		}
		
		// convert []sqlite.Row to []Receipt
		mut receipt := Receipt{
			description: row.vals[1]
			date: time.parse(row.vals[2]) or {time.Time{}}
			taxes: row.vals[3].f64() / currency_multiplier
			discount: row.vals[4].f64() / currency_multiplier
			payment_method: row.vals[5]
			items: items
		}
		receipts << receipt
	}

	return receipts
}