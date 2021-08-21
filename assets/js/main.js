let item_index = 1;
const fill_item_description = $('#fill_item_description').val()
const fill_item_quantity = $('#fill_item_quantity').val()
const fill_item_price = $('#fill_item_price').val()
function add_item(elem) {
    $('\
        <div class="row g-3">\
            <div class="col-md-7 mt-2">\
                <input class="form-control" placeholder="Description" name="item_description_' + item_index + '" value="' + fill_item_description + '">\
            </div>\
            <div class="col-md-2 mt-2">\
                <input class="form-control" placeholder="Quantity" name="item_quantity_' + item_index + '" value="' + fill_item_quantity + '" required>\
            </div>\
            <div class="col-md-2 mt-2">\
                <input class="form-control" placeholder="Price" name="item_price_' + item_index + '" value="' + fill_item_price + '" required>\
            </div>\
            <div class="col-md mt-2">\
                <button onclick="add_item(this)" type="button" class="form-control btn btn-danger">Add</button>\
            </div>\
        </div>\
    ').insertAfter($(elem).parent().parent())
    $(elem).replaceWith('<button onclick="del_item(this)" type="button" class="form-control btn btn-danger">Del</button>')
    item_index++
}

function del_item(elem) {
    $(elem).parent().parent().remove()
}

function check_if_currency(item) {
    let regex_currency = /(?=.)^\$?(([1-9][0-9]{0,2}(,?[0-9]{3})*)|0)?(\.[0-9]{1,2})?$/
    if (!$(item).val().match(regex_currency)) {
        $(item).removeClass('is-valid valid-field')
        $(item).addClass('is-invalid invalid-field')
        return false
    } else {
        $(item).removeClass('is-invalid invalid-field')
        $(item).addClass('is-valid valid-field')
        $(item).val($(item).val().replace('$', '').split(',').join(''))
        return true
    }
}

$(document).ready(function() {
    let form = document.getElementById('new_receipt_form')
    $(form).on('submit', function(evt) {
        let is_valid = true
        let data = $(form).serializeArray()
        data.forEach(field => {
            switch (field.name) {
                case 'description':
                    if (!field.value) {
                        $('textarea[name="description"]').text('[no description provided]')
                    }
                    break
                case 'discount':
                case 'taxes':
                    let $in = $('input[name="' + field.name + '"]')
                    if (!field.value) $in.val('0.00')

                    let local_is_valid = check_if_currency($in)
                    if (!local_is_valid) is_valid = false
                    break
                case 'payment_method':
                    if (!field.value) {
                        $('input[name="payment_method"]').val('Cash')
                    }
                    break
                default:
                    if (field.name.startsWith('item_description_') && !field.value) {
                        $('input[name="' + field.name + '"]').val('[no description provided]')
                    } else if (field.name.startsWith('item_quantity_')) {
                        if (!field.value) {
                            is_valid = false
                            $('input[name="' + field.name + '"]').removeClass('is-valid valid-field')
                            $('input[name="' + field.name + '"]').addClass('is-invalid invalid-field')
                        } else if (+field.value === +field.value) {
                            if (parseInt(field.value) < 1) {
                                is_valid = false
                                $('input[name="' + field.name + '"]').removeClass('is-valid valid-field')
                                $('input[name="' + field.name + '"]').addClass('is-invalid invalid-field')
                            } else {
                                $('input[name="' + field.name + '"]').removeClass('is-invalid invalid-field')
                                $('input[name="' + field.name + '"]').addClass('is-valid valid-field')
                            }
                        } else {
                            is_valid = false
                            $('input[name="' + field.name + '"]').removeClass('is-valid valid-field')
                            $('input[name="' + field.name + '"]').addClass('is-invalid invalid-field')
                        }
                    } else if (field.name.startsWith('item_price_')) {
                        if (!field.value) is_valid = false
                        let local_is_valid = check_if_currency(document.getElementsByName(field.name)[0])
                        if (!local_is_valid) is_valid = false
                    }
            }
        })

        form.classList.add('was-validated')
        if (is_valid) {
            return true
        } else {
            evt.preventDefault()
            evt.stopPropagation()
            return false
        }
    })

    datetime_now()
    $('button#datetime_now').on('click', datetime_now)
})

function datetime_now() {
    let d = new Date()
    $('input[type="date"]').val(d.toISOString().substring(0,10))
    $('input[type="time"]').val(d.toISOString().substring(11,16))
}