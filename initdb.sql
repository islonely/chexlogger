CREATE TABLE IF NOT EXISTS receipts(
    id INTEGER PRIMARY KEY NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    taxes INTEGER NOT NULL,
    discount INTEGER NOT NULL,
    payment_method TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS items(
    id INTEGER PRIMARY KEY NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price INTEGER NOT NULL,
    receiptid INTEGER NOT NULL
);