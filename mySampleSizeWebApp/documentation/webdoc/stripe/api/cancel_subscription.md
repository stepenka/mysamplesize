# Canceling Subscriptions


```python
cu = stripe.Customer.retrieve( customer_id )
sub_id = cu.subscriptions.data[0].id
su = stripe.Subscription.retrieve( sub_id )
su.delete(cancel_at_period_end = True)
```

This code does the following:

1. Get the customer data from `customer_id`
2. Get the subscription ID from the customer
    * *Technically* a customer can have multiple subscriptions, we select the first one
    * For our purposes, a user never has multiple subscriptions
3. Retrieve the subscription by ID
4. Cancels the subscription at the end of the billing period