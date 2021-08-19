module main

import os
import sqlite
import time
import vweb

const(
	initdb_sql = $embed_file('initdb.sql')
)

struct App {
	vweb.Context
}

fn main() {
	dbinit()

	mut app := &App{}
	app.mount_static_folder_at(os.resource_abs_path('.'), '/')
	vweb.run(app, port)
}

['/index']
pub fn (mut app App) index() vweb.Result {
	println('FILE PATH (' + dbfile() + ')')
	mut db := sqlite.connect(dbfile()) or {
		println('Err: Failed to connect to SQLite database. This usually means the .db file is missing or corrupted.')
		exit(1)
	}
	defer {
		db.close() or {
			println('Err: Failed to close database.')
			exit(1)
		}
	}

	query := 'SELECT * FROM receipts ORDER BY date DESC;'
	rows, err := db.exec(query)
	// ok, notice, warning, done
	$if debug {
		println('SQLite Response: ' + sqlite_err(err))
	}
	if !(err in [0, 27, 28, 101]) {
		exit(1)
	}
	
	mut receipts := parse_rows(db, rows)
	$if debug {
		println(receipts)
	}

	return $vweb.html()
}

['/new']
pub fn (mut app App) new() vweb.Result {
	return $vweb.html()
}

['/new'; post]
pub fn (mut app App) new_entry() vweb.Result {

	return app.redirect('/')
}

fn parse_rows(db sqlite.DB, rows []sqlite.Row) []Receipt {
	mut receipts := []Receipt{}

	for row in rows {
		// items are in a seperate table so we have to fetch them with another query
		query := 'SELECT * FROM items WHERE receiptid = ' + row.vals[0] + ';'
		item_rows, err := db.exec(query)
		$if debug {
			println('SQLite Response: ' + sqlite_err(err))
		}
		if !(err in [0, 27, 28, 101]) {
			exit(1)
		}
		
		// convert []sqlite.Row to []Item
		mut items := []Item{}
		for irow in item_rows {
			item := Item{
				description: irow.vals[1]
				quantity: irow.vals[2].int()
				price: irow.vals[3].f64() / 1000
			}
			items << item
		}
		
		// convert []sqlite.Row to []Receipt
		mut receipt := Receipt{
			description: row.vals[1]
			date: time.parse(row.vals[2]) or {time.Time{}}
			taxes: row.vals[3].f64() / 1000
			discount: row.vals[4].f64() / 1000
			payment_method: row.vals[5]
			items: items
		}
		receipts << receipt
	}

	return receipts
}

fn sqlite_err(n int) string {
	return match n {
		101 {'DONE'}
		16 {'EMPTY'}
		1 {'ERROR'}
		24 {'FORMAT'}
		13 {'FULL'}
		2 {'INTERNAL'}
		9 {'INTERRUPT'}
		10 {'IOERROR'}
		6 {'LOCKED'}
		20 {'MISMATCHED'}
		21 {'MISUSE'}
		22 {'NOLFS'}
		7 {'NOMEM'}
		26 {'NOTADB'}
		12 {'NOTFOUND'}
		27 {'NOTICE'}
		0 {'OK'}
		3 {'PERM'}
		15 {'PROTOCOL'}
		25 {'RANGE'}
		8 {'READONLY'}
		100 {'ROW'}
		17 {'SCHEMA'}
		18 {'TOOBID'}
		28 {'WARNING'}
		else {'UNKNOWN'}
	}
}

fn dbfile() string {
	return if store_local {''} else {os.home_dir() + os.path_separator}  + database_file
}

fn dbinit() {
	cmd := 'sqlite3 ' + dbfile() + ' "' + initdb_sql.to_string() + '"'
	$if debug {
		println(cmd)
	}
	result := os.execute(cmd)
	if result.exit_code != 0 {
		println(result.output)
		println('Cannot continue without database to store receipts in. Exiting...')
		exit(1)
	}
}