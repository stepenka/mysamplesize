selectResponseShape <- function(iType,deltaValue,p) {
    delta <- seq(from = 0,to = (p-1),by = 1);
	switch(iType,
        linearUp={
            delta <- deltaValue*(delta)/sd(delta)
        },
        linearDown={ 
            delta <- -deltaValue*(delta)/sd(delta)
        },
        invertedU={ 
            delta <- (delta)*((p*1.1-delta))
            delta <- deltaValue*(delta)/sd(delta)
        },
        regU={ 
            delta <- (delta)*(delta - p*1.02) + p
            delta <- deltaValue*(delta)/sd(delta)
        },
        stop("enter linearUp, linearDown, regU, or invertedU")
    )
	#output <- list()
	#output$efct1 <- delta;
    return(delta)
}
