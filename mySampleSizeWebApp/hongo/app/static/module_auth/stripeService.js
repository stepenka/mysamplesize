'use strict';

app.service('stripeService', ['authService', '$uibModal',
function stripeService(authService, $uibModal)
{
    this.info = {};
    
    this.resetInfo = function(){
        this.info = {
            email: '',
            password: '',
            name: '',
            affiliation: '',
            phone: '',
            token: '',
            success: false,
            message: 'Payment successful.',
            
            display_price: 2000,
            license_code: null,
            coupon_selected: false,
            
            tab_selected: 0,
            
            quantity: 1,
            selected_plan_id: '',
            
            subscription: {
                interval: 'month',
                amount: 3000,
                id: '',
            },
            
            group: {
                plan: {tiers: [{amount:2000}] },
                price: 2000,
            },
            
            error: false,
            in_progress: false,
            processed: false
        };
        
        if( authService.authenticated )
            this.info.email = authService.email;
    };
    this.resetInfo();
    
    // placeholder until AJAX request loaded
    this.stripe_plans = [this.info.subscription];

    this.updateFinalPrice = function(tmp) {
        this.info.coupon_selected = false;
        if( tmp ) {
            this.info.display_price = tmp;
        } else {
            this.info.display_price = this.info.subscription.amount;
        }
    };
    
    this.initSingleUserInfo = function() {
        this.info.quantity          = 1;
        this.info.subscription      = this.stripe_plans[0];    // set a current index
        this.info.selected_plan_id  = this.info.subscription.id;
        
        this.updateFinalPrice( this.info.subscription.amount );
    };
    
    this.updateGroupPrice = function() {
        this.info.selected_plan_id = this.info.group.plan.id;
        
        var quantity = this.info.quantity;
        var tiers = this.info.group.plan.tiers;
        var tiered_price = tiers[0].unit_amount;
        
        for(var ii=0; ii<tiers.length; ii++){
            if( quantity <= tiers[ii].up_to  ){
                tiered_price = tiers[ii].unit_amount;
                break;
            }
            tiered_price = tiers[ii].unit_amount;
        }
        
        this.info.group.price = tiered_price * quantity;
        this.updateFinalPrice( this.info.group.price );
    };
    
    function createElement(stripeService) {
        // Custom styling can be passed to options when creating an Element.
        // (Note that this demo uses a wider set of styles than the guide below.)
        var style = {
            base: {
                color: '#32325d',
                lineHeight: '18px',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                  color: '#c5c5c5'      // for background of credit card field
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        };
        
        // Create an instance of Elements.
        var stripeTest  = 'pk_test_Td9lBt0smxltYrCM566Ivqod';   // use this for beta site
        var stripeLive  = 'pk_live_8vn865K8DkJmZP106wPUBEHS';   // use this for live site
        
        var stripe      = Stripe( stripeLive );
        var elements    = stripe.elements();
        
        // Create an instance of the card Element.
        var card        = elements.create('card', {style: style});
        
        // Handle real-time validation errors from the card Element.
        card.addEventListener('change', function(event) {
            var displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
        
        stripeService.cardElement   = card;
        stripeService.stripeElement = stripe;
    };
    
    this.cardElement = '';
    this.stripeElement = '';

    createElement(this);
}]);
