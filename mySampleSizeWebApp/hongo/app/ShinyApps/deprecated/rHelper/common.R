# default and bound parameters and functions for interactive helper graphs
#
# setBounds and setDefaults can be called to grab the necessary data
#    this construct allows for one place to hard code parameters.
#
# functions in this file for everyone
#     setBounds
#     setDefaults
#     sampSizer
#     efctSizer
#     sigLeveler
#     stdever
#     setIndepSampTTest
#     sampledData
#
# functions for shiny apps only
#
#     getTPlot
#     getSimPlot
#
#
setBounds <- function(str=""){

	myBounds <- list()
	
 	myBounds$minSampSize <- 2
 	myBounds$maxSampSize <- 42
 	myBounds$minES       <- 0.1
 	myBounds$maxES       <- 2.0
 	myBounds$minSD       <- 0.1
 	myBounds$maxSD       <- 2.0;
 	myBounds$minSL       <- 0.0001;
 	myBounds$maxSL       <- 0.1;
 	
    if( str == "power"){
        myBounds$minSD  <- 0.4
    }
    if( str == "stdev" ){
        myBounds$minSD  <- 0.4
    }
    if( str == "siglevel" ){
        myBounds$minSL  <- 0.001;
    }
 	return(myBounds)
}
setDefaults <- function(str=""){

    myDefaults          <- list()
  	myDefaults$ss       <- 6
  	myDefaults$es       <- 0.7
  	myDefaults$sd       <- 1
  	myDefaults$sigLevel <- 0.05;
  	
    if( str == "siglevel" ){
        myDefaults$ss          <- 10
        myDefaults$es          <- 1.2
        myDefaults$sd          <- 1
        myDefaults$sigLevel    <- 0.05;
    }
  	return(myDefaults)
}

# functions here
#
#    all the helper functions call the omnibus function setIndepSampTTest, which contains the
#        relevant commands for constructing the helper graph data.
#
# sampSizer calls setBounds, setDefaults, setIndepSampTTest
#   
#   the input: scalar positive integer ss, sample size per group
#
#   to call within a particular context (sample size, sig, or effect size), use defaults
#      for all parameters except the parameter of the context.
#
#   the output list contains fields x,y, x2, y2 for the graph of null and alternative
#                                   tCrit: +/- tCrit define the rejection region of the hyp test
#                                   m1 and m2 are the modes of the null and alt graphs, resp.
#                                   powerVal is the power of the test given the inputs
#                                   poly is the polygon data used in ggplot graphs
#
sampSizer <- function(ss){

	bnds  <- setBounds();
	dfts  <- setDefaults();
	
	output <- setIndepSampTTest(bnds$minSampSize,bnds$maxSampSize,bnds$minES,bnds$maxES,bnds$minSD,bnds$maxSD,bnds$minSL,bnds$maxSL,ss,dfts$es,dfts$sd,dfts$sigLevel);
	
	return(output)
}
# efctSizer calls setBounds, setDefaults, setIndepSampTTest
#   
#   the input: scalar double es, effect size
#
#   to call within a particular context (sample size, sig, or effect size), use defaults
#      for all parameters except the parameter of the context.
#
#   the output list contains fields x,y, x2, y2 for the graph of null and alternative
#                                   tCrit: +/- tCrit define the rejection region of the hyp test
#                                   m1 and m2 are the modes of the null and alt graphs, resp.
#                                   powerVal is the power of the test given the inputs
#                                   poly is the polygon data used in ggplot graphs
#
efctSizer <- function(es){

	bnds  <- setBounds();
	dfts  <- setDefaults();
	
	output <- setIndepSampTTest(bnds$minSampSize,bnds$maxSampSize,bnds$minES,bnds$maxES,bnds$minSD,bnds$maxSD,bnds$minSL,bnds$maxSL,dfts$ss,es,dfts$sd,dfts$sigLevel);
	
	return(output)
}
# sigLeveler calls setBounds, setDefaults, setIndepSampTTest
#   
#   the input: scalar double sigLevel, significance or Type I error prob
#
#   to call within a particular context (sample size, sig, or effect size), use defaults
#      for all parameters except the parameter of the context.
#
#   the output list contains fields x,y, x2, y2 for the graph of null and alternative
#                                   tCrit: +/- tCrit define the rejection region of the hyp test
#                                   m1 and m2 are the modes of the null and alt graphs, resp.
#                                   powerVal is the power of the test given the inputs
#                                   poly is the polygon data used in ggplot graphs
#
sigLeveler <- function(sigLevel){
    testType <- "siglevel";
	bnds  <- setBounds(testType);
	dfts  <- setDefaults(testType);
	
	output <- setIndepSampTTest(bnds$minSampSize,bnds$maxSampSize,bnds$minES,bnds$maxES,bnds$minSD,bnds$maxSD,bnds$minSL,bnds$maxSL,dfts$ss,dfts$es,dfts$sd,sigLevel);
	
	return(output)
}
# stdever calls setBounds, setDefaults, setIndepSampTTest
#   
#   the input: scalar double sd0, standard deviation
#
#   to call within a particular context (sample size, sig, or effect size), use defaults
#      for all parameters except the parameter of the context.
#
#   the output list contains fields x,y, x2, y2 for the graph of null and alternative
#                                   tCrit: +/- tCrit define the rejection region of the hyp test
#                                   m1 and m2 are the modes of the null and alt graphs, resp.
#                                   powerVal is the power of the test given the inputs
#                                   poly is the polygon data used in ggplot graphs
#
stdever <- function(sd0){

    testType <- "stdev";
	bnds  <- setBounds(testType);
	dfts  <- setDefaults(testType);
	
	output <- setIndepSampTTest(bnds$minSampSize,bnds$maxSampSize,bnds$minES,bnds$maxES,bnds$minSD,bnds$maxSD,bnds$minSL,bnds$maxSL,dfts$ss,dfts$es,sd0,dfts$sigLevel);
	
	return(output)
}
# powerSizer calls setBounds, setDefaults, setIndepSampTTest
#   
#   the input: scalar double es, effect size
#
#   to call within a particular context (sample size, sig, or effect size), use defaults
#      for all parameters except the parameter of the context.
#
#   the output list contains fields x,y, x2, y2 for the graph of null and alternative
#                                   tCrit: +/- tCrit define the rejection region of the hyp test
#                                   m1 and m2 are the modes of the null and alt graphs, resp.
#                                   powerVal is the power of the test given the inputs
#                                   poly is the polygon data used in ggplot graphs
#
powerSizer <- function(ss,es,sd0,sigLevel){

    #ss <- 6
    #es <- 1.0
    #sd0 <- 1.0
    #sigLevel <- 10^(-1.3)
    
	bnds  <- setBounds();
	dfts  <- setDefaults();
	
	# minSS,maxSS,minES,maxES,minSD,maxSD,minSL,maxSL,ss0,es0,sd0,sig0
	output <- setIndepSampTTest(bnds$minSampSize,bnds$maxSampSize,bnds$minES,bnds$maxES,bnds$minSD,bnds$maxSD,bnds$minSL,bnds$maxSL,ss,es,sd0,sigLevel);
	
	return(output)
}
# setIndepSampTTest is the "omnibus" function for power, critical values, and graph data.
#
#   to call within a particular context (sample size, sig, or effect size), use defaults
#      for all parameters except the parameter of the context.
#
#   the output list contains fields x,y, x2, y2 for the graph of null and alternative
#                                   tCrit: +/- tCrit define the rejection region of the hyp test
#                                   m1 and m2 are the modes of the null and alt graphs, resp.
#                                   powerVal is the power of the test given the inputs
#                                   poly is the polygon data used in ggplot graphs
#
setIndepSampTTest <- function(minSS,maxSS,minES,maxES,minSD,maxSD,minSL,maxSL,ss0,es0,sd0,sig0) {

    yMaxValue    <- 2*dt(0,df=2);
    
    degFree      <- 2*ss0-2;
    rootN        <- sqrt(ss0);
    effectSize   <- es0/sd0;
    nonCentParm  <- effectSize*rootN/(sqrt(2));
    tCrit        <- qt(1-sig0/2,df = degFree);  
    tCritMinus   <- 0-tCrit;
    
    p1          <- pt(tCrit,df = degFree,ncp = nonCentParm);
    p2          <- pt(-tCrit,df = degFree,ncp = nonCentParm);
    
    betaVal     <- p1-p2;
    powerVal    <- 1-betaVal;
    
    #### length.out was used so that there weren't 2300+ data points
    # x <- seq(0-8/sqrt(minSS), effectSize + 8/sqrt(minSS), 0.005);
    x <- seq(0-8/sqrt(minSS), effectSize + 8/sqrt(minSS), length.out=200);
    
    y   <- dt( x,df = degFree);
    df1 <- data.frame(X = x, Y = y);

    x2  <- x;
    y2  <- dt(x,df = degFree,ncp = nonCentParm);
    df2 <- data.frame(X = x, Y = y2);
    
# Alpha polygons
    datum3     <- data.frame(X=x, Y=y, id=3);
    datum_cut3 <- datum3[datum3$X >= tCrit, ];
    poly3      <- rbind(datum_cut3, c(tCrit, 0,3));

    datum2     <- data.frame(X=x, Y=y, id=2);
    datum_cut2 <- datum2[datum2$X <= tCritMinus, ];
    poly2      <- rbind(datum_cut2, c(-tCrit, 0,2));


# power polygon; 1-beta
    datum1    <- data.frame(X=x, Y=y2, id=1);
    datum_cut1<- datum1[datum1$X >= tCrit,];
    poly1     <- rbind(datum_cut1, c(tCrit, 0,1));
    
    bindem    <- rbind(poly1, poly2, poly3);
#    bindem$id <- factor(bindem$id,  labels=c("Power","Type I Error Left Side","Type I Error Right Side"));
    poly      <- bindem;
    
#
    
    output          <- list()
    output$x        <- x;
    output$y        <- y;
    output$x2       <- x2;
    output$y2       <- y2;
    output$tCrit    <- tCrit;
    output$m1       <- 0;
    output$m2       <- nonCentParm*sqrt(degFree/(1+degFree));
#    output$df1      <- df1;
#    output$df2      <- df2;
#    output$poly     <- poly;
    output$px       <- poly[,1];
    output$py       <- poly[,2];
    output$pid      <- poly[,3];
    output$powerVal <- powerVal;
    
    output$ss       <- ss0;
    output$sd0      <- sd0;
    output$es       <- es0;
    output$sigLevel <- sig0;
       
    return(output)
    
}
#
# sampledData generates a simulated experiment: data and stats
#  
#
sampledData <- function(mu,delta,sigma,n,alpha) {
	x <- rnorm(n, mean = mu, sd = sigma)
	y <- rnorm(n, mean = mu+delta, sd = sigma)

	xbar <- mean(x)
	ybar <- mean(y)

	xs   <- sd(x)
	ys   <- sd(y)

	degFree <- 2*n - 2; 
	rootN   <- sqrt(n);

	sEfct   <- sqrt(xs^2+ys^2)/rootN;

	tStat   <- (xbar-ybar)/sEfct;

	tCrit  <- qt(1-alpha/2,df = degFree);
	tInd   <- qt(1-alpha/2,df = n-1);

	pValue <- (1-pt(abs(tStat),df = degFree))*2;

	nonCentParm <- delta*rootN/(sqrt(2)*sigma);

	p1          <- pt(tCrit,df = degFree,ncp = nonCentParm);
	p2          <- pt(-tCrit,df = degFree,ncp = nonCentParm);

	betaVal     <- p1-p2;
	powerVal    <- 1-betaVal;

	myStats <- list()
	myParms <- list()
    
	tLow  <- tStat - tCrit;
	tHigh <- tStat + tCrit;

	myStats$tStat <- tStat;
	myStats$xbar  <- xbar;
	myStats$ybar  <- ybar;
	myStats$xs    <- xs;
	myStats$ys    <- ys;
	myStats$efct  <- abs(xbar-ybar);
	myStats$sEfct <- sEfct;
	myStats$efctp <- myStats$efct + sEfct*tCrit;
	myStats$efctm <- myStats$efct - sEfct*tCrit;
	myStats$pValue <- pValue;

	myStats$xm    <- xbar-(xs/rootN)*tInd;
	myStats$xp    <- xbar+(xs/rootN)*tInd;

	myStats$ym    <- ybar-(ys/rootN)*tInd;
	myStats$yp    <- ybar+(ys/rootN)*tInd;

	myParms$tCrit    <- tCrit;
	myParms$powerVal <- powerVal;
	myParms$delta    <- delta;
	myParms$sigma    <- sigma;
	myParms$alpha    <- alpha;
	myParms$n        <- n;
	myParms$tIng     <- tInd;
	myParms$mu       <- mu;    
    
    	myOutput <-list()
    	myOutput$myParms <- myParms
    	myOutput$myStats <- myStats
    	myOutput$x <- x
    	myOutput$y <- y
    	
    	
    return(myOutput)
}
#
#
getTPlot <- function(x1,y1,x2,y2,px,py,pid){

      df1 <- data.frame(X = x1, Y = y1);
      df2 <- data.frame(X = x2, Y = y2);
      
      bindem    <- data.frame(X = px,Y=py,id=pid);
      bindem$id <- factor(bindem$id,  labels=c("Power","Type I Error Left Side","Type I Error Right Side"));
      poly      <- bindem;

      peakAlt      <- x2[which.max(y2)];
      yMaxValue    <- 1.2*dt(0,df=2);
        
      plotOutput <- list();
      
          
            p <- ggplot(poly, aes(X,Y,fill=id,group=id))
            p <-  p + geom_polygon(show.legend=T, alpha=I(8/10))
            p <-  p + geom_line(data=df1, aes(X,Y, color="Null", group=NULL, fill=NULL), size=1.2, show.legend=F)  
            p <-  p + geom_line(data=df2, aes(X,Y, color="Alternative", group=NULL, fill=NULL),size=1.2, show.legend=F) 
      
            p <-  p + scale_color_manual("Group", values= c("Null" = "blue","Alternative" = "green")) 
            p <-  p + scale_fill_manual("Test",   values= c("Power"="chartreuse","Type I Error Left Side" = "cornflowerblue","Type I Error Right Side" = "cornflowerblue")) 
            
            p <-  p + annotate("text", label="Null", x=-0.5, y=1.05*max(y1), parse=T, size=6) 
            p <-  p + annotate("text", label="Alternative", x=peakAlt*1.3, y=1.05*max(y1), parse=T, size=6) 
            p <-  p + ylim(0,1.2*yMaxValue)
              # remove some elements
            p <-  p + theme(panel.grid.minor = element_blank(),
                    panel.grid.major = element_blank(),
                    panel.background = element_blank(),
                    plot.background = element_rect(fill="white"),
                    panel.border = element_blank(),
                    axis.line = element_blank(),
                    #axis.text.x = element_blank(),
                    axis.text.y = element_blank(),
                    axis.ticks = element_blank(),
                    axis.title.x = element_blank(),
                    axis.title.y = element_blank(),
                    plot.title = element_text(size=22))
                    
            plotOutput$p <- p;           
      
    return(plotOutput)
}
#
#
plotScatter <- function(x,y,myStats,myParms) {

	myBarDat <- data.frame(case = c("Control","Treatment"),sampleMeans = c(myStats$xbar,myStats$ybar),
			       mins = c(myStats$xm,myStats$ym),maxes = c(myStats$xp,myStats$yp))
	p1 <- ggplot() +  geom_bar(data = myBarDat, mapping = aes(y = sampleMeans, x = case),stat="identity",width=0.25)
	p1 <- p1       +  geom_errorbar(data = myBarDat, mapping = aes(x = case, ymin = mins, ymax=maxes),width=0.1,color="blue",size=2)
	p1 <- p1       +  geom_point(data = myBarDat, mapping = aes(y = sampleMeans, x = case),stat="identity",color="blue",size=5)

#	myLineDat <- data.frame(case=c("Control","Treatment"),cLevel=c(myParms$mu,myParms$mu),
#	             tLevel=c(myParms$mu+myParms$delta,myParms$mu+myParms$delta))
	             
	p1 <- p1 + geom_hline(yintercept=myParms$mu)
	p1 <- p1 + geom_hline(yintercept=myParms$mu+myParms$delta)
	
	xy  <- c(x,y)
	xyN <- c(replicate(myParms$n,"Control"),replicate(myParms$n,"Treatment"))

	myRawDat <- data.frame(case = xyN,datVals = xy)

	p1 <- p1 + geom_point(data = myRawDat, mapping=aes(x=case,y=datVals),size=4,color="red")	
	p1 <- p1 + ylim(0,myParms$mu+5*myParms$sigma) + xlab(NULL) + ylab(NULL)
	p1 <- p1 + theme(axis.ticks.y = element_blank(), axis.text.y = element_blank())
	p1 <- p1 + annotate(geom="text",label="Control Group\n Population Level",x=1.5,y=myParms$mu*0.9) 
	p1 <- p1 + annotate(geom="text",label="Treatment Group\n Population Level",x=1.5,y=myParms$mu*1.1+myParms$delta)
	
    return(p1)
}