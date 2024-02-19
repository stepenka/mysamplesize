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