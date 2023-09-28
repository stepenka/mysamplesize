
sendHeight = function()
{
    var retHeight = $('body').height()
    var refUrl = document.referrer;
    
    //console.log( 'shiny height: ' + retHeight )
    parent.postMessage(retHeight, refUrl);
}

$(document).ready(function()
{
    $(document).on("change", 'body', function()
    {
        console.log( 'onchange' )
        sendHeight();
    });
    $(document).on("click", 'body', function()
    {
        console.log( 'onclick' )
        sendHeight();
    });
});


window.onload = function()
{
    sendHeight();
    
    // every 1000 ms (1 s), update height
    setTimeout(function(){
        $(document).trigger('change')   //trigger change for parent detection
        sendHeight();
    }, 5000);
}
