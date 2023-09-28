selectResponseShape <- function(iType,deltaValue,p) {
    switch(iType,
       linear={delta <- c(1:p)
               delta <- deltaValue*(delta-mean(delta))/sd(delta)
              },
       saturate={delta <- 1 - exp( -c(1:p)/(p/2) )
                 delta <- deltaValue*(delta-mean(delta))/sd(delta)
              },
       invertedU={delta <- c(1:(p))
                  delta <- (delta)*((p-delta)^(1/2))
                  delta <- deltaValue*(delta-mean(delta))/sd(delta)
              },
       stop("enter linear,saturate, or invertedU")
    )
    return(delta)
}
               