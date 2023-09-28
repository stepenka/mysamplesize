# Creating Subscriptions

## Standard

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

## With a coupon

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