source("..\\src\\selectResponseShape.R")
source("..\\src\\sampledData_kh.R")
source("..\\src\\plotScatter_kh.R")
source("..\\src\\anovaPower.R")
source("..\\src\\fTestPower.R")
source("..\\src\\buildXfn.R")
source("..\\src\\vertStack.R")           
source("..\\src\\eyeMinus.R")
library("ggplot2")

shinyServer(function(input, output) {

	myParms   <- eventReactive(input$getPower,{anovaPower(input$alpha,input$sigma,input$n,input$p,input$delta)})
    powerVal <- reactive({myParms()$powerVal})
    
    myDelta  <- reactive({selectResponseShape(input$shape,input$delta,input$p)})
	
	output$efctSizeText <- renderText(myDelta())
	
	efctSize <- reactive({list("efct1" = myDelta())})
 
  	reSample <- eventReactive(input$simExp,{sampledData_kh(input$cMean,input$alpha,input$sigma,input$n,input$p,input$delta,input$shape)})
 	#p2       <- reactive({plotScatter(reSample()$xANOVA,reSample()$myStats,reSample()$myParms)})
	
	# p2 <- plot(c(1,2,3),c(4,5,4))
	#p2 <- reactive({plot(reSample()$g,reSample()$y)})
	p2       <- reactive({plotScatter(input$cMean, input$alpha, input$sigma, input$n, input$p, input$delta, efctSize(), reSample()$myStats )})
    pVal     <- reactive({reSample()$myStats$pValue})
    
   	output$distPlot         <- renderPlot({ p2() }, width="auto")     	
    output$powerText        <- renderText({paste("Your power = ",powerVal())})
    output$pValText         <- renderText({paste("p-value this simulation = ",pVal())})
    output$errorBarText     <- renderText({paste("The blue error bars give ",100*(1-input$alpha),"% confidence intervals for the means")})
    output$powerRepeatText  <- renderText({paste("Based on your power, about ",100*(round(powerVal(),2)),"% of repeats will give p<",input$alpha)})

})