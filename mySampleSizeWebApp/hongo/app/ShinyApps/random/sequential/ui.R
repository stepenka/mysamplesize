# ui.R Sequential

shinyUI(fluidPage(theme = "myshiny.css",
                  
                  headerPanel("Sequential Design"),
                  tags$head(tags$script(src="../../www/trustSource.js")),
                  
                 mainPanel(
                      h3(htmlOutput("caption"))
                    )
))