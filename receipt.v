// Item represents one item on a receipt
struct Item {
	price f64
	quantity int = 1
	description string = '(no description provided)'
}

// str_percentage_of calculates what percentage of `x` `item.price` is
// and returns a human friendly string (45% instead of 0.45).
fn (item Item) str_percentage_of(x f64) string {
	return (item.percentage_of(x) * 100).str() + '%'
}

// percentage_of calculates what percentage of `x` `item.price`
// is and returns the percentage as a float
fn (item Item) percentage_of(x f64) f64 {
	return math.round(item.price / x * 10000) / 10000.0
		// 3 / 7 = 0.428571429
		// result * 10000 = 4285.7143
		// round(result) = 4286
		// result / 10000.0 = 0.4286
}

// Receipt is a list of items purchased.
struct Receipt {
	description string = '(no description provided)'
	date time.Time
	taxes f64
	discount f64
	payment_method string = 'Cash'
	items []Item = []Item{}
}

// couldn't figure out a way to implement this in vhtml templates
fn (r Receipt) if_tip_then_percent() string {
	// tips are more likely to be last item on a receipt
	// so we're going to search in reverse order
	for i := r.items.len-1; i >= 0; i-- {
		if r.items[i].description.to_lower() == 'tip' {
			return '(' + r.items[i].str_percentage_of(r.total()) + ')'
		}
	}

	return ''
}

// subtotal returns the total of all items in `Receipt.items`.
fn (r Receipt) subtotal() f64 {
	mut subtotal := f64(0)
	for item in r.items {
		subtotal += item.price * item.quantity
	}
	return subtotal
}

// total returns `Receipt.subtotal()` plus `Receipt.taxes` minus `Receipt.discount`.
fn (r Receipt) total() f64 {
	mut total := r.subtotal()
	total += r.taxes
	total += -r.discount
	return total
}