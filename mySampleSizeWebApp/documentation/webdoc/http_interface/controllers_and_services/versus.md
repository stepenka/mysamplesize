
# Controllers and Services

This section will outline the difference between AngularJS controllers and services, and provide where these are used in the current application.


## Controllers vs. Services  {docsify-ignore}

### Services {docsify-ignore}

Services are meant to be used as persistent-like data throughout the website. They can hold information and be modified by controllers, but they only are initialized once per session.

### Controllers {docsify-ignore}

On the other hand, controllers dictate the underlying JavaScript behind a single page or section. Navigation away and back to the same page reintializes the controller. For that reason, controllers are good for self-contained information that does not need persistency.
