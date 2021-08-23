function datetime_now() {
    let d = new Date()
    $('input[type="date"]').val(d.toISOString().substring(0,10))
    $('input[type="time"]').val(d.toISOString().substring(11,16))
}

class Item {
    constructor() {
        this.price = 0.0
        this.quantity = 1
        this.description = '[no description provided]'
    }

    constructor(json) {
        this.fromJSON(json)
    }

    constructor(obj) {
        this.fromObject(obj)
    }

    fromJSON(json) {
        this.fromObject(JSON.parse(obj))
    }

    fromObject(obj) {

    }
}

class Receipt {
    constructor() {
        this.description = '[no description provided]'
        this.date = new Date()
        this.taxes = this.discount = 0.0
        this.payment_method = 'Cash'
        this.items = []
    }

    constructor(json) {
        this.fromJSON(json)
    }

    constructor(obj) {
        this.fromObject(obj)
    }

    fromJSON(json) {
        this.fromArray(JSON.parse(json))
    }

    fromObject(obj) {
        if (!(('description' in obj) ||
              ('date' in obj) ||
              ('taxes' in obj) ||
              ('discount' in obj) ||
              ('payment_method' in obj) ||
              ('items' in obj))) {
            return null
        }

        this.description = obj.description
        this.date = new Date(obj.date)
        this.taxes = obj.taxes
        this.discount = obj.discount
        this.payment_method = obj.payment_method
        
        this.items = []
        for (let item in obj.items) {
            this.items.push(new Item(item))
        }
    }
}