Shiny.addCustomMessageHandler('flash', function(params) {
    var mess = $('<div class=\"alert alert-' + params.type + ' fade in\">' + params.message + '</div>');
    var $container = $($('.flash-container')[0]);
    $container.prepend(mess);
    mess.hide().delay(300).slideDown(100);
    mess.alert();
    setTimeout(function() { mess.alert('close'); }, 3000);
})