# ui.R Matched Pair

shinyUI(fluidPage(theme = "myshiny.css",
                  
                  headerPanel("Matched Pair Design"),
                  tags$head(tags$script(src="../../www/trustSource.js")),
                  
                  fluidPage(
                    
                    fluidRow(
                      column(6,     
                             numericInput("pairs",
                                          label="What is the Total Number of Matched Pairs",
                                          value = 2,
                                          min = 2,
                                          max = 200))
                   
                      
                    ),
                    
                    
                    fluidRow(
                      column(12,
                             actionButton("button", "Generate/Update Results"),
                             textOutput("results"),
                             dataTableOutput('table'),
                             tags$style(type="text/css", '#table tfoot {display:none;}'),
                             uiOutput("download")
                      ))
                   
                    
                  )
))