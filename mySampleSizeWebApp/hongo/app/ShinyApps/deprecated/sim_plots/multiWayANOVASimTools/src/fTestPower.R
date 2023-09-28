fTestPower <- function(sigLevel,degFreeN,degFreeD,nonCentParm) {
#
# Power computation
#
	fCrit       <- qf(1-sigLevel,df1 = degFreeN,df2=degFreeD)
	p1          <- pf(fCrit,df1 = degFreeN,df2=degFreeD,ncp = nonCentParm);
	betaVal     <- p1
	powerVal    <- 1-betaVal
	
	myParms          <- list()
	myParms$fCrit    <- fCrit;
	myParms$powerVal <- powerVal; 
    
    return(myParms)
}