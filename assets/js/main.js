function datetime_now() {
    let d = new Date()
    $('input[type="date"]').val(d.toISOString().substring(0,10))
    $('input[type="time"]').val(d.toISOString().substring(11,16))
}

function padDate(n) {
    if (n < 10) return '0' + n
    return n
}

Date.prototype.toSQLString = function() {
    return this.getUTCFullYear() + '-' +
            padDate(this.getUTCMonth() + 1) + '-' +
            padDate(this.getUTCDate()) + ' ' +
            padDate(this.getUTCHours()) + ':' +
            padDate(this.getUTCMinutes()) + ':' +
            padDate(this.getUTCSeconds())
}

String.prototype.containsAny = function(arr) {
    if (arr === undefined) throw new Error('String.prototype.containsAny(arr): arr is undefined.')
    if (arr.constructor !== Array) throw new Error('String.prototype.containsAny(arr): arr is not instance of Array.')

    for (let i = 0; i < arr.length; ++i) {
        if (this.indexOf(arr[i]) > -1) {
            return true
        }   
    }

    return false
}

class Item {
    constructor(json) {
        if (json === undefined) {
            this.price = 0.0
            this.quantity = 1
            this.description = '[no description provided]'
            this.parent = null
        } else if (typeof(json) == 'string') {
            this.fromJSON(json)
        } else if (typeof(json) == 'object') {
            this.fromObject(json)
        } else {
            throw new Error('Invalid argument for `new Item(...)`.')
        }
    }

    fromObject(obj) {
        if (!obj) return

        if (!(('description' in obj) &&
              ('quantity' in obj) &&
              ('price' in obj))) {
            return null
        }

        this.price = obj.price
        this.quantity = obj.quantity
        this.description = obj.description
        this.parent = null
    }

    fromJSON(json) {
        if (!json) return
        let obj = JSON.parse(json)
        this.fromObject(obj)
    }

    total() {
        return this.price * this.quantity
    }

    tip(isTotal=true) {
        return ' (' + Math.round(this.total() / ((isTotal) ? this.parent.total() : this.parent.subtotal()) * 1000) / 10 + '%)'
    }

    html(index) {
        let tip = (!(this.description.toLocaleLowerCase() == 'tip' ||
                   this.description.toLowerCase().containsAny([' tip', ' tip ', 'tip '])))
                   ? '' : this.tip()

        return '\
            <div class="item row mb-2 mb-sm-0 py-25">\
                <div class="d-none d-sm-block col-1">\
                    ' + (index+1) + '\
                </div>\
                <div class="col-9 col-sm-5">' + this.description + '</div>\
                <div class="d-none d-sm-block col-2">' + this.quantity + '</div>\
                <div class="d-none d-sm-block col-2 text-95">\
                    &#36;' + this.price.toFixed(2) + '\
                </div>\
                <div class="col-2 text-secondary-d2">\
                    &#36;' + this.total().toFixed(2) + '\
                    ' + tip + '\
                </div>\
            </div>'
    }
}

class Receipt {
    constructor(json) {
        if (json === undefined) {
            this.description = '[no description provided]'
            this.date = new Date()
            this.taxes = this.discount = 0.0
            this.payment_method = 'Cash'
            this.items = new Array()
        } else if (typeof(json) == 'string') {
            this.fromJSON(json)
        } else if (typeof(json) == 'object') {
            this.fromObject(json)
        } else {
            throw new Error('Invalid argument for `new Receipt(...)`.')
        }
    }

    fromObject(obj) {
        if (!obj) return

        if (!(('description' in obj) &&
              ('date' in obj) &&
              ('taxes' in obj) &&
              ('discount' in obj) &&
              ('payment_method' in obj) &&
              ('items' in obj))) {
            return null
        }

        this.description = obj.description
        this.date = new Date(obj.date * 1000)
        this.taxes = obj.taxes
        this.discount = obj.discount
        this.payment_method = obj.payment_method
        
        this.items = new Array()
        obj.items.forEach(item => {
            let toPush = new Item(item)
            toPush.parent = this
            this.items.push(toPush)
        })
    }

    fromJSON(json) {
        if (!json) return
        let obj = JSON.parse(json)
        this.fromObject(obj)
    }

    subtotal() {
        let total = 0.0
        this.items.forEach(item => total += item.total())
        return total
    }

    total() {
        return this.subtotal() + this.taxes - this.discount
    }

    html() {
        let items_html = ''
        for (let i = 0; i < this.items.length; ++i) {
            items_html += this.items[i].html(i)
        }

        let discount_html = (!(this.discount > 0)) ? '' : '\
            <div class="row my-2">\
                <div class="col-7 text-right">\
                    Discount\
                </div>\
                <div class="col-5">\
                    <span class="text-120 text-muted">\
                        &#36;' + this.discount + '\
                    </span>\
                </div>\
            </div>'

        return '\
            <div class="receipt mt-4 bg-light">\
                <div class="row text-600 text-white bg-danger py-25">\
                    <div class="d-none d-sm-block col-1">#</div>\
                    <div class="col-9 col-sm-5">Description</div>\
                    <div class="d-none d-sm-block col-4 col-sm-2">Qty</div>\
                    <div class="d-none d-sm-block col-sm-2">Unit Price</div>\
                    <div class="col-2">Amount</div>\
                </div>\
                <div class="text-95 text-secondary-d3">\
                        ' + items_html + '\
                </div>\
                <div class="row mt-3">\
                    <div class="col-12 col-sm-7 text-grey-d2 text-95 mt-2 mt-lg-0">\
                        <p>' + this.description + '</p>\
                        <small style="position: absolute; bottom: 7px;" class="d-none text-muted">\
                            ' + this.date.toSQLString() + '\
                        </small>\
                    </div>\
                    <div class="col-12 col-sm-5 text-grey text-90 order-first order-sm-last">\
                        <div class="row my-2">\
                            <div class="col-7 text-right">\
                                Subtotal\
                            </div>\
                            <div class="col-5">\
                                <span class="text-120 text-muted">\
                                    &#36;' + this.subtotal().toFixed(2) + '\
                                </span>\
                            </div>\
                        </div>\
                        ' + discount_html + '\
                        <div class="row my-2">\
                            <div class="col-7 text-right">\
                                Tax\
                            </div>\
                            <div class="col-5">\
                                <span class="text-110 text-muted">\
                                    &#36;' + this.taxes.toFixed(2) + '\
                                </span>\
                            </div>\
                        </div>\
                        <div class="row my-2 align-items-center bgc-primary-l3 p-2" id="total">\
                            <div class="col-7 text-right">\
                                Total\
                            </div>\
                            <div class="col-5">\
                                <span class="text-150 text-success-d3 opacity-2">\
                                    &#36;' + this.total().toFixed(2) + '\
                                </span>\
                                ~' + this.payment_method + '\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>'
    }
}