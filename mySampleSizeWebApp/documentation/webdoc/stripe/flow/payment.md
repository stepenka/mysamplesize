# Payment

After a user has submitted their payment information, we send the payment token (generated through [Elements](./card_object)) to the server which then interacts with Stripe through the Python API.

## Is Auth0 user?

We use the Auth0 Python API to check if the user is already registered in Auth0 by comparing emails. The communication with Auth0 is done through `pyhelp/auth0_controller.py`.

## Create Stripe customer

We create a Stripe customer using

1. `user_email`
    * an email which does not need to be unique
2. `token_id`
    * the (optional) payment token which contains encoded information that only Stripe handles

The payment token is optional due to our not requiring a credit card to sign up for a single user, billed monthly. After their trial period is up (24 hours), they will then be required to submit payment information. 

```python
stripe.Customer.create(
    email=<user_email>,
    source=<token_id>
)
```

## Create a Stripe subscription

After creating a customer, we create a Subscription by applying it to a customer. The required fields are 

* `customer_id`
    - obtained from the section above
* `PLAN_ID`
    - hard-coded right now
    - currently there are two options that correspond to monthly or yearly plans
* `quantity`
    - 1 for most users
    - more than 1 if you are a "group administrator", i.e. you purchase multiple to generate a license code
* `trial_from_plan`
    - True for **new** monthly users, otherwise, False

```python
stripe.Subscription.create(
    customer=<customer_id>,
    billing="charge_automatically",
    items=[{
        "plan": <PLAN_ID>,
        "quantity": <quantity>,
    }],
    trial_from_plan=<boolean>        # required to apply the default trial period 
)
```

## Create a coupon (optional)

If a user purchases multiple quantities, then we create a "coupon" which acts as a license code that they can distribute to their team.

```python
stripe.Coupon.create(
    percent_off=100.0,
    duration="repeating",
    duration_in_months=12,
    max_redemptions=<quantity>
    #add a redeem_by Unix timestamp to redeem by the end of the subscription date (1 year)
)
```


## Apply a coupon (optional)

Once a subscription is created, you can then apply a coupon. 

```python
cu = stripe.Customer.retrieve( customer_id )    # retrieve customer
sub_id = cu.subscriptions.data[0].id            # get their single subscription id
su = stripe.Subscription.retrieve( sub_id )     # retrieve the subscription
su.coupon = coupon_code                         # update the coupon field
su.save()                                       # save() to update Stripe
```

Alternatively, you can create a subscription with a coupon.
```python
stripe.Subscription.create(
    customer=customer_id,
    billing="charge_automatically",
    items=[{
        "plan": PLAN_ID,
    }],
    coupon=coupon_code
)
```
