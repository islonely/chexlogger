$(document).ready(function() {
    $('input#search_box').on('keyup', function (evt) {
        $.post({
            url: '/search',
            data: {query: $('input#search_box').val()},
            dataType: 'json',

            success: function(res) {
                $('section#receipt_container').html(parseReceipts(res))
            },

            err: function(res) {
                console.log(res)
            }
        })
    })
})

function parseReceipts(receipts) {
    let html = ''
    receipts.forEach(receipt => html += new Receipt(receipt).html())
    return html
}

function index() {
    $.post({
        url: '/search',
        data: {all: true},
        dataType: 'json',

        success: function(res) {
            $('section#receipt_container').html(parseReceipts(res))
        },

        err: function(res) {
            console.log(res)
        }
    })
}