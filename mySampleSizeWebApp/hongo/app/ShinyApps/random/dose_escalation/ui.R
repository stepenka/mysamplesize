# ui.R Dose Escalation

shinyUI(fluidPage(theme = "myshiny.css",
                  
                  headerPanel("Dose Escalation Design"),
                  tags$head(tags$script(src="../../www/trustSource.js")),
                  
                  mainPanel(
                      h3(htmlOutput("caption"))
                    )
))