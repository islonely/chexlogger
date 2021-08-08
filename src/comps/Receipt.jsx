import 'bootstrap/dist/css/bootstrap.min.css';
// import $ from 'jquery';
// import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '../css/Receipt.css';

// Represents a single item on a receipt.
class Item {
    constructor(description='', price=0, qty=1) {
        this.price = price;
        this.qty = qty;
        this.description = description;
    }

    serialize() {
        return this.description + ',' + this.price + ',' + this.qty;
    }

    unserialize(data) {
        if (data === undefined) {
            console.error('Error: Parameter \'data\' required in Item.unserialize(data).');
            return;
        }

        let splitData = data.split(',');
        splitData.forEach((i,k) => splitData[k] = i.trim());
        this.description = splitData[0];
        this.price = splitData[1];
        this.qty = splitData[2];
    }
}

// An extension of Item to represent a tip on an item.
class Tip extends Item {
    constructor(price) {
        super('Tip', price);
    }

    percentageOf(x) {
        return (Math.round(this.price / x / 100) * 100).toFixed(2);
    }
}

// Contains all the valuable information for a checkbook on a standard receipt.
function Receipt(receiptInfo) {
    if (receiptInfo.taxes === undefined ||
        receiptInfo.items === undefined ||
        receiptInfo.description === undefined)
        { return (<h3>Error in call to Receipt(...).</h3>) }
    
    if (receiptInfo.discount === undefined) {
        receiptInfo.discount = 0;
    }

    let itemBuffer = [];    // contains individual items on receipt
    let subtotal = 0.0;     // the price of all the items before fees and taxes are added
    for (let i = 0; i < receiptInfo.items.length; i++) {
        // alternate colors between each receipt item
        let isBlueBg = (i % 2 == 0) ? 'row mb-2 mb-sm-0 py-25 bgc-default-l4' : 'row mb-2 mb-sm-0 py-25';
        // the amount you pay for X amount of items.
        let totalAmount = receiptInfo.items[i].qty * receiptInfo.items[i].price;

        itemBuffer.push(
            // OLD: This shouldn't be needed, but I'll keep it here just in case.
            // <div className="receipt-item">
            //     <div className="receipt-item-name">{receiptInfo.items[i].name}</div>
            //     <div className="receipt-item-description">{receiptInfo.items[i].description}</div>
            //     <div className="receipt-item-price">${receiptInfo.items[i].price}</div>
            // </div>

            <div className={isBlueBg} key={i}>
                <div className="d-none d-sm-block col-1">{i+1}</div>
                <div className="col-9 col-sm-5">{receiptInfo.items[i].description}</div>
                <div className="d-none d-sm-block col-2">{receiptInfo.items[i].qty}</div>
                <div className="d-none d-sm-block col-2 text-95">${receiptInfo.items[i].price.toFixed(2)}</div>
                <div className="col-2 text-secondary-d2">${totalAmount.toFixed(2)}</div>
            </div>
        );

        subtotal += totalAmount;    // add price of this Item to subtotal 
    }

    // if discount == 0 then don't display the discount price in the receipt
    let discount = (receiptInfo.discount <= 0) ? '' : (
        <div className="row my-2">
            <div className="col-7 text-right">
                Discount
            </div>
            <div className="col-5">
                <span className="text-120 text-secondary-d1">${receiptInfo.discount.toFixed(2)}</span>
            </div>
        </div>
    );

    // the total cost of your purchase; subtotal-discount+taxes
    let total = (subtotal - receiptInfo.discount) + receiptInfo.taxes;

    return (
        <div className="mt-4">
            <div className="row text-600 text-white bgc-default-tp1 py-25">
                <div className="d-none d-sm-block col-1">#</div>
                <div className="col-9 col-sm-5">Description</div>
                <div className="d-none d-sm-block col-4 col-sm-2">Qty</div>
                <div className="d-none d-sm-block col-sm-2">Unit Price</div>
                <div className="col-2">Amount</div>
            </div>

            <div className="text-95 text-secondary-d3">
                {itemBuffer}
            </div>

            <div className="row border-b-2 brc-default-l2"></div>

            <div className="row mt-3">
                <div className="col-12 col-sm-7 text-grey-d2 text-95 mt-2 mt-lg-0">
                    {receiptInfo.description}
                </div>

                <div className="col-12 col-sm-5 text-grey text-90 order-first order-sm-last">
                    <div className="row my-2">
                        <div className="col-7 text-right">
                            Subtotal
                        </div>
                        <div className="col-5">
                            <span className="text-120 text-secondary-d1">${subtotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {discount}

                    <div className="row my-2">
                        <div className="col-7 text-right">
                            Tax
                        </div>
                        <div className="col-5">
                            <span className="text-110 text-secondary-d1">${receiptInfo.taxes.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="row my-2 align-items-center bgc-primary-l3 p-2" id="total">
                        <div className="col-7 text-right">
                            Total
                        </div>
                        <div className="col-5">
                            <span className="text-150 text-success-d3 opacity-2">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Item, Tip };
export default Receipt;