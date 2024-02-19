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
setBounds <- function(){

	myBounds <- list()
	
 	myBounds$minSampSize <- 2
 	myBounds$maxSampSize <- 42
 	myBounds$minES       <- 0.1
 	myBounds$maxES       <- 2.0
 	myBounds$minSD       <- 0.4
 	myBounds$maxSD       <- 2.0;
 	myBounds$minSL       <- 0.0001;
 	myBounds$maxSL       <- 0.1;
 	myBounds$minMu       <- 0.1
 	myBounds$maxMu       <- 4.0 
	myBounds$maxNG       <- 8;
	myBounds$minNG       <- 2;	
 	return(myBounds)
 }
setDefaults <- function(){

 	myDefaults           <- list()
 	
  	myDefaults$ss          <- 6
  	myDefaults$es          <- 0.7
  	myDefaults$sd          <- 1
  	myDefaults$sigLevel    <- 0.05;
  	myDefaults$mu1         <- 1;
	myDefaults$mu2         <- 2;
	myDefaults$nGroups     <- 3;
	
  	return(myDefaults)
 }
# functions here
#
#    all the helper functions call the omnibus function setFTest, which contains the
#        relevant commands for constructing the helper graph data.
#
# efctSizer calls setBounds, setDefaults, setFTest
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
efctSizer <- function(ss0,es0,sd0,logSL,ng0){

	bnds  <- setBounds();
	dfts  <- setDefaults();
	
	sig0   <- 10^(logSL);
	
	output <- setFTest(bnds$minSampSize,bnds$maxSampSize,bnds$minES,bnds$maxES,bnds$minSD,bnds$maxSD,bnds$minSL,bnds$maxSL,bnds$minNG,bnds$maxNG,ss0,es0,sd0,sig0,ng0);
    
	return(output)
}
setFTest <- function(minSS,maxSS,minES,maxES,minSD,maxSD,minSL,maxSL,minNG,maxNG,ss0,es0,sd0,sig0,ng0) {

    degFreeN    <- ng0 - 1;
	degFreeD    <- ng0*(ss0 - 1);
	
	sEfct       <- (es0)
	nonCentParm <- (ng0-1)*ss0*(sEfct/sd0)^2;
	fCrit       <- qf(1-sig0,df1 = degFreeN,df2=degFreeD)
	p1          <- pf(fCrit,df1 = degFreeN,df2=degFreeD,ncp = nonCentParm);
	betaVal     <- p1
	powerVal    <- 1-betaVal
    
	ncpMax       <- maxSS*(maxNG-1)*(maxES/minSD)^2;
	xMax         <- qf(0.999,df1 = degFreeN,df2=degFreeD,ncp = nonCentParm);
	
    lenOut       <- 200
	x            <- seq(xMax/lenOut, xMax, length.out=lenOut);
	x1           <- x;
	x2           <- x;
	y1           <- df(x,df1=degFreeN,df2=degFreeD);
	y2           <- df(x,df1=degFreeN,df2=degFreeD,ncp=nonCentParm);
    
    # if there are any zero values in x, then the df functions makes Inf/NaNs
    #y1[!is.finite(y1)] <- 0
    #y2[!is.finite(y2)] <- 0
	
    yMaxValue    <- max(y1);
    
# Alpha polygons
    datum2     <- data.frame(X=x1, Y=y1, id=2);
    datum_cut2 <- datum2[datum2$X >= fCrit, ];
    poly2      <- rbind(datum2, c(fCrit, 0,2));

# power polygon; 1-beta
    datum1    <- data.frame(X=x2, Y=y2, id=1);
    datum_cut1<- datum1[datum1$X >= fCrit,];
    poly1     <- rbind(datum1, c(fCrit, 0,1));
    
    bindem    <- rbind(poly1, poly2);
    bindem    <- rbind(datum1, datum2);
#    bindem$id <- factor(bindem$id,  labels=c("Power","Type I Error Left Side","Type I Error Right Side"));
    poly      <- bindem;

#
    
    output          <- list()
    output$x        <- x;
    output$y        <- y1;
    output$x2       <- x2;
    output$y2       <- y2;
    output$fCrit    <- fCrit;
    output$m1       <- x1[which.max(y1)];
    output$m2       <- x2[which.max(y2)];
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
	output$ng       <- ng0;
       
    return(output)
    
}
#
# sampledData generates a simulated experiment: data and stats
#  
#
sampledData <- function(mu,delta0,sigma,n,p,alpha) {
#
#  Simulate data
#
    x <- rnorm(n*p, mean = mu, sd = sigma)
	x <- matrix(x, nrow = n, byrow=TRUE)
	
	qq <- seq(0,p-1,1);
	
	delta <- delta0*qq/sd(qq);

	y <- rep(0,n*p)	
	g <- rep(0,n*p)
	k <- 0
	for(i in 1:p){
	    for(j in 1:n){
	        x[j,i] <- x[j,i] + delta[i]
	        k <- k + 1;
	        g[k] <- i
	        y[k] <- x[j,i]
	    }
	}
	
	xbar <- apply(x,2,mean);
	xs   <- apply(x,2,sd);

	xs   <- sd(x)
	ys   <- sd(y)
	
	xgm  <- mean(y);
	
	ssRes <- 0
	ssHyp <- 0
	for(i in 1:p){
	    for(j in 1:n){
	        ssRes <- ssRes + (x[j,i] - xbar[i])^2
	        ssHyp <- ssHyp + (x[j,i] - xgm)^2;
	    }
	}
	
#
# Compute stats for H0 testing
#       
        degFreeN    <- p - 1;
	degFreeD    <- p*(n - 1);

	fStat   <- (degFreeD*(ssHyp - ssRes))/(degFreeN*ssRes)
	pValue  <- 1 - pf(fStat,df1 = degFreeN,df2=degFreeD)
#
# Compute confidence intervals
#       
        degFree     <- n - 1;
	tCrit       <- qt(1-alpha/2,df = degFree)
	xbL         <- xbar - xs*(tCrit/sqrt(n))
	xbU         <- xbar + xs*(tCrit/sqrt(n))

#
# Power computation
#

	sEfct       <- sd(delta)
	nonCentParm <- (p-1)*n*(sEfct/sigma)^2;
	fCrit       <- qf(1-alpha,df1 = degFreeN,df2=degFreeD)
	p1          <- pf(fCrit,df1 = degFreeN,df2=degFreeD,ncp = nonCentParm);
	betaVal     <- p1
	powerVal    <- 1-betaVal

	## above here is good

	myStats <- list()
	myParms <- list()
    
	myStats$fStat  <- fStat;
	myStats$xbar   <- xbar;
	myStats$xs     <- xs;
	myStats$xm     <- xbL;
	myStats$xp     <- xbU;
	myStats$xgm    <- xgm;
#	myStats$tStats <- tStats;

	myStats$pValue <- pValue;

	myParms$tCrit    <- tCrit;
	myParms$fCrit    <- fCrit;
	myParms$powerVal <- powerVal;
	myParms$delta    <- delta;
	myParms$sEfct    <- sEfct;
	myParms$sigma    <- sigma;
	myParms$alpha    <- alpha;
	myParms$n        <- n;
	myParms$p        <- p;
	myParms$mu       <- mu;    
    
    	myOutput         <-list()
    	myOutput$myParms <- myParms
    	myOutput$myStats <- myStats
    	myOutput$x       <- x
    	myOutput$y       <- y
    	myOutput$xANOVA  <- data.frame(x=y,group=g)
    	
    return(myOutput)
}
#
#
getFPlot <- function(x1,y1,x2,y2,px,py,pid){

      df1 <- data.frame(X = x1, Y = y1);
      df2 <- data.frame(X = x2, Y = y2);
      
      bindem    <- data.frame(X = px,Y=py,id=pid);
      bindem$id <- factor(bindem$id,  labels=c("Power","Type I Error"));
      poly      <- bindem;

	  peakNull     <- x1[which.max(y1)];
      peakAlt      <- x2[which.max(y2)];
      yMaxValue    <- 1.2*max(y1);
        
      plotOutput <- list();
      
          
            p <- ggplot(poly, aes(X,Y,fill=id,group=id))
            p <-  p + geom_polygon(show.legend=T, alpha=I(8/10))
            p <-  p + geom_line(data=df1, aes(X,Y, color="Null", group=NULL, fill=NULL), size=1.2, show.legend=F)  
            p <-  p + geom_line(data=df2, aes(X,Y, color="Alternative", group=NULL, fill=NULL),size=1.2, show.legend=F) 
      
            p <-  p + scale_color_manual("Group", values= c("Null" = "blue","Alternative" = "green")) 
            p <-  p + scale_fill_manual("Test",   values= c("Type I Error" = "cornflowerblue","Power"="chartreuse")) 
            
            p <-  p + annotate("text", label="Null", x=peakNull, y=1.05*max(y1), parse=T, size=6) 
            p <-  p + annotate("text", label="Alternative", x=peakAlt*1.1, y=1.05*max(y2), parse=T, size=6) 
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
plotScatter <- function(xDF,myStats,myParms) {

	g <- xDF$group
	y <- xDF$x
	
	gU    <- unique(g)
	xbar  <- myStats$xbar
	xp    <- myStats$xp
	xm    <- myStats$xm
	
	myBarDat <- data.frame(case = gU,sampleMeans = xbar,
			       mins = xm,maxes = xp)
	p1 <- ggplot() +  geom_bar(data = myBarDat, mapping = aes(y = sampleMeans, x = case),stat="identity",width=0.3)
	p1 <- p1       +  geom_errorbar(data = myBarDat, mapping = aes(x = case, ymin = mins, ymax=maxes),width=0.1,color="blue",size=2)
	p1 <- p1       +  geom_point(data = myBarDat, mapping = aes(y = sampleMeans, x = case),stat="identity",color="blue",size=3)
	             
	for (i in 1:myParms$p){
		p1 <- p1 + geom_hline(yintercept=myParms$mu+myParms$delta[i])
	}
#	xy  <- c(x,y)
#	xyN <- c(replicate(myParms$n,"Control"),replicate(myParms$n,"Treatment"))

#	myRawDat <- data.frame(case = xyN,datVals = xy)

        myRawDat <- xDF

	p1 <- p1 + geom_point(data = myRawDat, mapping=aes(x=g,y=x),size=2,color="red")	
	p1 <- p1 + ylim(0,myParms$mu+5*myParms$sigma) + xlab(NULL) + ylab(NULL)
	p1 <- p1 + theme(axis.ticks.y = element_blank(), axis.text.y = element_blank())
#	p1 <- p1 + annotate(geom="text",label="Control Group\n Population Level",x=1.5,y=myParms$mu*0.9) 
#	p1 <- p1 + annotate(geom="text",label="Treatment Group\n Population Level",x=1.5,y=myParms$mu*1.1+myParms$delta)
	
    return(p1)
}
#
setThreeNormals  <- function(m1,m2,sd0) {

    minMu = setBounds()$minMu
    maxMu = setBounds()$maxMu
    
    m0 <- 0;
	
    x <- seq(m0 - 3.5*sd0, maxMu + 3.5*sd0, length.out=200)  
  
    # generate normal dist #1
    y1  <- dnorm(x, m1, sd0)

    # generate normal dist #2
    y2  <- dnorm(x, m2, sd0)
    
    # generate normal dist control
    y0 <- dnorm(x, m0, sd0)
	
    output          <- list()
    output$x1       <- x;
    output$y1       <- y1;
    output$x2       <- x;
    output$y2       <- y2;
    output$x0       <- x;
    output$y0       <- y0;
	output$es       <- sd(c(m0,m1,m2));
    output$d12      <- abs(m1-m2);
    output$d10      <- abs(m1-m0);
    output$d20      <- abs(m2-m0);

    # output some inputs
    output$sd0      <- sd0;
    output$sigLevel <- sd0;
    output$ss       <- setDefaults()$ss;
    
	return(output)
    
}
#
getThreeNormalsPlot <- function(x1,y1,x2,y2,x0,y0){

      df1 <- data.frame(X = x1, Y = y1);
      df2 <- data.frame(X = x2, Y = y2);
      df0 <- data.frame(X = x0, Y = y0);
     
      peakAlt      <- x2[which.max(y2)];
      yMaxValue    <- 1.2*max(y1);
        
      plotOutput <- list();
      
          
            p <- ggplot()
            p <-  p + geom_line(data=df0, aes(X,Y, group=NULL, fill=NULL),size=1.2, show.legend=F)  
            p <-  p + geom_line(data=df1, aes(X,Y, group=NULL, fill=NULL),size=1.2, show.legend=F) 
            p <-  p + geom_line(data=df2, aes(X,Y, group=NULL, fill=NULL),size=1.2, show.legend=F) 
    
            p <-  p + ylim(0,yMaxValue)
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