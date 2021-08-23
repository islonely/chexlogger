import vweb
import sqlite
import json

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

	query := 'SELECT * FROM receipts WHERE description LIKE \'%' + app.form['query'] + '%\';'
	rows, err := db.exec(query)
	$if debug {
		println(divider)
		println('SQLite Query: $query')
		println('SQLite Response: ' + sqlite_err_to_string(err))
		println(rows)
	}
	handle_sqlite_err(err)
	
	mut receipts := parse_rows(db, rows)
	$if debug {
		println(divider)
		println('Receipts from database:\n$receipts')
	}

	return app.json(json.encode_pretty(receipts))
}