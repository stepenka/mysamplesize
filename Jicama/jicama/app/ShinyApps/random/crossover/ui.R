# ui.R Crossover

shinyUI(fluidPage(theme = "myshiny.css",
                  
                  headerPanel("Crossover Design"),
                  tags$head(tags$script(src="../../www/trustSource.js")),
                  
                  fluidPage(
                    
                    fluidRow(
                      column(4,     
                             numericInput("subjects",
                                          label="What is the Total Number of Subjects",
                                          value = 2,
                                          min = 2,
                                          max = 200)),
                      column(8
                             #,
                             #h3(htmlOutput("error"))
                      ),
                      ######
                      column(12,
                             uiOutput("title2")),
                      ######
                      column(2,
                             numericInput("factors",
                                          label="",
                                          value = 2,
                                          min = 2,
                                          max = 20)),
                      ######
                      column(12,
                             uiOutput("title1")),
                      ######
                      column(12,
                             uiOutput("times"))
                   
                    ),
                    
                    
                    fluidRow(
                      column(12,
                             actionButton("button", "Generate/Update Results"),
                             dataTableOutput('table'),
                             tags$style(type="text/css", '#table tfoot {display:none;}'),
                             uiOutput("download")
                      )),
                    textOutput("results")
                    
                  )
))