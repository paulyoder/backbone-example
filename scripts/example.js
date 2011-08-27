$(function() {
  $('.quantity, .price').keyup(function() {
    calculateAmount($(this).closest('tr')); 
  }); 
  $('.amount').keypress(function() {
    clearQuantityAndPrice($(this).closest('tr'));
  });
}); 

function calculateAmount($row) {
  var quantity = $row.find('input.quantity').val();
  var price = $row.find('input.price').val();
  var amount = quantity * price
  $row.find('input.amount').val(amount);
}

function clearQuantityAndPrice($row) {
  $row.find('input.quantity').val('');
  $row.find('input.price').val('');
}
