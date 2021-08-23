import sqlite
import time
import vweb

const(
	initdb_sql = $embed_file('initdb.sql')
	currency_multiplier = 1000
	divider = '=================================='
)

struct App {
	vweb.Context
}

fn main() {
	mut app := &App{}
	vweb.run(app, port)
}

pub fn (mut app App) before_request() {
	app.mount_static_folder_at('./assets/fonts', '/')
	app.mount_static_folder_at('./assets/css', '/')
	app.mount_static_folder_at('./assets/js', '/')
}

['/index']
pub fn (mut app App) index() vweb.Result {
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

	query := 'SELECT * FROM receipts ORDER BY date DESC;'
	rows, err := db.exec(query)
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

	return $vweb.html()
}

['/new']
pub fn (mut app App) new() vweb.Result {
	fill_description := auto_form_fill_description
	fill_discount := auto_form_fill_discount
	fill_taxes := auto_form_fill_taxes
	fill_payment_method := auto_form_fill_payment_method
	fill_item_description := auto_form_fill_item_description
	fill_item_quantity := auto_form_fill_item_quantity
	fill_item_price := auto_form_fill_item_price

	return $vweb.html()
}

['/new'; post]
pub fn (mut app App) new_entry() vweb.Result {
	$if debug {
		println(divider)
		println('New receipt POST values:\n')
		println(app.form)
	}

	mut receipt := Receipt{}
	for key, _ in app.form {
		match key {
			'description' {
				receipt.description = app.form['description']
			}
			'date' {
				datetime := app.form['date'] + ' ' + app.form['time'] + ':00'
				receipt.date = time.parse(datetime) or {
					println('Err: Invalid datetime provided. This should never happen.')
					return app.redirect('/new')
				}
			}
			'discount' {
				receipt.discount = app.form['discount'].f64()
			}
			'taxes' {
				receipt.taxes = app.form['taxes'].f64()
			}
			'payment_method' {
				receipt.payment_method = app.form['payment_method']
			}
			else {
				if key.starts_with('item_description_') {
					tmp := key.split('_')
					i := tmp[2].int()

					receipt.items << Item{
						description: app.form['item_description_$i']
						price: app.form['item_price_$i'].f64()
						quantity: app.form['item_quantity_$i'].int()
					}
				} else if key == 'time'
							|| key.starts_with('item_price_')
							|| key.starts_with('item_quantity_') {
					// these items are handled in the above statement
					continue
				} else {
					println('Err: invalid post request')
					return app.redirect('/new')
				}
			}
		}
	}

	$if debug {
		println(divider)
		println('Receipt from form data:\n$receipt')
	}

	insert_receipt_into_database(receipt)

	return app.redirect('/')
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

fn insert_receipt_into_database(receipt Receipt) {
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

	receipt_query := 'INSERT INTO receipts (description, date, taxes, discount, payment_method) VALUES ("$receipt.description", "' + receipt.date.str() + '", ' + (receipt.taxes * currency_multiplier).str() + ', ' + (receipt.discount * currency_multiplier).str() + ', "' + receipt.payment_method + '");'
	err := db.exec_none(receipt_query)
	$if debug {
		println(divider)
		println('SQLite Query: $receipt_query')
		println('SQLite Response: ' + sqlite_err_to_string(err))
	}

	receiptid := db.last_insert_rowid()

	for item in receipt.items {
		item_query := 'INSERT INTO items (description, quantity, price, receiptid) VALUES ("$item.description", $item.quantity, ' + (item.price * currency_multiplier).str() + ', $receiptid);'
		item_err := db.exec_none(item_query)
		$if debug {
			println(divider)
			println('SQLite Query: $receipt_query')
			println('SQLite Response: ' + sqlite_err_to_string(item_err))
		}
	}
}

// sqlite_err_to_string converts an SQLite error number into a
// human readable string
fn sqlite_err_to_string(n int) string {
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

[inline]
fn handle_sqlite_err(err int) {
	// unless the user messes with the database file this should
	// theoretically never happen. Hence the _unlikely_()
	// ok, notice, warning, done
	if _unlikely_(!(err in [0, 27, 28, 101])) {
		exit(1)
	}
}