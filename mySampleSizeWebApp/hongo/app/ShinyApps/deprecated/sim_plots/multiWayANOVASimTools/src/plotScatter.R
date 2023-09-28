plotScatter <- function(muControl,sigLevel,stDev,nSubPerGp,nLevelsEachFactor,efctSizeEachEffect,efctPatterns,simOut) {
    
	g <- simOut$g
	y <- simOut$y
	
	gU    <- unique(g)
	xbar  <- simOut$xbar
	xp    <- simOut$xbU
	xm    <- simOut$xbL
    
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
	
	if (nWay == 1) {

		myBarDat <- data.frame(case = gU,sampleMeans = xbar,mins = xm,maxes = xp)
	
		p1 <- ggplot() +  geom_bar(data = myBarDat, mapping = aes(y = sampleMeans, x = case),stat="identity",width=0.3)
		p1 <- p1       +  geom_errorbar(data = myBarDat, mapping = aes(x = case, ymin = mins, ymax=maxes),width=0.1,color="blue",size=2)
		p1 <- p1       +  geom_point(data = myBarDat, mapping = aes(y = sampleMeans, x = case),stat="identity",color="blue",size=3)
	             
		mList <- matrix(0,nrow=nParms,ncol=1);
		for (i in 1:nParms){
			mList[i]   <- simOut$trueLvls[i];
			p1         <- p1 + geom_hline(yintercept=mList[i])
		}
		
		yMin <- min(mList) - 3*stDev
		yMax <- max(mList) + 3*stDev


		myRawDat <- data.frame(y=y,g=g)

		p1 <- p1 + geom_point(data = myRawDat, mapping=aes(x=g,y=y),size=2,color="red")	
		p1 <- p1 + ylim(0,yMax) + xlab(NULL) + ylab(NULL)
	
		p1 <- p1 + theme(axis.ticks.y = element_blank(), axis.text.y = element_blank())

	}
	if (nWay == 2) {

		xBar1 <- matrix(0,ncol=1,nrow = nParms);
		xP1   <- matrix(0,ncol=1,nrow = nParms);
		xM1   <- matrix(0,ncol=1,nrow = nParms);
		
		g1    <- gU[,1];
		g2    <- gU[,2];
		
		k <- 1;
		
		for (ii in 1:pv[1]){
		for (jj in 1:pv[2]){
			xBar1[k] <- xbar[ii,jj];
			xP1[k]   <- xp[ii,jj];
			xM1[k]   <- xm[ii,jj];
			k        <- k+1;
		}
		}
			
		myBarDat <- data.frame(case = g1,scndry=g2,sampleMeans = xBar1,mins = xM1,maxes = xP1)
		
		p1 <- ggplot() +  geom_point(data = myBarDat, aes(y = sampleMeans, x = factor(case), group=scndry, color=scndry),stat="identity",size=3)
		p1 <- p1 +  geom_line(data = myBarDat, aes(y = sampleMeans, x = factor(case), group=scndry, color=scndry),stat="identity",size=0.1)
		
		p1 <- p1 + geom_errorbar(data = myBarDat, aes(x = factor(case), group=scndry, color=scndry,ymin = mins, ymax=maxes),width=0.2,color="blue",size=0.2)
		#p1 <- p1       +  geom_point(data = myBarDat, mapping = aes(y = sampleMeans, x = case),stat="identity",color="blue",size=3)
	             
		#mList <- matrix(0,nrow=nParms,ncol=1);
		#for (i in 1:nParms){
		#	mList[i]   <- simOut$trueLvls[i];
		#	p1         <- p1 + geom_hline(yintercept=mList[i])
		#}
		
		#yMin <- min(mList) - 3*stDev
		#yMax <- max(mList) + 3*stDev


		#myRawDat <- data.frame(y=y,g=g)

		#p1 <- p1 + geom_point(data = myRawDat, mapping=aes(x=g,y=y),size=2,color="red")	
		#p1 <- p1 + ylim(0,yMax) + xlab(NULL) + ylab(NULL)
	
		#p1 <- p1 + theme(axis.ticks.y = element_blank(), axis.text.y = element_blank())

	}
 	if (nWay == 3) {

		pList <- list();
		
		for (iThird in 1:pv[3]){
			xBar1 <- matrix(0,ncol=1,nrow = pv[1]*pv[2]);
			xP1   <- matrix(0,ncol=1,nrow = pv[1]*pv[2]);
			xM1   <- matrix(0,ncol=1,nrow = pv[1]*pv[2]);
		
			g1    <- matrix(0,ncol=1,nrow = pv[1]*pv[2]);
			g2    <- matrix(0,ncol=1,nrow = pv[1]*pv[2]);
			
			k <- 1;
			for (ii in 1:pv[1]){
				for (jj in 1:pv[2]){
					xBar1[k] <- xbar[ii,jj,iThird];
					xP1[k]   <- xp[ii,jj,iThird];
					xM1[k]   <- xm[ii,jj,iThird];
					g1[k]    <- ii;
					g2[k]    <- jj;
					k        <- k+1;
				}
			}
			
			myBarDat <- data.frame(case = g1,scndry=g2,sampleMeans = xBar1,mins = xM1,maxes = xP1)
		
			p1 <- ggplot() +  geom_point(data = myBarDat, aes(y = sampleMeans, x = factor(case), group=scndry, color=scndry),stat="identity",size=3)
			p1 <- p1 +  geom_line(data = myBarDat, aes(y = sampleMeans, x = factor(case), group=scndry, color=scndry),stat="identity",size=0.1)
		
			p1 <- p1 + geom_errorbar(data = myBarDat, aes(x = factor(case), group=scndry, color=scndry,ymin = mins, ymax=maxes),width=0.2,color="blue",size=0.2)
			pList[[iThird]] <- p1;
			
		}
        
		p1 <- do.call(grid.arrange,pList);

	}
	return(p1)
}