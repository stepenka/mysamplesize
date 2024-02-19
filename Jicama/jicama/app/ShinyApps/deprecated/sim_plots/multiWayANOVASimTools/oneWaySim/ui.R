shinyUI(fluidPage(

  titlePanel("Compute Power and Simulate a Multi-Sample Comparison Experiment"),

  sidebarLayout(
    sidebarPanel(
      p("Enter parameters below and press Compute Power"),
      numericInput("n",label="Number animals per group",value = 10),
      numericInput("p",label="Number comparison groups",value = 2),
      numericInput("cMean",label="Mean response for control group",value = 1,step=0.001),
      numericInput("delta",label="Effect Size",value = 1,step=0.001),
      numericInput("sigma",label="Standard Deviation",value = 1,step=0.001),
      numericInput("alpha",label="Significance",value = 0.05,step=0.001),
      actionButton("getPower",label="Compute power"),
      p(" "),
      h4(textOutput("powerText"))
    ),

    mainPanel(
    p("After computing power, simulate an experiment with the parameters you have chosen"),
    p("Do you expect your outcome to increase, to decrease, to look like a U shape, or an inverted U? Select one"),
    selectInput("shape",label="Select response shape",c("Increasing" = "linearUp",
                  "Decreasing" = "linearDown","U shape" = "regU",
                  "Inverted U shape" = "invertedU"),selected="linearUp"), 
	textOutput("efctSizeText"),
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