source("..\\src\\selectResponseShape.R")
source("..\\src\\sampledData.R")
source("..\\src\\plotScatter.R")
source("..\\src\\anovaPower.R")
source("..\\src\\fTestPower.R")
source("..\\src\\buildXfn.R")
source("..\\src\\selectResponseShape2.R")
source("..\\src\\vertStack.R")           
source("..\\src\\eyeMinus.R")
library("ggplot2")

shinyServer(function(input, output) {

#computePower2 <- function(dm,ds,di,sigma,n,j1,j2,alpha)

		pv <- reactive({c(input$pM,input$pS)});
		dv <- reactive({c(input$deltaM,input$deltaS,input$deltaI)});
		
		#function(sigLevel,stDev,nSubPerGp,nLevelsEachFactor,efctSizeEachEffect)

 	    myPower   <- eventReactive(input$getPower,{anovaPower(input$alpha,input$sigma,input$n,pv(),dv())})

		powerValM <- reactive({myPower()$powerVal[1]})
    	powerValS <- reactive({myPower()$powerVal[2]})
    	powerValI <- reactive({myPower()$powerVal[3]})

		output$powerTextM    <- renderText({paste("Your main factor power = ",powerValM())})
		output$powerTextS    <- renderText({paste("Your 2nd  factor power = ",powerValS())})
		output$powerTextI    <- renderText({paste("Your interaction power = ",powerValI())})
	   	
    	myDeltaM <- reactive({selectResponseShape(input$shape,input$deltaM,input$pM)})   	
    	myDeltaS <- reactive({selectResponseShape(input$shape2,input$deltaS,input$pS)})   	
    	myDeltaI <- reactive({selectResponseShape2(input$shapeInt,input$deltaI,myDeltaM(),myDeltaS() )})
		
		myEfcts <- reactive({list("efct1" = myDeltaM(),"efct2"=myDeltaS(),"efct12"=myDeltaI())})

    	reSample <- eventReactive(input$simExp,{sampledData(input$cMean,input$alpha,input$sigma,input$n,c(input$pM,input$pS),c(input$deltaM,input$deltaS,input$deltaI),myEfcts())})
		
		output$debugStuff <- renderText({paste("delts = ",myDeltaM())})	
  	
    	p2       <- reactive({plotScatter(input$cMean,input$alpha,input$sigma,input$n,c(input$pM,input$pS),c(input$deltaM,input$deltaS,input$deltaI),myEfcts(),reSample())})
		
    	pVal     <- reactive({reSample()$pVal1})
    	pVal2    <- reactive({reSample()$pVal2})
    	pVal12   <- reactive({reSample()$pVal12})		
		output$distPlot      <- renderPlot({ p2() }, width="auto")     	

        output$pValTextM     <- renderText({paste("p-value main factor this simulation = ",pVal())})
        output$pValTextS     <- renderText({paste("p-value 2nd  factor this simulation = ",pVal2())})
        output$pValTextI     <- renderText({paste("p-value interaction this simulation = ",pVal12())})
		output$effectText    <- renderText({paste("estimated effect sizes: main = ",reSample()$efct1e," sec = ",reSample()$efct2e," int = ",reSample()$efct12e)})
        output$errorBarText  <- renderText({paste("The blue error bars give ",100*(1-input$alpha),"% confidence intervals for the means")})
        output$powerRepeatText  <- renderText({paste("Based on your power, about ",100*(round(powerVal(),2)),"% of repeats will give p<",input$alpha)})

})