computePower <- function(mu,delta,sigma,n,p,alpha) {
#
# Power computation
#
    degFreeN    <- p - 1;
	degFreeD    <- p*(n - 1);
	
	sEfct       <- (delta)
	nonCentParm <- (p-1)*n*(sEfct/sigma)^2;
	fCrit       <- qf(1-alpha,df1 = degFreeN,df2=degFreeD)
	p1          <- pf(fCrit,df1 = degFreeN,df2=degFreeD,ncp = nonCentParm);
	betaVal     <- p1
	powerVal    <- 1-betaVal

	myParms <- list()
    
	myParms$fCrit    <- fCrit;
	myParms$powerVal <- powerVal;
	myParms$delta    <- delta;
	myParms$sEfct    <- sEfct;
	myParms$sigma    <- sigma;
	myParms$alpha    <- alpha;
	myParms$n        <- n;
	myParms$p        <- p;
	myParms$mu       <- mu;    
    
    return(myParms)
}