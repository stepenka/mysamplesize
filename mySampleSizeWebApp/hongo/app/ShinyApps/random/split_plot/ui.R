# ui.R Split Plot
shinyUI(fluidPage(theme = "myshiny.css",
                  
                  headerPanel("Split Plot Design"),
                  tags$head(tags$script(src="../../www/trustSource.js")),
                  
                    mainPanel(
                      h3(htmlOutput("caption"))
                    )
))