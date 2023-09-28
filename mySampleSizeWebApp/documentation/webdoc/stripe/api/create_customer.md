# Creating Customers

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