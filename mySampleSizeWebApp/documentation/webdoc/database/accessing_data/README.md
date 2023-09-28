# Accessing Data

After data is saved, a user must be able to access it. The general flow is:

1. Identify the data to access (e.g. by project name and subproject name)
2. Request the data from the server
    - Python server gets the data from the database
3. Display the data

In these cases, I request the data with a url and simply display the data using an `<iframe>`, a way to embed websites within websites. We have implemented it this way so that users can see their data as embedded PDFs. 

More specifically, the data is accessed like below (for example):

`/toolsPDF?userid=<user_id>&projectname=<my_proj_name>&tablename=<powersize>`


## Security Concerns

At some point, it became clear that anyone could access and endpoint given that they know the correct fields. In `application.py`, I have made it so that users can only access their own data with the `uid_match_required` wrapper. This is not documented here, so please ask if you have any questions about it. 

## Flask Templating

Database data is passed to a Flask route, which generates an HTML page. The HTML page is then converted into PDFs using Flask, then displayed as an iframe to the user. If you take a look at the templates for these pages in `static/partials/webpage_reports/templates/`, you may notice that they look very different from the rest of our HTML pages. The reason for this is that they are created using Flask, and not AngularJS. 

Read more on Flask and Jinja templating to understand the nuances. 



## Power and Sample Size Data

From the folder above, we use the files `tools_report_body.html` and `tools_report_template.html` to generate pages associated with power and sample size data. The *body* HTML is embedded the *template* HTML as well as in the Design Guide report data (which is why it's separate from the *template* data).



## Design Guide Data

Also contained in the templates folder specified in the previous section, 

