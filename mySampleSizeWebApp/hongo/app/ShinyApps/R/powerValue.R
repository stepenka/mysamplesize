# Calculate Statistical Power
library(pwr)

ktest <- function() {
    tmp <- list("value"=c(0,1,2), "error"=FALSE, "msg"="");
}
# =================================================
# Calc Statistical Power
# =================================================
powerValue <- function(test, es, ss, sig, groups) {
    
    tmp <- list("value"=0, "error"=FALSE, "msg"="");
    
    if (es < 0.01) { #Error check lower bound limit
        es <- 0.01
    }
    if (es > 5) { #Error check upper bound limit
        es <- 5
    }
    
    #----------------------------------------------
    ttest <- 0
    if (test == "T-Test - One Sample" ) {
        ttest <- "one.sample"
    }
    else if (test == "T-Test - Two Sample" ) {
        ttest <- "two.sample"
    }
    else if (test == "Paired T-Test" ) {
        ttest <- "paired"
    }
    
    if( ttest != 0 ){
        retval <- tryCatch({
            ans          <- pwr.t.test(n = ss, d = es, sig.level = sig, power = NULL, type=ttest)   	
            tmp["value"] <- round(ans$power,4)
            tmp
        }, error=function(e){
            tmp["error"] <- TRUE
            tmp["msg"]   <- sprintf("ERROR : %s \n",conditionMessage(e))
            #cat( tmp["msg"] )
            tmp
        })
        return( retval)
    }
    #----------------------------------------------
    
    if (test == "Simple Linear Model" ) {
        retval <- tryCatch({
            num          <- groups - 1
            denom        <- (ss- 1) * groups
            ans          <- pwr.f2.test(u = num,v = denom, f2 = es, sig.level = sig, power = NULL)
            tmp["value"] <- round(ans$power,4)
            tmp
        }, error=function(e){
            tmp["error"] <- TRUE
            tmp["msg"]   <- sprintf("ERROR : %s \n",conditionMessage(e))
            #cat( tmp["msg"] )
            tmp
        })
        return( retval )
    } 
    else if (test == "1-Way ANOVA" ) {
        retval <- tryCatch({
            ans <- pwr.anova.test(k = groups, n = ss, f = es, sig.level = sig, power = NULL)  	
            tmp["value"] <- round(ans$power,4)
            tmp
        }, error=function(e){
            tmp["error"] <- TRUE
            tmp["msg"]   <- sprintf("ERROR : %s \n",conditionMessage(e))
            #cat( tmp["msg"] )
            tmp
        })
        return( retval )
    } else {
        tmp["value"] <- 0
        tmp["error"] <- TRUE;
        tmp["msg"]   <- "No test selected";
        return(tmp)
    }
}

powerValueAOV2 <- function(sig, df2, dfM, dfS, dfI, lambda) {
    tmp <- list("value"=c(0), "error"=FALSE, "msg"="");
    sig <- as.numeric(sig)
    
	retval <- tryCatch({
	#F value for main effects
	  quant <- qf(sig, dfM, df2, lower=FALSE) #quantile function
	  powerM <- pf(quant, dfM, df2, lambda[1], lower=FALSE) #distribution function
	  tmp1 <- round(powerM,4)
	  
	#F value for secondary effects
	  quant <- qf(sig, dfS, df2, lower=FALSE) #quantile function
	  powerS <- pf(quant, dfS, df2, lambda[2], lower=FALSE) #distribution function
	  tmp2 <- round(powerS,4)
	  
	#F value for interaction effects
	  quant <- qf(sig, dfI, df2, lower=FALSE) #quantile function
	  powerI <- pf(quant, dfI, df2, lambda[3], lower=FALSE) #distribution function
	  tmp3 <- round(powerI,4)
      
      tmp["value"] <- c(tmp1,tmp2,tmp3)
      tmp
	}, 
    error=function(e){
        tmp["error"] <- TRUE
        tmp["msg"]   <- sprintf("ERROR : %s \n",conditionMessage(e))
        #cat( tmp["msg"] )
        tmp
    })
	return( retval )
}

# power calc for AOVmulti is applicable to RMPS1 and RMCS1
powerValueAOVmulti <- function(sig, df1, df2, lambda) {
    tmp <- list("value"=c(0), "error"=FALSE, "msg"="");
	sig <- as.numeric(sig)
	
	retval <- tryCatch({  
		for (ii in 1:length(df1)) 
		{
			quant <- qf(sig, df1[ii], df2, lower=FALSE) #quantile function
			power <- pf(quant, df1[ii], df2, lambda[ii], lower=FALSE) #distribution function
			tmp$value[ii] <- round(power,4)
		}
        tmp
    }, error=function(e){
		tmp["error"] <- TRUE
		tmp["msg"]   <- sprintf("ERROR : %s \n",conditionMessage(e))
        #cat( tmp["msg"] )
        tmp
    })
	return( retval )
}

# =================================================
# Calc Sample Size
# =================================================
sampleSizeValue <- function(test, es, pow, sig, groups) {

    if (es < 0.01) { #Error check lower bound limit
        es <- 0.01
    }
    if (es > 500) { #Error check upper bound limit
        es <- 1
    }

    tmp <- list("value"=0, "error"=FALSE, "msg"="");
    
    #----------------------------------------------
    ttest <- 0
    if (test == "T-Test - One Sample" ) {
        ttest <- "one.sample"
    }
    else if (test == "T-Test - Two Sample" ) {
        ttest <- "two.sample"
    }
    else if (test == "Paired T-Test" ) {
        ttest <- "paired"
    }
    
    if( ttest != 0 ){
        retval <- tryCatch({
            ans          <- pwr.t.test(n = NULL, d = es, sig.level = sig, power = pow, type=ttest)   	
            tmp["value"] <- ceiling(ans$n)
            tmp
        }, error=function(e){
            tmp["error"] <- TRUE
            tmp["msg"]   <- sprintf("ERROR : %s \n",conditionMessage(e))
            tmp
        })
        return( retval )
    }
    #----------------------------------------------
    
    if (test == "Simple Linear Model" ) {
        retval <- tryCatch({
            num <- groups - 1
            denominator <- pwr.f2.test(u = num,v = NULL, f2 = es, sig.level = sig, power = pow)
            sample <- (denominator$v + groups) / groups 
            tmp["value"] <- ceiling(sample)
            tmp
        }, error=function(e){
            tmp["error"] <- TRUE
            tmp["msg"]   <- sprintf("ERROR : %s \n",conditionMessage(e))
            #cat("ERROR :",conditionMessage(e), "\n")
            tmp
        })
        return( retval )
    } 
    else if (test == "1-Way ANOVA" ) {
        retval <- tryCatch({
            ans <- pwr.anova.test(k = groups, n = NULL, f = es, sig.level = sig, power = pow)
            tmp["value"] <- ceiling(ans$n)
            tmp
        }, error=function(e){
            tmp["error"] <- TRUE
            tmp["msg"]   <- sprintf("ERROR : %s \n",conditionMessage(e))
            #cat("ERROR :",conditionMessage(e), "\n")
            tmp
        })
        return( retval )
    } else {
        tmp <- 0
        return(tmp)
    }
}

sampleValueAOV2 <- function(dfM, dfS, dfI, k, sig, pow, es, lambda) {
    tmp <- list("value"=c(0), "error"=FALSE, "msg"="");
    
	#Main effects
	tmp1 <- sampleAOV2calc(dfM,k,n=NULL,es,sig,pow,lambda[1])
	#Secondary effects
	tmp2 <- sampleAOV2calc(dfS,k,n=NULL,es,sig,pow,lambda[2])
	#Interaction effects
	tmp3 <- sampleAOV2calc(dfI,k,n=NULL,es,sig,pow,lambda[3])

	tmp$value <- c(tmp1,tmp2,tmp3)
    return( tmp )
}

sampleAOV2calc <- function (df1=NULL, k=NULL, n = NULL, f = NULL, sig.level = NULL, power = NULL, lambda = NULL) { 
    Fvaln <- quote({
    nlambda <- n*lambda
    pf(qf(sig.level, df1, (n-1)*k, lower=FALSE), df1, (n-1)*k, nlambda, lower=FALSE)
    })
  
    ans <-  try({
      uniroot(function(n) eval(Fvaln) - power, c(2 + 1e-10, 1e+05))$root
      }, silent = TRUE)

    n <- if(is.numeric(ans)==TRUE){
      ceiling(ans)
      } else {1}

    n 
}

sampleValueAOVmulti <- function(df1,k,sig,pow,lambda) {
	tmp <- list("value"=c(0), "error"=FALSE, "msg"="");
	for (i in 1:length(df1)) {
        sample <- suppressWarnings(sampleAOVMcalc(as.numeric(df1[i]),k,n=NULL,sig,pow,as.numeric(lambda[i])))
        tmp$value[i] <- if (sample=="NaN"){
        	0
        } else { ceiling(sample) } 
    }
    return( tmp )
}

sampleAOVMcalc <- function (df1=NULL, k=NULL, n = NULL, sig.level = NULL, power = NULL, lambda = NULL) {
  
    Fvaln <- quote({
        nlambda <- n*lambda
        pf(qf(sig.level, df1, (n-1)*k, lower=FALSE), df1, (n-1)*k, nlambda, lower=FALSE)
    })

    n <- tryCatch({
        suppressWarnings(uniroot(function(n) eval(Fvaln) - power, c(2 + 1e-10, 1e+05),extendInt="yes")$root)
    }, 
    error=function(e){
        print("error")
    })

    if(n=="error"){
        0
    } else{ n }
}

sampleValueRMPS1 <- function(df1,k,sig,pow,lambda) {
	tmp <- list("value"=c(0), "error"=FALSE, "msg"="");
	for (i in 1:length(df1)) {
        sample <- suppressWarnings(sampleRMPS1calc(as.numeric(df1[i]),as.numeric(k[i]),n=NULL,sig,pow,as.numeric(lambda[i])))
        tmp$value[i] <- if (sample=="NaN"){
        	0
        } else { ceiling(sample) } 
    }
    return( tmp )
}

sampleRMPS1calc <- function (df1=NULL, k=NULL, n = NULL, sig.level = NULL, power = NULL, lambda = NULL) {
  
    Fvaln <- quote({
        nlambda <- n*lambda
        pf(qf(sig.level, df1, (n-1)*k, lower=FALSE), df1, (n-1)*k, nlambda, lower=FALSE)
    })

    n <- tryCatch({
        suppressWarnings(uniroot(function(n) eval(Fvaln) - power, c(2 + 1e-10, 1e+05),extendInt="yes")$root)
    }, 
    error=function(e){
        print(e)
    })

    if(n=="error"){
        0
    } else{ n }
}

sampleValueRMCS1_ori <- function(df1, k, sig, pow, lambda) {
	tmp <- list("value"=0, "error"=FALSE, "msg"="");
    sample <- suppressWarnings(sampleRMCS1calc(df1,k,n=NULL,sig,pow,lambda))
	
	if (sample=="NaN"){
		tmp$error <- TRUE
		tmp$msg <- "nan sample"
		tmp$value <- -1
	} else { tmp$value <- ceiling(sample) } 

    return( tmp )
}

sampleValueRMCS1 <- function(df1, k, sig, pow, lambda) {
	tmp <- list("value"=c(0,0), "error"=FALSE, "msg"="");
    sample <- suppressWarnings(sampleRMCS1calc(df1,k,n=NULL,sig,pow,lambda))
	
	if (sample=="NaN"){
		tmp$error <- TRUE
		tmp$msg <- "nan sample"
		tmp$value[1] <- -1
		tmp$value[2] <- -1
	} else { 
	    tmp$value[1] <- ceiling(sample)
		tmp$value[2] <- k*ceiling(sample)
    } 

    return( tmp )
}

sampleRMCS1calc <- function (df1 = NULL, k = NULL, n = NULL, sig.level = NULL, power = NULL, lambda = NULL) {
  
    Fvaln <- quote({
        nlambda <- n*lambda
        pf(qf(sig.level, df1, df1*(n*k-1), lower=FALSE), df1, df1*(n*k-1), nlambda, lower=FALSE)
    })

    n <- tryCatch({
        suppressWarnings(uniroot(function(n) eval(Fvaln) - power, c(2 + 1e-10, 1e+05),extendInt="yes")$root)
    }, 
    error=function(e){
        print(e)
    })

    if(n=="error"){
        0
    } else{ n }
}
