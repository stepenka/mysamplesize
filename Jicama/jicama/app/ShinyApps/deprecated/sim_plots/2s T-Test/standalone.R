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


    #------------------------------------------------------
	myStats$xbar  <- vector(,2)
    myStats$xbar[1] <- xbar
    myStats$xbar[2] <- ybar

	myStats$efct  <- abs(xbar-ybar);
	myStats$sEfct <- sEfct;
	myStats$efctp <- myStats$efct + sEfct*tCrit;
	myStats$efctm <- myStats$efct - sEfct*tCrit;
	myStats$pValue <- pValue;
    
    myStats$delta <- vector(,2)
    myStats$delta[1] <- mu
    myStats$delta[2] <- mu+delta
    
	xm    <- xbar-(xs/rootN)*tInd;
	xp    <- xbar+(xs/rootN)*tInd;

	ym    <- ybar-(ys/rootN)*tInd;
	yp    <- ybar+(ys/rootN)*tInd;

	myStats$errBarL <- vector(,2)
    myStats$errBarU <- vector(,2)
    
    #myStats$errBarL <- xbar-(xs/rootN)*tInd
    #myStats$errBarU <- xbar+(xs/rootN)*tInd
    
    myStats$errBarL[1] <- xm
    myStats$errBarL[2] <- ym
    myStats$errBarU[1] <- xp
    myStats$errBarU[2] <- yp
    
    myStats$y <- c(x,y)
    #------------------------------------------------------
    
    
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
