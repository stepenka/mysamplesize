postHocPower <- function(sigLevel,dfPH,nGp,nonCentPH){
#
#  requires library("mvtnorm") and r3.5.2 or above.
#
sig         <- sigLevel;
k           <- nGp-1; 
p           <- 1-sig;
ndf         <- dfPH;
outPut = list();

		C               <- matrix(1/2,ncol=k,nrow=k)+(1/2)*diag(k);
        tOut            <- qmvt(p,tail="both.tails",corr=C,df=ndf);
		tCritDunnett    <- tOut$quantile;
        tCritTukey      <- qtukey(p,nmeans=nGp,df=ndf)/sqrt(2);
        tCritBonfDunn   <- qt(1-sig/(2*k),df=ndf);
        tCritBonfTukey  <- qt(1-sig/(nGp*k),df=ndf);

		powerValDunnett    <- 1-(pt(tCritDunnett,df=ndf,ncp=nonCentPH) -   pt(-tCritDunnett,df=ndf,ncp=nonCentPH));
		powerValTukey      <- 1-(pt(tCritTukey,df=ndf,ncp=nonCentPH) -     pt(-tCritTukey,df=ndf,ncp=nonCentPH));
		powerValBonfDunn   <- 1-(pt(tCritBonfDunn,df=ndf,ncp=nonCentPH) -  pt(-tCritBonfDunn,df=ndf,ncp=nonCentPH));
		powerValBonfTukey  <- 1-(pt(tCritBonfTukey,df=ndf,ncp=nonCentPH) - pt(-tCritBonfTukey,df=ndf,ncp=nonCentPH));
		
outPut$tCritDunnett      <- tCritDunnett;
outPut$tCritTukey        <- tCritTukey;
outPut$tCritBonfDunn     <- tCritBonfDunn;
outPut$tCritBonfTukey    <- tCritBonfTukey;
outPut$powerValDunnett   <- powerValDunnett;#powerValBonfDunn; #
outPut$powerValTukey     <- powerValTukey;
outPut$powerValBonfDunn  <- powerValBonfDunn;
outPut$powerValBonfTukey <- powerValBonfTukey;

return(outPut)
}