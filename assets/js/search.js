$(document).ready(function() {
    $('input#search_box').on('keyup', function (evt) {
        $.post({
            url: '/search',
            data: {query: $('input#search_box').val()},
            dataType: 'json',

            success: function(res) {
                $('section#receipt_container').html('')
                res.forEach(receipt => $('section#receipt_container').append(parse_receipt(receipt)))
            },

            err: function(res) {
                console.log(err)
            }
        })
    })
})

function parse_receipt(receipt) {

}