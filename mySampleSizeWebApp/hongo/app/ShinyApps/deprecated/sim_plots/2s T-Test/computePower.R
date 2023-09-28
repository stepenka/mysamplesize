computePower <- function(mu,delta,sigma,n,alpha) {

	degFree <- 2*n - 2; 
	rootN   <- sqrt(n);

	tCrit  <- qt(1-alpha/2,df = degFree);

	nonCentParm <- delta*rootN/(sqrt(2)*sigma);

	p1          <- pt(tCrit,df = degFree,ncp = nonCentParm);
	p2          <- pt(-tCrit,df = degFree,ncp = nonCentParm);

	betaVal     <- p1-p2;
	powerVal    <- 1-betaVal;
	
	myParms = list();

	myParms$tCrit    <- tCrit;
	myParms$powerVal <- powerVal;
	myParms$delta    <- delta;
	myParms$sigma    <- sigma;
	myParms$alpha    <- alpha;
	myParms$n        <- n;
	myParms$betaVal  <- betaVal;
	myParms$mu       <- mu;        	
    	
    return(myParms)
}