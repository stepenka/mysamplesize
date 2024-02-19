source("..\\src\\selectResponseShape.R")
source("..\\src\\sampledData_kh.R")
source("..\\src\\plotScatter_kh.R")
source("..\\src\\anovaPower.R")
source("..\\src\\fTestPower.R")
source("..\\src\\buildXfn.R")
source("..\\src\\selectResponseShape2.R")
source("..\\src\\selectResponseShape3.R")
source("..\\src\\vertStack.R")           
source("..\\src\\eyeMinus.R")
library("ggplot2")
library("gridExtra")

shinyServer(function(input, output) {

    #computePower2 <- function(dm,ds,di,sigma,n,j1,j2,alpha)

    pv <- reactive({c(input$pM,input$pS,input$pT)});
    dv <- reactive({c(input$deltaM,input$deltaS,input$deltaT,input$deltaMS,input$deltaMT,input$deltaST,input$deltaMST)});
    
    #function(sigLevel,stDev,nSubPerGp,nLevelsEachFactor,efctSizeEachEffect)

    myPower     <- eventReactive(input$getPower,{anovaPower(input$alpha,input$sigma,input$n,pv(),dv())})

    powerValM   <- reactive({myPower()$powerVal[1]})
    powerValS   <- reactive({myPower()$powerVal[2]})
    powerValT   <- reactive({myPower()$powerVal[3]})
    powerValMS  <- reactive({myPower()$powerVal[4]})
    powerValMT  <- reactive({myPower()$powerVal[5]})
    powerValST  <- reactive({myPower()$powerVal[6]})
    powerValMST <- reactive({myPower()$powerVal[7]})
    
    output$powerTextM    <- renderText({paste("Your main factor power = ",powerValM())})
    output$powerTextS    <- renderText({paste("Your 2nd  factor power = ",powerValS())})
    output$powerTextT    <- renderText({paste("Your 3rd  factor power = ",powerValT())})
    output$powerTextMS   <- renderText({paste("Your main-2nd    power = ",powerValMS())})
    output$powerTextMT   <- renderText({paste("Your main-3rd    power = ",powerValMT())})
    output$powerTextST   <- renderText({paste("Your 2nd-3rd     power = ",powerValST())})
    output$powerTextMST  <- renderText({paste("Your three-way   power = ",powerValMST())})

    myShapes <- reactive({ c(input$shape, input$shape2, input$shape3, input$shape12, input$shape13, input$shape23) })
    
    myDeltaM  <- reactive({selectResponseShape(input$shape,input$deltaM,input$pM)})   	
    myDeltaS  <- reactive({selectResponseShape(input$shape2,input$deltaS,input$pS)}) 
    myDeltaT  <- reactive({selectResponseShape(input$shape3,input$deltaT,input$pT)}) 		
    myDeltaMS <- reactive({selectResponseShape2(input$shape12,input$deltaMS,myDeltaM(),myDeltaS() )})
    myDeltaMT <- reactive({selectResponseShape2(input$shape13,input$deltaMT,myDeltaM(),myDeltaT() )})
    myDeltaST <- reactive({selectResponseShape2(input$shape23,input$deltaST,myDeltaS(),myDeltaT() )})

    myDeltaMST <- reactive({selectResponseShape3(pv())})
    
    myEfcts <- reactive({list("efct1" = myDeltaM(),"efct2"=myDeltaS(),"efct3"=myDeltaT(),"efct12" = myDeltaMS(),"efct13"=myDeltaMT(),"efct23"=myDeltaST(),"efct123"=myDeltaMST())})

    reSample <- eventReactive(input$simExp,{sampledData_kh(input$cMean,input$alpha,input$sigma,input$n, pv(), dv(), myShapes())})
    
    output$debugStuff <- renderText({paste("delts = ",myDeltaM())})	

    p2       <- reactive({plotScatter(input$cMean,input$alpha,input$sigma,input$n,pv(),dv(),myEfcts(),reSample()$myStats)})
    
    pVal     <- reactive({reSample()$myStats$pValue[0]})
    pVal2    <- reactive({reSample()$myStats$pValue[1]})
    pVal3    <- reactive({reSample()$myStats$pValue[2]})	
    pVal12   <- reactive({reSample()$myStats$pValue[3]})
    pVal13   <- reactive({reSample()$myStats$pValue[4]})
    pVal23   <- reactive({reSample()$myStats$pValue[5]})
    pVal123  <- reactive({reSample()$myStats$pValue[6]})
    
    output$distPlot      <- renderPlot({ p2() }, width="auto")     	

    output$pValTextM     <- renderText({paste("p-value main factor this simulation = ",pVal())})
    output$pValTextS     <- renderText({paste("p-value 2nd  factor this simulation = ",pVal2())})
    output$pValTextT     <- renderText({paste("p-value 3rd  factor this simulation = ",pVal3())})
    output$pValTextMS    <- renderText({paste("p-value main-2nd    this simulation = ",pVal12())})
    output$pValTextMT    <- renderText({paste("p-value main-3rd    this simulation = ",pVal13())})
    output$pValTextST    <- renderText({paste("p-value 2nd-3rd     this simulation = ",pVal23())})
    output$pValTextMST   <- renderText({paste("p-value three-way   this simulation = ",pVal123())})
})
