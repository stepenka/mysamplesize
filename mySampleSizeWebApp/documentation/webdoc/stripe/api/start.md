# Before You Begin

Before you access any API endpoint, you will need to verify your application to work with Stripe. This prevents just anyone from using the API. 

After installing Stripe via `pip install stripe`, you will need to set the api key. After doing this, you can use the other endpoints outlined in this documentation. 

!> Every time you start Python and want to test these endpoints, you need to set the api key!

Below is the initial Python code which defines the secret and publishable keys (for both live and developer versions) and then sets the `api_key` field at the end.

![](img/start.PNG)