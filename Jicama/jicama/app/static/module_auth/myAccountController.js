'use strict';

app.controller('myAccountController', 
['$scope', '$state', '$http', 'authService', 'stripeService', '$uibModal',
function myAccountController($scope, $state, $http, authService, stripeService, $uibModal)
{
    // invoke service to scope
    $scope.stripe   = stripeService.stripeInfo;   // vars for display
    $scope.custPlan = authService.plan;
    $scope.custInfo = authService.stripeInfo;
    
    $scope.display = {
        refreshInProg: false, 
        updatePaymentMethod: false,
        cancelSubscription: false,
        changePassword: false,
        messageFlash: false,
    };
    
    $scope.getAccountInfo = function()
    {
        $scope.display.refreshInProg = true;
        
        authService.getAccountInfo().then(function(){
            $scope.display.refreshInProg = false;
            
            //update $scope
            $scope.custPlan = authService.plan;
            $scope.custInfo = authService.stripeInfo;
            
            if( $scope.custPlan ) {
                if($scope.custPlan.trialing) {
                    $scope.custInfo.trial_end = $scope.convertDateTimeObject( $scope.custInfo.trial_end );
                }
            }
        });
    };
    
    $scope.convertDateTimeObject = function( tmp ){
        var datestr = $scope.convertDateObject( tmp );
        tmp         = new Date(tmp *1000);
        datestr    += ', ' + tmp.getHours() + ':' + tmp.getMinutes() + ':' + tmp.getSeconds();
        return datestr;
    };
    $scope.convertDateObject = function( tmp ) {
        tmp = new Date(tmp *1000);
        var datestr  = (tmp.getMonth()+1) + '/' + tmp.getDate() + '/' + tmp.getFullYear();
        //datestr     += ', ' + tmp.getHours() + ':' + tmp.getMinutes() + ':' + tmp.getSeconds();
        return datestr;
    };
    
    $scope.change_password = function(new_password, new_password2)
    {
        if( (!new_password) || (new_password === "") ){
            $scope.display.messageFlash = "Password cannot be empty."
            return;
        }
        if( !angular.equals(new_password, new_password2) ) {
            $scope.display.messageFlash = "Passwords do not match."
            return;
        }
        
        var changePswdModal = $uibModal.open({
            templateUrl: mpath+'processing.html',
            size: 'md',
            backdrop: 'static',
            keyboard: false,
        });
        $http({
            method: 'POST',
            url: '/change_password',
            data: {new_password: new_password,  user_id: authService.user_id},
            headers: {'Content-Type': 'application/json'},
        }).then(
        function successCallback(response) {

            changePswdModal.close();
            $scope.display.changePassword = false;
            $scope.display.messageFlash = "Password changed!";
            
        }, function errorCallback(response) {
            console.log( response );
            changePswdModal.close();
            $scope.display.changePassword = false;
            $scope.display.messageFlash = "Password change error -- ";
        });
    };
    
    $scope.cancel_subscription = function()
    {
        $scope.display.cancelSubscription = true;
        
        $http.get('/cancel_subscription?user_id=' + authService.user_id)
        .then(function successCallback(response) {
            $scope.cancelSubscriptionModal.close();
            $scope.display.cancelSubscription = false;
            $scope.getAccountInfo();    // refresh account info
            
            console.log( response );
        }, function errorCallback(response) {
            console.log( response );
            
            $scope.cancelSubscriptionModal.close();
            $scope.display.cancelSubscription = false;
        });
    };
    $scope.openCancelSubscriptionModal = function() {
        // Make a modal 
        $scope.cancelSubscriptionModal = $uibModal.open({
            templateUrl: 'static/partials/webpage_auth/cancel.sub.modal.html',
            size: 'md',
            scope: $scope
        });
    };
    
    // ---------------------------------------------------------
    // Stripe update form
    // ---------------------------------------------------------
    $scope.make_stripe_update_form = function()
    {
        $scope.stripe = {
            success: false,
            message: 'Payment successful.',
            
            error: false,
            in_progress: false,
            processed: false
        };
        
        // Add an instance of the card Element into the `card-element` <div>.
        stripeService.cardElement.mount('#card-element');

        // Handle form submission.
        var form = document.getElementById('payment-update-form');
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            stripeService.stripeElement.createToken(stripeService.cardElement).then(function(result) {
                if (result.error) {
                    // Inform the user if there was an error.
                    var errorElement = document.getElementById('card-errors');
                    errorElement.textContent = result.error.message;
                } else {
                    $scope.stripe.in_progress = true;
                    $scope.stripe.processed = false;
                    $scope.stripe.error = false;
                    
                    $scope.stripe.message = "Updating..."
                    
                    $scope.stripe.token = result.token;
                    $scope.stripe.customer_id = authService.user_id;
                    
                    // send result.token to the server 
                    
                    $http({
                        method: 'POST',
                        url: '/stripe-update-pay',
                        headers: {'Content-Type': 'application/json'},
                        data: $scope.stripe
                    }).then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        var data = response.data;
                        //console.log( response.data );
                        
                        $scope.stripe.in_progress = false;
                        $scope.stripe.processed = true;
                        
                        if( data.error ){
                            $scope.stripe.error = true;
                            $scope.stripe.message = data.message;
                        }
                        
                        //stripeService.cardElement.unmount();
                        
                    }, function errorCallback(response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
                }
            });
        });
    };
    //$scope.make_stripe_update_form();
}]);
