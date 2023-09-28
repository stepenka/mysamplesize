plotScatter <- function(xDF,myStats,myParms) {

	g <- xDF$group
	y <- xDF$x
	
	gU    <- unique(g)
	xbar  <- myStats$xbar
	xp    <- myStats$xp
	xm    <- myStats$xm
	
	myBarDat <- data.frame(case = gU,sampleMeans = xbar, mins = xm,maxes = xp)
	p1 <- ggplot() +  geom_bar(data = myBarDat, mapping = aes(y = sampleMeans, x = case),stat="identity",width=0.3)
	p1 <- p1       +  geom_errorbar(data = myBarDat, mapping = aes(x = case, ymin = mins, ymax=maxes),width=0.1,color="blue",size=2)
	p1 <- p1       +  geom_point(data = myBarDat, mapping = aes(y = sampleMeans, x = case),stat="identity",color="blue",size=3)
    
	for (i in 1:myParms$p){
		p1 <- p1 + geom_hline(yintercept=myParms$mu+myParms$delta[i])
	}
#	xy  <- c(x,y)
#	xyN <- c(replicate(myParms$n,"Control"),replicate(myParms$n,"Treatment"))

#	myRawDat <- data.frame(case = xyN,datVals = xy)

        myRawDat <- xDF

	p1 <- p1 + geom_point(data = myRawDat, mapping=aes(x=g,y=x),size=2,color="red")	
	p1 <- p1 + ylim(0,myParms$mu+5*myParms$sigma) + xlab(NULL) + ylab(NULL)
	p1 <- p1 + theme(axis.ticks.y = element_blank(), axis.text.y = element_blank())
#	p1 <- p1 + annotate(geom="text",label="Control Group\n Population Level",x=1.5,y=myParms$mu*0.9) 
#	p1 <- p1 + annotate(geom="text",label="Treatment Group\n Population Level",x=1.5,y=myParms$mu*1.1+myParms$delta)
	
    return(p1)
}