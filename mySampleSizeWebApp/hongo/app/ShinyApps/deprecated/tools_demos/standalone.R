# server.R TOOLS Effect

effectSize <-  function(es) {

    maxEffectSize <- 1.6;
    minEffectSize <- 0.1;
    sigLevel      <- 0.05;
    sampSize      <- 5;
    
    # create dataset H0
    m1   <- 0  
    sd1  <- 1/sqrt(sampSize)
    mins <- m1-sd1*4
    maxs <- m1+sd1*4
    
    x <- seq(mins, maxs, 0.01)
    y <- dnorm(x, m1, sd1)
        
    # create dataset HA
    m2 <- es
    sd2   <- sd1
    mins2 <-  m2-sd2*4
    maxs2 <- m2+sd2*4
    x2 <- seq(mins2, maxs2, 0.01)
    y2 <- dnorm(x2, m2, sd2)
    
    zcrit <- qnorm(1-(sigLevel/2), m1, sd1)
    
    yMaxValue <- 1.2*sqrt(sampSize/(2*pi))

    output <- list()
    output$x <- x
    output$y <- y
    output$x2 <- x2
    output$y2 <- y2
    output$zcrit <- zcrit
    output$m1 <- m1
    output$m2 <- m2
    
    output
    
    #CI <- 1 - sig
}






powerFunc <- function(es, ss)
{
#
#  Set up problem parameters. first batch copied from hardcoded ui.R data
#
    maxSampSize   <- 22.0;
    minSampSize   <- 2.0;
    maxEffectSize <- 1.6;
    minEffectSize <- 0.1;
    sigLevel      <- 0.05;
#
#  Set to be consistent with other functions
#
    m1  <- 5                    # mu H0
    sd1 <- 1/sqrt(ss)           # sigma H0
    m2  <- m1 + es              # mu HA
    sd2 <- 1/sqrt(ss)           # sigma HA
    
    z_crit <- qnorm(1-(sigLevel/2), m1, sd1)
#    z_crit <- reactive({ m1 +  sd1()*qt( 1-(sigLevel/2), df=( (2*input$ss) - 2) )   })

#  
#   x axis grid to work for all input settings.
# 
    x <- seq(m1 - 3.5/sqrt(minSampSize), m1 + maxEffectSize + 3.5/sqrt(minSampSize), 0.01) 
        
    # generate normal dist #1
    y1 <- dnorm(x, m1, sd1)

    # generate normal dist #2
    y2 <- dnorm(x, m2, sd2)

    output <- list()
    output$x <- x
    output$y <- y1
    output$y2 <- y2
    output$zcrit <- z_crit
    output$m1 <- m1
    output$m2 <- m2
    
    return( output )
    
  ########################################TESTING################################
    output$results <- renderText({
      "<h4>Use the slides to change the Mean and Standard Deviations between the Null and Alternative Hypotheses to see how each variable effects the Probability of Type I and Type II Errors.</h4><br>
      Z-Critical Value is represented by the dashed vertical line.<br>
      Power is the equal to 1-Beta.<br>
      Beta is the Probability of Type II Error<br>
      Alpha is the Probability of Type I Error"
    })   
}





sigFunc <- function(sig)
{    
    # create dataset
    mean <- 0  
    sd   <- 1.0 
    mins <- mean-sd*4
    maxs <- mean+sd*4
    x <- seq(mins, maxs, 0.01)
    y <- dnorm(x, mean, sd)

    zcrit <- qnorm(1-(sig/2), mean, sd)
    zcrit2 <- qnorm(1-(sig), mean, sd)

    output <- list()
    output$x <- x
    output$y <- y 
    output$zcrit <- c(zcrit, zcrit2)
    
    return( output )
}

