
import stripe           # payment processor
from app_context import app_warn

stripe_exceptions = (stripe.error.CardError,
                    stripe.error.RateLimitError,
                    stripe.error.InvalidRequestError,
                    stripe.error.AuthenticationError,
                    stripe.error.APIConnectionError);

stripeTest = 0;
if stripeTest:
    # STRIPE test
    stripe_keys = {
      'secret_key': 'sk_test_wXDxOgHQ1ZOUF3LrFlluU94c',
      'publishable_key': 'pk_test_Td9lBt0smxltYrCM566Ivqod'
    }

    # hard-coded plan IDs ---
    STRIPE_PLANS = {"monthly": "plan_Cx4w0uXoldwbML",
                    "yearly": "plan_DNh27AMx5hkwMz",
                    "group_yearly": "plan_FKPypJomJgmmsV"};
else:
    # STRIPE live
    stripe_keys = {
      'secret_key': 'sk_live_fGYc6bi2NVBebCSFatCNJBUs',
      'publishable_key': 'pk_live_8vn865K8DkJmZP106wPUBEHS'
    }

    # hard-coded plan IDs ---
    STRIPE_PLANS = {"monthly": "plan_DQM8CT7o0UKehy",
                    "yearly": "plan_DQMAzwGaUFjBFd",
                    "group_yearly": "plan_DQMKHWmLcc6G8r"};

stripe.api_key = stripe_keys['secret_key']

def create_customer(email, token_id=None):

    retval = {"error": False, "message": 'Customer created'}
    
    try:
        if token_id:
            resp = stripe.Customer.create(
                email=email,
                source=token_id         # obtained with Stripe.js
            )
        else:
            resp = stripe.Customer.create(
                email=email
            )
        
        retval["message"] = resp.to_dict()
        return retval
    except stripe_exceptions as e:
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except stripe.error.StripeError as e:
        # Display a very generic error to the user, and maybe send
        # yourself an email
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except Exception as e:
        # Something else happened, completely unrelated to Stripe
        retval["message"] = "Error unrelated to Stripe."
        retval["error"] = e
        
    return retval

def create_subscription(customer_id, PLAN_ID, quantity, trialing=True):
    retval = {"error": False, "message": 'Customer created'}

    try:
        resp = stripe.Subscription.create(
            customer=customer_id,
            billing="charge_automatically",
            items=[{
                "plan": PLAN_ID,
                "quantity": quantity,
            }],
            trial_from_plan=trialing        # required to apply the default trial period 
        )
        retval["message"] = resp.to_dict()
        
        # if specifically on the tiered payment plan, create license codes aka coupons
        if (PLAN_ID == STRIPE_PLANS["group_yearly"]) and (quantity > 1):
            coupon = stripe.Coupon.create(
                percent_off=100.0,
                duration="repeating",
                duration_in_months=12,
                max_redemptions=quantity
                #add a redeem_by Unix timestamp to redeem by the end of the subscription date (1 year)
            )
            #app_warn(coupon);
            
            # add this license to the customer's metadata
            cust = stripe.Customer.retrieve(customer_id)
            cust.metadata = {"license": coupon.id}
            cust.save()
            
            retval["message"]["license"] = coupon.id
            
        return retval
        
    except stripe_exceptions as e:
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except stripe.error.StripeError as e:
        # Display a very generic error to the user, and maybe send
        # yourself an email
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except Exception as e:
        # Something else happened, completely unrelated to Stripe
        retval["message"] = "Error unrelated to Stripe."
        retval["error"] = e
        
    return retval

def create_subscription_from_coupon(customer_id, PLAN_ID, coupon_code):
    retval = {"error": False, "message": 'Customer created'}
    
    try:
        # create subscription for this customer with the coupon applied
        resp = stripe.Subscription.create(
            customer=customer_id,
            billing="charge_automatically",
            items=[{
                "plan": PLAN_ID,
            }],
            coupon=coupon_code
        )
        
        retval["message"] = resp.to_dict()
        
        return retval
        
    except stripe_exceptions as e:
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except stripe.error.StripeError as e:
        # Display a very generic error to the user, and maybe send
        # yourself an email
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except Exception as e:
        # Something else happened, completely unrelated to Stripe
        retval["message"] = "Error unrelated to Stripe."
        retval["error"] = e
        
    return retval

#-----------------------------------------
def update_customer(customer_id, payment_token):
    retval = {"error": False, "message": 'Customer created'}

    try:
        su = stripe.Customer.modify(
            customer_id,
            source=payment_token)
        
        retval["message"] = su.to_dict()
        return retval
        '''
        cu = stripe.Customer.retrieve( customer_id )
        sub_id = cu.subscriptions.data[0].id
        su = stripe.Subscription.retrieve( sub_id )
        su.source = payment_token
        su.save()
        
        retval["message"] = cu.to_dict()
        return retval
        #'''
    except stripe_exceptions as e:
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except stripe.error.StripeError as e:
        # Display a very generic error to the user, and maybe send
        # yourself an email
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except Exception as e:
        # Something else happened, completely unrelated to Stripe
        retval["message"] = "Error unrelated to Stripe."
        retval["error"] = e
        
    return retval

#-----------------------------------------
def cancel_subscription(customer_id):
    retval = {"error": False, "message": 'Customer created'}

    try:
        cu = stripe.Customer.retrieve( customer_id )
        sub_id = cu.subscriptions.data[0].id
        su = stripe.Subscription.retrieve( sub_id )
        su.delete(cancel_at_period_end = True)
        
        cu = stripe.Customer.retrieve( customer_id )
        retval["message"] = cu.to_dict()
        return retval
        
    except stripe_exceptions as e:
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except stripe.error.StripeError as e:
        # Display a very generic error to the user, and maybe send
        # yourself an email
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except Exception as e:
        # Something else happened, completely unrelated to Stripe
        retval["message"] = "Error unrelated to Stripe."
        retval["error"] = e
        
    return retval

#-----------------------------------------
def create_and_charge_customer(token, email, plan_ID, quantity):
    #
    # STEPS:
    #   1) Create a new customer. Regardless of email, they will be given a new customer id.
    #   2) Apply the subscription plan with a trial period (defined in Stripe dashboard) to this customer.
    #
    
    f = create_customer(email, token)
    
    if f["error"] == False:
        customer_id = f["message"]["id"]
        f = create_subscription(customer_id, plan_ID, quantity)
    else:
        raise Exception( f["message"] )
        
    return f

#-----------------------------------------
def create_group_customer(email, coupon_code):
    #
    # STEPS:
    #   1) Create a new customer. Regardless of email, they will be given a new customer id.
    #   2) Apply the subscription plan with a trial period (defined in Stripe dashboard) to this customer.
    #
    
    f = create_customer(email)
    
    PLAN_ID = STRIPE_PLANS["group_yearly"]
    if f["error"] == False:
        customer_id = f["message"]["id"]
        f = create_subscription_from_coupon(customer_id, PLAN_ID, coupon_code)
    else:
        raise Exception( f["message"] )
    
    return f

#-----------------------------------------
def update_as_group_customer(customer_id, license_code):
    #
    # STEPS:
    #   1) Apply the subscription plan with a trial period (defined in Stripe dashboard) to this customer.
    #
    
    PLAN_ID = STRIPE_PLANS["group_yearly"]
    f = create_subscription_from_coupon(customer_id, PLAN_ID, license_code)
    
    return f

#-----------------------------------------
def get_customer_info(customer_id):
    retval = {"error": False, "message": 'Customer created'}
    
    try:
        resp = stripe.Customer.retrieve(customer_id)
        coupon_info = {}
        if resp.metadata:
            coupon_id = resp.metadata.license
            coupon_info = stripe.Coupon.retrieve(coupon_id)
            coupon_info = coupon_info.to_dict()
            
        retval["message"] = resp.to_dict()
        retval["message"]["coupon"] = coupon_info
        
        return retval
    except stripe_exceptions as e:
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except stripe.error.StripeError as e:
        # Display a very generic error to the user, and maybe send
        # yourself an email
        body = e.json_body
        err  = body.get('error', {})
        retval["message"] = err.get('message')
        retval["error"] = err.get('type')
        pass
    except Exception as e:
        # Something else happened, completely unrelated to Stripe
        retval["message"] = "Error unrelated to Stripe."
        retval["error"] = e
        
    return retval
