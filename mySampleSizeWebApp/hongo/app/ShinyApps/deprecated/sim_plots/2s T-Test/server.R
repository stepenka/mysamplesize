source("sampledData.R")
source("plotScatter.R")
library("ggplot2")

shinyServer(function(input, output) {

      	mySample <- eventReactive(input$getPower,{sampledData(5,input$delta,input$sigma,input$n,input$alpha)})

     	powerVal <- reactive({mySample()$myParms$powerVal})

 #	p2       <- eventReactive(input$simExp,{
 #	            plotScatter(mySample()$x,mySample()$y,mySample()$myStats,mySample()$myParms)})
 
  	reSample <- eventReactive(input$simExp,{sampledData(5,input$delta,input$sigma,input$n,input$alpha)})
 	p2       <- reactive({plotScatter(reSample()$x,reSample()$y,reSample()$myStats,reSample()$myParms)})
     	pVal     <- reactive({reSample()$myStats$pValue})
	            
   	output$distPlot      <- renderPlot({ p2() }, width="auto")     	
        output$powerText     <- renderText({paste("Your power = ",powerVal())})
        output$pValText      <- renderText({paste("p-value this simulation = ",pVal())})
        output$errorBarText  <- renderText({paste("The blue error bars give ",100*(1-input$alpha),"% confidence intervals for the means")})
        output$powerRepeatText  <- renderText({paste("Based on your power, about ",100*(round(powerVal(),2)),"% of repeats will give p<",input$alpha)})

})