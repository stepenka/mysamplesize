# ui.R Incomplete Block Design

shinyUI(fluidPage(theme = "myshiny.css",
                  
                  headerPanel("Incomplete Block Design"),
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
                             uiOutput("title1")),
                      ######
                      column(2,
                             numericInput("main_factors",
                                          label="",
                                          value = 2,
                                          min = 2,
                                          max = 10)),
                      column(10,
                             uiOutput("main_names")),
                      ######
                      column(12,
                             uiOutput("title2")),
                      ######
                      column(2,
                             numericInput("block_factors",
                                          label="",
                                          value = 1,
                                          min = 1,
                                          max = 20)),
                      column(5,
                             uiOutput("block_groups")),
                      column(5,
                             uiOutput("rownames"))
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