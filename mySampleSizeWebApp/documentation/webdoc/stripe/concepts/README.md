# Basic Stripe Concepts

The main components of Stripe to know before going into the API, are the difference and connections between the following:

- [Customers](./customers)
- [Subscriptions](./subscriptions)
- [Products](./products)
- [Coupons](./coupons)

Of course, there are several ways to use these concepts in any particular site. I will only discuss how they are currently used for MySampleSize. 

As a quick reference :

* `Subscriptions` are billing methods applied to `Products`
* `Coupons` are discounts applied to `Subscriptions` 
* `Subscriptions` are associated with `Customers`
    * Customers can have multiple Subscriptions (but in our case that's not necessary)

