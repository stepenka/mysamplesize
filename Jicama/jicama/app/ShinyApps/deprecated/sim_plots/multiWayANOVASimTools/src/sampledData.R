sampledData <- function(muControl,sigLevel,stDev,nSubPerGp,nLevelsEachFactor,efctSizeEachEffect,efctPatterns) {
#
#  Simulate data
#
# 
powerOut<- anovaPower(sigLevel,stDev,nSubPerGp,nLevelsEachFactor,efctSizeEachEffect);

n   	<- nSubPerGp;
pv  	<- nLevelsEachFactor;
del 	<- efctSizeEachEffect;
pattrn  <- efctPatterns;

# length(pv)   = 1, 2, or 3
# length(del)  = 1, 3, or 7
# del          = 1; 1,2,1-2; 1,2,3,1-2,1-3,2-3,1-2-3

nParms <- prod(pv);
nWay   <- length(pv);
N      <- n*nParms;

x 	 <- matrix(rnorm(N, mean = 0, sd = stDev))
y    <- matrix(0,nrow = N,ncol = 1);
yA   <- array(0,dim=c(n,pv));
g    <- matrix(0,nrow = N,ncol = nWay);
xbar <- array(0,dim=pv);
xs   <- array(0,dim=pv);
xbL  <- array(0,dim=pv);
xbU  <- array(0,dim=pv);
tCrit<- qt(1-sigLevel/2,df=(n-1));

XX   <-buildXfn(nSubPerGp,nLevelsEachFactor);

XXi  <- solve(t(XX)%*%XX);

myOutput <- list()

if (nWay == 1){
	
	H1     <- cbind(matrix(0,ncol=1,nrow=pv[1]-1),diag(1,pv[1]-1),matrix(0,ncol=nParms-pv[1],nrow=pv[1]-1));
	H1i    <- solve(H1%*%XXi%*%(t(H1)));
	
	
	alf <- matrix(0,ncol = 1,nrow = pv[1]);
	alf <- pattrn$efct1 - mean(pattrn$efct1);
	alf <- del[1]*(alf/sd(alf));
	mu0 <- muControl - alf[1];
	
	k <- 1;
	for(i in 1:pv[1]){
		for(j in 1:n){
			y[k] 	<- x[k] + mu0 + alf[i];
			yA[j,i] <- y[k];
 			g[k] 	<- i;
			k 		<- k + 1;
		}
		xbar[i] <- mean(yA[,i]);
		xs[i]   <- sd(yA[,i]);
		xbL[i]  <- xbar[i] - xs[i]*(tCrit/sqrt(n))
	    xbU[i]  <- xbar[i] + xs[i]*(tCrit/sqrt(n))
	}
	
	xgm  <- mean(y);
	ss   <- lm( y ~ XX - 1);
	bet  <- coefficients(ss);
	
	s2hat<-var(ss$residuals);
	
	alfE            <- matrix(0,ncol=1,nrow=pv[1]);
	alfE[1:pv[1]-1] <- bet[2:pv[1]];
	alfE[pv[1]]     <- -sum(bet[2:pv[1]]);
	
	efct1e          <- sqrt(sum(alfE^2)/(pv[1]-1) - s2hat/n);
	
	
	yF   <- XX%*%bet;
	resF <- y-yF;
	resH <- y-xgm;
	
	ssF  <- sum(resF^2)/N;
	ssH  <- sum(resH^2)/N;
	
	fStat1 <- (N-pv[1])*(ssH-ssF)/((pv[1]-1)*ssF);
	pVal1  <-  1 - pf(fStat1,df1 = (pv[1]-1),df2=(N-pv[1]));
	
	ssH1   <- (t(H1%*%bet))%*%H1i%*%(H1%*%bet)/N;
	fStatH1  <- ((N-nParms)/(pv[1]-1))*(ssH1/ssF);
	pValH1   <-  1 - pf(fStatH1,df1 = (pv[1]-1),df2=(N-nParms));
	
    myStats         <- list()
	myStats$xbar    <- xbar;
	myStats$xs      <- xs;
	myStats$xbL     <- xbL;	
	myStats$xbU     <- xbU;
	myStats$y       <- y;
	myStats$yA      <- yA;
	myStats$bet     <- bet;
	myStats$ss      <- ss;
	myStats$xgm     <- xgm;
	myStats$fStat1  <- fStat1;
	myStats$pVal1   <- pVal1;
	myStats$fStatH1 <- fStatH1;
	myStats$pValH1  <- pValH1;	
	myStats$g       <- g;
	myStats$alf     <- alf;
	myStats$mu0     <- mu0;
	myStats$trueLvls<- mu0+alf;
	myStats$efct1e  <- efct1e;
    
    myOutput$myStats <- myStats

} 

if (nWay == 2) {

    H1  <- cbind(matrix(0,ncol=1,nrow=pv[1]-1),diag(1,pv[1]-1),matrix(0,ncol=nParms-pv[1],nrow=pv[1]-1));
 	H2  <- cbind(matrix(0,ncol=pv[1],nrow=pv[2]-1),diag(1,pv[2]-1),matrix(0,ncol=nParms-(pv[1]+pv[2]-1),nrow=pv[2]-1));	
 	H12 <- cbind(matrix(0,ncol=pv[1]+pv[2]-1,nrow=(pv[1]-1)*(pv[2]-1)),diag(1,(pv[1]-1)*(pv[2]-1)));
	
    alf <- matrix(0,ncol = 1,nrow = pv[1]);
    bta <- matrix(0,ncol = 1,nrow = pv[2]);
    gam <- matrix(0,ncol = pv[2],nrow = pv[1]);
	
	gamDotDot <- mean(pattrn$efct12);
	alfDot    <- mean(pattrn$efct1);
	btaDot    <- mean(pattrn$efct2);
	
	for (ii in 1:pv[1]){
		gamiiDot <- mean(pattrn$efct12[ii,]);
		alf[ii]  <- pattrn$efct1[ii] - alfDot + gamiiDot - gamDotDot;
		for (jj in 1:pv[2]){
			gamDotjj   <- mean(pattrn$efct12[,jj]);
			bta[jj]    <- pattrn$efct2[jj] - btaDot + gamDotjj - gamDotDot;	
			gam[ii,jj] <- pattrn$efct12[ii,jj] - gamiiDot - gamDotjj + gamDotDot;
		}
	}
	
### stopped here. 	alf <- del[1]*(alf/sd(alf)); mu0 <- muControl - alf[1];
	
	alf <- del[1]*(alf/sd(alf));
	bta <- del[2]*(bta/sd(bta));
	gam <- del[3]*(gam/(sd(gam)*sqrt((pv[1]*pv[2]-1)/((pv[1]-1)*(pv[2]-1)))));
	
	mu0 <- muControl - alf[1] - bta[1] - gam[1,1];
	
	k   <- 1;
	
    trueLvls  <- matrix(0,ncol=pv[2],nrow=pv[1]);
		
	for(i1 in 1:pv[1]){
	for(i2 in 1:pv[2]){
		for(j in 1:n){
			y[k] 	    <- x[k] + mu0 + alf[i1] + bta[i2] + gam[i1,i2];
			yA[j,i1,i2] <- y[k];
			
			g[k,1] 	    <- i1;
			g[k,2] 	    <- i2;
			k 		    <- k + 1;
		}
		xbar[i1,i2] 	<- mean(yA[,i1,i2]);
		xs[i1,i2]   	<- sd(yA[,i1,i2]);
		xbL[i1,i2]  	<- xbar[i1,i2] - xs[i1,i2]*(tCrit/sqrt(n))
	    xbU[i1,i2]  	<- xbar[i1,i2] + xs[i1,i2]*(tCrit/sqrt(n))
		trueLvls[i1,i2] <- mu0 + alf[i1] + bta[i2] + gam[i1,i2];
		
	}
	}
	xgm    <- mean(y);
	ss     <- lm( y ~ XX - 1);
	bet    <- coefficients(ss);
	s2hat  <- var(ss$residuals);
	
	alfE              <- matrix(0,ncol=1,nrow=pv[1]);
	alfE[1:(pv[1]-1)] <- bet[2:pv[1]];
	alfE[pv[1]]       <- -sum(bet[2:pv[1]]);	
	e1sq              <- max(0,(sum(alfE^2)/(pv[1]-1) - s2hat/(pv[2]*n)));
	efct1e            <- sqrt(e1sq);
	
	btaE              <- matrix(0,ncol=1,nrow=pv[2]);
	btaE[1:(pv[2]-1)] <- bet[(pv[1]+1):(pv[1]+pv[2]-1)];
	btaE[pv[2]]       <- -sum(bet[(pv[1]+1):(pv[1]+pv[2]-1)]);	
	e2sq              <- max(0,sum(btaE^2)/(pv[2]-1) - s2hat/(pv[1]*n));
	efct2e            <- sqrt(e2sq);
	
	gam1            <- bet[(pv[1]+pv[2]):(pv[1]*pv[2])];
    gam2            <- matrix(gam1,nrow=pv[1]-1,byrow=TRUE);
    gamR 			<- -rowSums(gam2);
    gamC 			<- -colSums(gam2);
    gamm 			<- -sum(gamC);    
    gamE 			<- matrix(0,nrow=pv[1],ncol=pv[2])
    
	gamE[1:(pv[1]-1),1:(pv[2]-1)] <- gam2;
	gamE[pv[1],1:(pv[2]-1)]       <- matrix(gamC,nrow=1);
	gamE[1:(pv[1]-1),pv[2]]       <- matrix(gamR,ncol=1);
	gamE[pv[1],pv[2]]             <- gamm;
	gam3                          <- matrix(gamE,ncol=1);
	
	e12sq    <- sum(gam3^2)/((pv[1]-1)*(pv[2]-1)) - s2hat/(n);
	if (e12sq<0){e12sq <-0 }
	efct12e  <- sqrt(e12sq);

	yF     <- XX %*% bet;
	resF   <- y-yF;
	
	H1i    <- solve(H1%*%XXi%*%(t(H1)));
	H2i    <- solve(H2%*%XXi%*%(t(H2)));
	H12i   <- solve(H12%*%XXi%*%(t(H12)));
	
	ssF    <- t(resF) %*% (resF);
	
	ssH1   <- (t(H1%*%bet))%*%H1i%*%(H1%*%bet);
	ssH2   <- (t(H2%*%bet))%*%H2i%*%(H2%*%bet);
	ssH12  <- (t(H12%*%bet))%*%H12i%*%(H12%*%bet);
	
	fStat1  <- ((N-nParms)/(pv[1]-1))*(ssH1/ssF);
	pVal1   <-  1 - pf(fStat1,df1 = (pv[1]-1),df2=(N-nParms));

	fStat2  <- ((N-nParms)/(pv[2]-1))*(ssH2/ssF);
	pVal2   <-  1 - pf(fStat2,df1 = (pv[2]-1),df2=(N-nParms));
	
	fStat12  <- ((N-nParms)/((pv[1]-1)*(pv[2]-1)))*(ssH12/ssF);
	pVal12   <-  1 - pf(fStat12,df1 = (pv[1]-1)*(pv[2]-1),df2=(N-nParms));	
	
	myOutput$xbar <- xbar;
	myOutput$xs   <- xs;
	myOutput$xbL  <- xbL;	
	myOutput$xbU  <- xbU;
	myOutput$y    <- y;
	myOutput$yA   <- yA;
	myOutput$bet  <- bet;
	myOutput$ss   <- ss;
	myOutput$xgm  <- xgm;
	myOutput$g    <- g;
	myOutput$alf  <- alf;
	myOutput$bta  <- bta;
	myOutput$gam  <- gam;
	myOutput$mu0    <- mu0;
	myOutput$trueLvls<- trueLvls;
	
	myOutput$fStat1  <- fStat1;
	myOutput$pVal1   <- pVal1;
	myOutput$fStat2  <- fStat2;
	myOutput$pVal2   <- pVal2;
	myOutput$fStat12 <- fStat12;
	myOutput$pVal12  <- pVal12;
	
	myOutput$alfE <- alfE;
	myOutput$btaE <- btaE;
	myOutput$gamE <- gamE;	
	myOutput$gamR <- gamR;	
	myOutput$gamC <- gamC;	
	
	myOutput$efct1e   <- efct1e;
	myOutput$efct2e   <- efct2e;
	myOutput$efct12e  <- efct12e;	
	}

 if (nWay == 3) {
 
	pList  <-c(1,pv[1]-1,pv[2]-1,pv[3]-1,(pv[1]-1)*(pv[2]-1),(pv[1]-1)*(pv[3]-1),(pv[3]-1)*(pv[2]-1),(pv[1]-1)*(pv[2]-1)*(pv[3]-1));
	pSum   <- cumsum(pList);
    pFront <- pSum - pList;

    H1  <- cbind(matrix(0,ncol=pSum[1],nrow=pList[2]),diag(1,pList[2]),matrix(0,ncol=nParms-pSum[2],nrow=pList[2]));
 	H2  <- cbind(matrix(0,ncol=pSum[2],nrow=pList[3]),diag(1,pList[3]),matrix(0,ncol=nParms-pSum[3],nrow=pList[3]));	
 	H3  <- cbind(matrix(0,ncol=pSum[3],nrow=pList[4]),diag(1,pList[4]),matrix(0,ncol=nParms-pSum[4],nrow=pList[4]));	
    H12 <- cbind(matrix(0,ncol=pSum[4],nrow=pList[5]),diag(1,pList[5]),matrix(0,ncol=nParms-pSum[5],nrow=pList[5]));
 	H13 <- cbind(matrix(0,ncol=pSum[5],nrow=pList[6]),diag(1,pList[6]),matrix(0,ncol=nParms-pSum[6],nrow=pList[6]));	
 	H23 <- cbind(matrix(0,ncol=pSum[6],nrow=pList[7]),diag(1,pList[7]),matrix(0,ncol=nParms-pSum[7],nrow=pList[7]));	
 	H123<- cbind(matrix(0,ncol=pSum[7],nrow=pList[8]),diag(1,pList[8]));	
	
    alf <- matrix(0,ncol = 1,nrow = pv[1]);
    bta <- matrix(0,ncol = 1,nrow = pv[2]);
    gam <- matrix(0,ncol = 1,nrow = pv[3]);
    dlt <- matrix(0,ncol = pv[2],nrow = pv[1]);
    epl <- matrix(0,ncol = pv[3],nrow = pv[1]);
    eta <- matrix(0,ncol = pv[3],nrow = pv[2]);
	xi  <- array(0,dim = pv);
	
	alfDot    <- mean(pattrn$efct1);
	btaDot    <- mean(pattrn$efct2);
	gamDot    <- mean(pattrn$efct3);
	dltDotDot <- mean(pattrn$efct12);
	eplDotDot <- mean(pattrn$efct13);
	etaDotDot <- mean(pattrn$efct23);	
	xiDotDotDot <- mean(pattrn$efct123);
		
	for (ii in 1:pv[1]){
		dltiiDot <- mean(pattrn$efct12[ii,]);
		epliiDot <- mean(pattrn$efct13[ii,]);
		xiiiDotDot <- mean(pattrn$efct123[ii,,]);
		alf[ii]  <- pattrn$efct1[ii] - alfDot + dltiiDot - dltDotDot + epliiDot - eplDotDot + xiiiDotDot - xiDotDotDot;
		
		for (jj in 1:pv[2]){
			dltDotjj   <- mean(pattrn$efct12[,jj]);
			etaDotjj   <- mean(pattrn$efct23[jj,]);
		    xijjDotDot <- mean(pattrn$efct123[,jj,]);
			xiiijjDot  <- mean(pattrn$efct123[ii,jj,]);
		    bta[jj]    <- pattrn$efct2[jj] - btaDot + dltDotjj - dltDotDot + etaDotjj - etaDotDot + xijjDotDot - xiDotDotDot;	
			dlt[ii,jj] <- pattrn$efct12[ii,jj] - dltiiDot - dltDotjj + dltDotDot + xiiijjDot - xiiiDotDot -xijjDotDot + xiDotDotDot;
			
			for (kk in 1:pv[3]){
				eplDotkk   <- mean(pattrn$efct13[,kk]);
				etaDotkk   <- mean(pattrn$efct23[,kk]);
				xiDotDotkk <- mean(pattrn$efct123[,,kk]); 
				xijjkkDot  <- mean(pattrn$efct123[,jj,kk]);
			    xiiikkDot  <- mean(pattrn$efct123[ii,,kk]);
				gam[kk]    <- pattrn$efct3[kk] - gamDot + eplDotkk - eplDotDot + etaDotkk - etaDotDot + xiDotDotkk - xiDotDotDot;	
				epl[ii,kk] <- pattrn$efct13[ii,kk] - epliiDot - eplDotkk + eplDotDot + xiiikkDot - xiDotDotkk - xiiiDotDot + xiDotDotDot;
				eta[jj,kk] <- pattrn$efct23[jj,kk] - etaDotjj - etaDotkk + etaDotDot + xijjkkDot - xiDotDotkk - xijjDotDot + xiDotDotDot;
				xi[ii,jj,kk] <- pattrn$efct123[ii,jj,kk] - xiiijjDot -xiiikkDot - xijjkkDot + xiiiDotDot + xijjDotDot + xiDotDotkk - xiDotDotDot;
			}
		}
			
	}
	
### stopped here. 	alf <- del[1]*(alf/sd(alf)); mu0 <- muControl - alf[1];
	
	alf <- del[1]*(alf/sd(alf));
	bta <- del[2]*(bta/sd(bta));
	gam <- del[3]*(gam/sd(gam));
	dlt <- del[4]*(dlt/(sd(dlt)*sqrt((pv[1]*pv[2]-1)/((pv[1]-1)*(pv[2]-1)))));
	epl <- del[5]*(epl/(sd(epl)*sqrt((pv[1]*pv[3]-1)/((pv[1]-1)*(pv[3]-1)))));
	eta <- del[6]*(eta/(sd(eta)*sqrt((pv[3]*pv[2]-1)/((pv[3]-1)*(pv[2]-1)))));	
	xi  <- del[7]*(xi/(sd(xi)*sqrt((pv[1]*pv[2]*pv[3]-1)/((pv[1]-1)*(pv[2]-1)*(pv[3]-1)))));
	mu0 <- muControl - alf[1] - bta[1] - gam[1,1];
	
	trueLvls  <- array(0,dim = pv);
	
	k   <- 1;
	
	for(i1 in 1:pv[1]){
	for(i2 in 1:pv[2]){
	for(i3 in 1:pv[3]){
		for(j in 1:n){
			y[k] 	       <- x[k] + mu0 + alf[i1] + bta[i2] + gam[i3] + dlt[i1,i2]+epl[i1,i3]+eta[i2,i3]+xi[i1,i2,i3];
			yA[j,i1,i2,i3] <- y[k];
			
			g[k,1] 	    <- i1;
			g[k,2] 	    <- i2;			
			g[k,3] 	    <- i3;
			k 		    <- k + 1;
		}
		xbar[i1,i2,i3] <- mean(yA[,i1,i2,i3]);
		xs[i1,i2,i3]   <- sd(yA[,i1,i2,i3]);
		xbL[i1,i2,i3]  <- xbar[i1,i2,i3] - xs[i1,i2,i3]*(tCrit/sqrt(n))
	    xbU[i1,i2,i3]  <- xbar[i1,i2,i3] + xs[i1,i2,i3]*(tCrit/sqrt(n))
		
		trueLvls[i1,i2,i3] <- mu0 + alf[i1] + bta[i2] + gam[i3] + dlt[i1,i2] + epl[i1,i3] + eta[i2,i3] + xi[i1,i2,i3];
	}
	}
	}
	xgm    <- mean(y);
	ss     <- lm( y ~ XX - 1);
	bet    <- coefficients(ss);
	
	yF     <- XX %*% bet;
	resF   <- y-yF;
	
	H1i     <- solve(H1%*%XXi%*%(t(H1)));
	H2i     <- solve(H2%*%XXi%*%(t(H2)));
	H3i     <- solve(H3%*%XXi%*%(t(H3)));
	H12i    <- solve(H12%*%XXi%*%(t(H12)));
	H13i    <- solve(H13%*%XXi%*%(t(H13)));
	H23i    <- solve(H23%*%XXi%*%(t(H23)));
	H123i   <- solve(H123%*%XXi%*%(t(H123)));
	
	ssF    <- t(resF) %*% (resF);
	
	ssH1    <- (t(H1%*%bet))%*%H1i%*%(H1%*%bet);
	ssH2    <- (t(H2%*%bet))%*%H2i%*%(H2%*%bet);
	ssH3    <- (t(H3%*%bet))%*%H3i%*%(H3%*%bet);
	ssH12   <- (t(H12%*%bet))%*%H12i%*%(H12%*%bet);
	ssH13   <- (t(H13%*%bet))%*%H13i%*%(H13%*%bet);
	ssH23   <- (t(H23%*%bet))%*%H23i%*%(H23%*%bet);
	ssH123  <- (t(H123%*%bet))%*%H123i%*%(H123%*%bet);
	
	fStat1  <- ((N-nParms)/(pv[1]-1))*(ssH1/ssF);
	pVal1   <-  1 - pf(fStat1,df1 = (pv[1]-1),df2=(N-nParms));

	fStat2  <- ((N-nParms)/(pv[2]-1))*(ssH2/ssF);
	pVal2   <-  1 - pf(fStat2,df1 = (pv[2]-1),df2=(N-nParms));
	
	fStat3  <- ((N-nParms)/((pv[3]-1)))*(ssH3/ssF);
	pVal3   <-  1 - pf(fStat3,df1 = (pv[3]-1),df2=(N-nParms));	

	fStat12  <- ((N-nParms)/((pv[1]-1)*(pv[2]-1)))*(ssH12/ssF);
	pVal12  <-  1 - pf(fStat12,df1 = ((pv[1]-1)*(pv[2]-1)),df2=(N-nParms));

	fStat13  <- ((N-nParms)/((pv[1]-1)*(pv[3]-1)))*(ssH13/ssF);
	pVal13   <-  1 - pf(fStat13,df1 = ((pv[1]-1)*(pv[3]-1)),df2=(N-nParms));
	
	fStat23  <- ((N-nParms)/((pv[3]-1)*(pv[2]-1)))*(ssH23/ssF);
	pVal23   <-  1 - pf(fStat23,df1 = (pv[3]-1)*(pv[2]-1),df2=(N-nParms));	

	fStat123  <- ((N-nParms)/((pv[1]-1)*(pv[3]-1)*(pv[2]-1)))*(ssH123/ssF);
	pVal123   <-  1 - pf(fStat123,df1 = ((pv[1]-1)*(pv[3]-1)*(pv[2]-1)),df2=(N-nParms));
	
	myOutput$xbar <- xbar;
	myOutput$xs   <- xs;
	myOutput$xbL  <- xbL;	
	myOutput$xbU  <- xbU;
	myOutput$y    <- y;
	myOutput$yA   <- yA;
	myOutput$bet  <- bet;
	myOutput$ss   <- ss;
	myOutput$xgm  <- xgm;
	myOutput$g    <- g;
	myOutput$alf  <- alf;
	myOutput$bta  <- bta;
	myOutput$gam  <- gam;
	myOutput$dlt  <- dlt;
	myOutput$epl  <- epl;
	myOutput$eta  <- eta;
	myOutput$xi   <- xi;
	myOutput$mu0  <- mu0;
	myOutput$trueLvls<- trueLvls;
	
	myOutput$fStat1  <- fStat1;
	myOutput$pVal1   <- pVal1;
	myOutput$fStat2  <- fStat2;
	myOutput$pVal2   <- pVal2;
	myOutput$fStat3  <- fStat3;
	myOutput$pVal3   <- pVal3;
	myOutput$fStat12 <- fStat12;
	myOutput$pVal12  <- pVal12;
	myOutput$fStat13 <- fStat13;
	myOutput$pVal13  <- pVal13;
	myOutput$fStat23 <- fStat23;
	myOutput$pVal23  <- pVal23;
	myOutput$fStat123<- fStat123;
	myOutput$pVal123 <- pVal123;
	}
 	print( myOutput )
 return(myOutput)}