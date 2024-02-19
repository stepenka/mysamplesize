selectResponseShape2 <- function(iType,deltaValue,d1,d2) {
    
	pp <- length(d1);
	qp <- length(d2);
	delta <- matrix(0,nrow=pp,ncol=qp);  

	dd1 <- d1[pp]-d1[1];
	dd2 <- d2[qp]-d2[1];
    md1 <- sign(dd1);
	md2 <- sign(dd2);
	
	ad1 <- abs(dd1);
	ad2 <- abs(dd2);
	
	intSign <- md2;
	if (ad1<ad2) {iMx <- 1}
    
	switch(iType,
       coop={for(i in 1:pp){for(j in 1:qp){
                 delta[i,j] <- md1*(d1[i])*(d2[j])}}
              },
       oppo={for(i in 1:pp){for(j in 1:qp){
                 delta[i,j] <- intSign*(d1[i])*(d2[j])}}
              },
       stop("enter coop or oppo")
    )
    
	delta <- deltaValue*delta/(sd(delta)*sqrt((pp*qp-1)/((pp-1)*(qp-1))));
	
    return(delta)
}
