#
# template for the ShinyApps files/folder structure
# In particular, only change the css from the root ShinyApps folder, in ShinyApps/www/myshiny.css
# The line with trustSource.js is required. With the current way things are structured, it should work.
#

shinyUI(fluidPage(theme = "myshiny.css",
                  
                  headerPanel("My Header"),
                  tags$head(tags$script(src="../../www/trustSource.js")),

))