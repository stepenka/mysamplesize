shinyUI(fluidPage(

  titlePanel("Compute Power and Simulate a Two-Factor Comparison Experiment"),

  sidebarLayout(
    sidebarPanel(
      p("Enter parameters below and press Compute Power"),
      numericInput("n",label="Number animals per group",value = 10),
      numericInput("pM",label="Number levels in Main Factor",value = 2),
      numericInput("pS",label="Number levels in 2nd Factor",value = 2),
	  numericInput("cMean",label="Mean response of control group",value = 1),
      numericInput("deltaM",label="Main Factor Effect Size",value = 1,step=0.001),
      numericInput("deltaS",label="2nd Factor Effect Size",value = 1,step=0.001),
      numericInput("deltaI",label="Factor Interaction Effect Size",value = 0.1,step=0.001),
      numericInput("sigma",label="Standard Deviation",value = 1,step=0.001),
      numericInput("alpha",label="Significance",value = 0.05,step=0.001),
      actionButton("getPower",label="Compute power"),
      p(" "),
      h4(textOutput("powerTextM")),
      p(" "),
      h4(textOutput("powerTextS")),
      p(" "),
      h4(textOutput("powerTextI"))
    ),

    mainPanel(
    p("After computing power, simulate an experiment with the parameters you have chosen"),
    p("How do you think the main factor impacts your outcome?  Will it increase, decrease, go down and up, or go up and then down? Select one"),
    selectInput("shape",label="Select response shape",c("Increasing" = "linearUp",
                  "Decreasing" = "linearDown"),selected="linearUp"), 
    p("How do you think the secondary factor impacts your outcome?  Will it increase, decrease, go down and up, or go up and then down? Select one"),
    selectInput("shape2",label="Select response shape",c("Increasing" = "linearUp",
                  "Decreasing" = "linearDown"),selected="linearUp"), 
    p("Do the two factors work together or in opposition?"),
    selectInput("shapeInt",label="Select interaction type",c("Cooperative" = "coop",
                  "Opposing" = "oppo"),selected="coop"), 
	p("You can repeat as many simulations as you like by pressing the Simulate button"), 
    p(" "),
	h4(textOutput("effectText")),
	p(" "),
    actionButton("simExp",label="Simulate an experiment!"),
    p(" "),
    h4(textOutput("pValTextM")),
    p(" "),
    h4(textOutput("pValTextS")),
    p(" "),
    h4(textOutput("pValTextI")),
    p(" "),
    textOutput("powerRepeatTextM"),
    p(" "),
    textOutput("powerRepeatTextS"),
    p(" "),
    textOutput("powerRepeatTextI"),
    p(" "),
    p("The gray bars show the means from the two samples"),  
    p("The red dots show the simulated samples"),    
    textOutput("errorBarText"),
    plotOutput("distPlot")
    )
  )
))