'use strict';

app.controller('stripeController', 
['$scope', '$http', '$uibModal', 'stripeService', 'authService', '$timeout',
function stripeController($scope, $http, $uibModal, stripeService, authService, $timeout)
{
    // invoke service to scope
    $scope.stripe       = stripeService;
    $scope.authService  = authService;
    
    $scope.submit_display = "Submit";
    
    $scope.currentEventListener = function(){};
    
    var newEventListener_paymentToken = function(event) {
        event.preventDefault();
        
        $scope.stripe.info.in_progress = true;
        
        stripeService.stripeElement.createToken(stripeService.cardElement).then(function(result) {
            if (result.error) {
                // Inform the user if there was an error.
                var errorElement = document.getElementById('card-errors');
                errorElement.textContent = result.error.message;
                
                $scope.stripe.info.in_progress = false;

            } else {
                processStripe(result);
            }
        });
    };
    
    var replaceEventListener = function(newEventListener){
        console.log("replacing event listener");
        var form = document.getElementById('payment-form');
        form.removeEventListener('submit', $scope.currentEventListener);
        form.addEventListener('submit', newEventListener);
        $scope.currentEventListener = newEventListener;
    };
    
    // make Stripe element form
    //stripeService.make_stripe_element();

    $scope.stripe.info.tab_selected = 0;
    
    $scope.$watch('stripe.info.tab_selected', function(){
        $scope.stripe.info.coupon_selected = false;
        if( $scope.stripe.info.tab_selected == 1 ) {    // yearly license tab
            replaceEventListener( newEventListener_paymentToken );
            $scope.submit_display = "pay";
        }
        
        // if NOT the "Yearly Subscription" tab, insert special event listener
        // this should only apply for when signed out
        if( !authService.authenticated && ($scope.stripe.info.tab_selected !== 1) ) {
            $scope.stripe.info.coupon_selected = true;
            
            var newEventListener = function(event) {
                event.preventDefault();
                
                processStripe(null);
            };
            
            replaceEventListener(newEventListener);
        }
        else {
            $scope.stripe.info.license_code = null;
        }
    });

    $scope.stripe.resetInfo();
    $scope.stripe.initSingleUserInfo();
    
    // not used yet, but setting up so new user can enter a coupon before sign up
    $scope.coupon = {
        waiting: false, 
        id:'',
        data: {error:false, message:''},
        
        get: function(id) {
            $scope.coupon.waiting = true;
            
            $http({
                method: 'GET',
                url: '/get_coupon' + '?id=' + id,
            }).then(function successCallback(response) {
                $scope.coupon.waiting = false;
                $scope.coupon.data = response.data;
                
            }, function errorCallback(response){
                $scope.coupon.waiting = false;
                $scope.coupon.data = response.data;
            });
        },
    };
    
    function resetCouponData() {
        $scope.coupon.waiting = false;
        $scope.coupon.id = '';
        $scope.coupon.data = {error:false, message:''};
    };
    
    $scope.$watch('coupon.data', function(){
        if( $scope.coupon.data.error ){
            $timeout(function(){
                resetCouponData();
            }, 2000);
        }
    });
    
    //------------------------------------------------
    // get all potential plans
    $http({
        method: 'GET',
        url: '/get_stripe_plans',
        headers: {'Content-Type': 'application/json'},
    }).then(function successCallback(response) {

        $scope.stripe.stripe_plans = response.data;
        
        $scope.stripe.info.group.plan = $scope.stripe.stripe_plans[2];      // better way to do this instead of hard-code index?
        
        // For the group plan, add a label for the "null" amount (i.e. inf)
        var tiers = $scope.stripe.info.group.plan.tiers;
        tiers[tiers.length-1].up_to = tiers[tiers.length-2].up_to+1 + '+';
        
        $scope.stripe.stripe_plans.pop();    // remove group plan from display
        $scope.stripe.stripe_plans.pop();    // remove single-user monthly plan from display
        $scope.stripe.initSingleUserInfo();
        
        $scope.stripe.info.quantity = tiers[0].up_to;
        
        //console.log( $scope.stripe );
    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });
    
    //------------------------------------------------
    $scope.make_stripe_element = function() {
        
        // Add an instance of the card Element into the `card-element` <div>.
        stripeService.cardElement.mount('#card-element');
        
        // Handle form submission.        
        
        replaceEventListener(newEventListener_paymentToken);
    };

    function processStripe(result)
    {
        $scope.stripe.info.in_progress = true;
        $scope.stripe.info.processed = false;
        $scope.stripe.info.error = false;
        $scope.stripe.info.message = "Processing...";
        
        if( result )
            $scope.stripe.info.token = result.token;
        
        // Make a modal 
        var processModalInstance = $uibModal.open({
            templateUrl: mpath+'processing.html',
            size: 'md',
            scope: $scope,
            backdrop: 'static',
            keyboard: false,
        });
    
        var payment_url = '/stripe-pay-new-account';
        if( authService.authenticated ){
            payment_url = '/stripe-pay-existing-customer'
            $scope.stripe.info.customer_id = authService.customer_id;
        }
        
        // send result.token to the server 
        $http({
            method: 'POST',
            url: payment_url,
            headers: {'Content-Type': 'application/json'},
            data: $scope.stripe.info
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.stripe.info.in_progress = false;      // for display purposes only
            
            var resp = response.data;
            
            authService.stripeInfo = resp;
            
            $scope.stripe.info.message = resp.message;
            
            //console.log( resp );
            //console.log( $scope.stripe.info );
            
            if( resp.error === false )    // all went well
            {
                if( $scope.stripe.info.message.license ) {
                    $scope.stripe.info.license_code = $scope.stripe.info.message.license;
                }
                
                $scope.stripe.info.processed = true;
            } else {                                // there is an error
                $scope.stripe.info.error = true;
            }
            processModalInstance.close();
            
            //stripeService.cardElement.unmount();
            
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            processModalInstance.close();
        });
    };
}]);
