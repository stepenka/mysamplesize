# ui.R Completely Randomized Design

shinyUI(fluidPage(theme = "myshiny.css",
                  
                  headerPanel("Completely Randomized Design"),
                  tags$head(tags$script(src="../../www/trustSource.js")),
                  
                  sidebarLayout(
                    sidebarPanel(
                      numericInput("k",
                                   label="Number of Total Groups;",
                                   value = 2,
                                   min = 2,
                                   max = 20),
                      
                      numericInput("n_group",
                                   label="How many Subjects per Group;",
                                   value = 2,
                                   min = 2,
                                   max = 200),
                      actionButton("button", "Generate/Update Results"),
                      uiOutput("download")
                    ),
                    
                    mainPanel(
                      tableOutput('table')
                      
                    )
      )
))