source("selectResponseShape.R")
source("sampledData.R")
source("plotScatter.R")
source("computePower.R")
library("ggplot2")

shinyServer(function(input, output) {

      	myParms  <- eventReactive(input$getPower,{computePower(5,input$delta,input$sigma,input$n,input$p,input$alpha)})

     	powerVal <- reactive({myParms()$powerVal})
     	
     	iType    <- reactive(input$shape)
     	
     	myDelta  <- reactive({selectResponseShape(iType(),input$delta,input$p)})
 
  	reSample <- eventReactive(input$simExp,{sampledData(5,myDelta(),input$sigma,input$n,input$p,input$alpha)})
  	
 	p2       <- reactive({plotScatter(reSample()$xANOVA,reSample()$myStats,reSample()$myParms)})
     	pVal     <- reactive({reSample()$myStats$pValue})
	            
   	output$distPlot      <- renderPlot({ p2() }, width="auto")     	
        output$powerText     <- renderText({paste("Your power = ",powerVal())})
        output$pValText      <- renderText({paste("p-value this simulation = ",pVal())})
        output$errorBarText  <- renderText({paste("The blue error bars give ",100*(1-input$alpha),"% confidence intervals for the means")})
        output$powerRepeatText  <- renderText({paste("Based on your power, about ",100*(round(powerVal(),2)),"% of repeats will give p<",input$alpha)})

})