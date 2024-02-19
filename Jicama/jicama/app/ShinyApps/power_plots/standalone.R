
library(pwr)

powerTTest <- function(es, p, sig, ttype) {
    np <- length(p);
    nd <- length(es);
    
    samp_array <- array(numeric(nd*np), dim=c(nd,np))  
    for (i in 1:np){
        for (j in 1:nd){
            result <- pwr.t.test(n=NULL, d=es[j], sig.level=sig, power=p[i], type=ttype)
            samp_array[j,i] <- result$n 
        }
    }

    samp_array
}

powerSLM <- function(es, p, sig) {
    np <- length(p);
    nd <- length(es);
    num_df <-  1 
    samp_array <- array(numeric(nd*np), dim=c(nd,np))
    
    for (i in 1:np){
        for (j in 1:nd){
           #result <- pwr.f2.test(n=NULL, d=es[j], sig.level=sig, power=p[i], type=ttype)
            result <- pwr.f2.test(u=num_df, v=NULL, f2 = es[j], sig.level=sig, power = p[i])
            samp_array[j,i] <- result$v 
        }
    }

    samp_array
}

powerANOVA <- function(es, p, sig, ngroups) {
    np <- length(p);
    nf <- length(es);
    
    samp_array <- array(numeric(nf*np), dim=c(nf,np))

    for (i in 1:np){
	#print(p[i])
        for (j in 1:nf){
            # is this tryCatch needed?
            try({
                #result <- pwr.anova.test(k=ngroups, n=NULL, f=es[j], sig.level=sig, power=p[i])
				result <- pwr.anova.test(k=ngroups, n=NULL, f=es[j]*sqrt((ngroups-1)/ngroups), sig.level=sig, power=p[i])
                nn     <- floor(result$n)
				resTest<- pwr.anova.test(k=ngroups, n=nn, f=es[j]*sqrt((ngroups-1)/ngroups), sig.level=sig, power=NULL)
				powTest<-resTest$power

				while (powTest < p[i]) {
				   
				    nn      <- nn + 1;
				    resTest <- pwr.anova.test(k=ngroups, n=nn, f=es[j]*sqrt((ngroups-1)/ngroups), sig.level=sig, power=NULL)
				    powTest <-resTest$power	

				}					
                samp_array[j,i] <- nn 
            },silent=TRUE);
        }
    }
 
    samp_array
}




sample_A2_func <- function (df1=NULL, k=NULL, n = NULL, lambda2 = NULL, sig.level = NULL, power = NULL)
{
    Fvaln <- quote({
        ##    lambda <- k*n*f^2
        lambda <- n*lambda2
        pf(qf(sig.level, df1, (n-1)*k, lower=FALSE), df1, (n-1)*k, lambda, lower=FALSE)
    })

#    n <- round((uniroot(function(n) eval(Fvaln) - power, c(2 + 1e-10, 1e+05))$root))
    n <- ceiling((uniroot(function(n) eval(Fvaln) - power, c(2 + 1e-10, 1e+05))$root))
    n
}

powerANOVA2 <- function(es, p, sig, nGroups, aovEffect)
{
    # warning( cat(aovEffect=="M", "\n") );
    
    np <- length(p);
    nf <- length(es);

    k <- nGroups[1] * nGroups[1];
    
    df1 <- if (aovEffect == "M"){ nGroups[1] - 1 } 
    else if (aovEffect == "S") { nGroups[2] - 1 } 
    else if (aovEffect == "I") { ( nGroups[1] - 1 )*( nGroups[2] - 1 ) }

    lambda1 <- if (aovEffect == "M"){ nGroups[2] } 
    else if (aovEffect == "S") { nGroups[1] } 
    else if (aovEffect == "I") { 1 }

    samp_array <- array(numeric(nf*np), dim=c(nf,np))
    for (j in 1:nf){
        lambda2 <- df1*lambda1*es[j]^2  
        for (i in 1:np){
            try({
                result <- sample_A2_func(df1=df1, k=k, n=NULL, lambda2=lambda2, sig.level=sig, power = p[i])
                samp_array[j,i] <- result
            }, silent = TRUE)
        }
    }

    samp_array
}

sample_A2_func2 <- function (df1=NULL, k=NULL, n = NULL, lambda2 = NULL, sig.level = NULL, power = NULL) {

    Fvaln <- quote({
        lambda <- n*lambda2
        pf(qf(sig.level, df1, (n-1)*k, lower=FALSE), df1, (n-1)*k, lambda, lower=FALSE)
    })

    fValFn <- function(n)eval(Fvaln)
    testLow <- fValFn(2)
    testHigh <- fValFn(50)
    if (power < testLow) {n<-2}
    if (power > testHigh) {n<-NA}
    if (power >= testLow && power <= testHigh) {
#        n <- round((uniroot(function(n) eval(Fvaln) - power, c(2 + 1e-10, 1e+05))$root))
        n <- ceiling((uniroot(function(n) eval(Fvaln) - power, c(2 + 1e-10, 1e+05))$root))
		}
    n
} 

powerAOVM <- function(es, p, sig, totGrpProd, numdf, lambda1)
{
    np <- length(p);
    nf <- length(es);
    
    samp_array <- array(numeric(nf*np), dim=c(nf,np)) 

    for (j in 1:nf){
        lambda2 <- lambda1 * es[j]^2

        for (i in 1:np){
            try({
                result <- sample_A2_func(df1=numdf, k=totGrpProd, n=NULL, lambda2=lambda2, sig.level=sig, power=p[i])
                samp_array[j,i] <- result
            }, silent = TRUE)
        }
    }
    
    samp_array
}
