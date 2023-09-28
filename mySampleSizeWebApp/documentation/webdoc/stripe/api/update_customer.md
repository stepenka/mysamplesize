# Updating Customer Information

```python
cu = stripe.Customer.retrieve( customer_id )    # retrieve customer
sub_id = cu.subscriptions.data[0].id            # get their single subscription id
su = stripe.Subscription.retrieve( sub_id )     # retrieve the subscription
su.source = payment_token                       # update the field
su.save()                                       # save() to update Stripe
```

This is an example of how to update a customer's information. In this example, we are updating the payment information on a subscription with the `payment_token` variable. 