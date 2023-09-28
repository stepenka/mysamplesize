sampledData <- function(mu,delta,sigma,n,p,alpha) {
#
#  Simulate data
#
        x <- rnorm(n*p, mean = mu, sd = sigma)
	x <- matrix(x, nrow = n, byrow=TRUE)

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