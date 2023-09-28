shinyUI(fluidPage(theme = "myshiny.css",
    tags$head(tags$script(src="../../www/trustSource.js")),
    
  headerPanel("Compute Power and Simulate a Two-Sample Comparison Experiment"),

  sidebarLayout(
    sidebarPanel(
      p("Enter parameters below and press Compute Power"),
      numericInput("n",label="Number subjects per group",value = 10),
      numericInput("delta",label="Effect Size",value = 1,step=0.001),
      numericInput("sigma",label="Standard Deviation",value = 1,step=0.001),
      numericInput("alpha",label="Significance",value = 0.05,step=0.001),
      actionButton("getPower",label="Compute power"),
      p(" "),
      h4(textOutput("powerText"))
    ),

    mainPanel(
    p("After computing power, simulate an experiment with the parameters you have chosen"),
    p("You can repeat as many simulations as you like by pressing the Simulate button"), 
    p(" "),
    actionButton("simExp",label="Simulate an experiment!"),
    p(" "),
    h4(textOutput("pValText")),
    p(" "),
    textOutput("powerRepeatText"),
    p(" "),    
    p("The gray bars show the means from the two samples"),  
    p("The red dots show the simulated samples"),    
    textOutput("errorBarText"),
    plotOutput("distPlot")
    )
  )
))