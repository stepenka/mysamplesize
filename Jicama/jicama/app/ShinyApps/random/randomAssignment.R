randomAssignment <- function(nSubPerGp,nLevelsEachTrtFactor,nLevelsEachNonTrtFactor,isCrossOver) {
#
# randomAssignment generates a randomization table to assign subjects to experimental groups
# 
#    nSubPerGp            = number of subjects per experimental groups
#    treatmentFactors     = vector of levels (including control) for each treatment factor, length is number of treatment factors.
#    nonTreatmentFactors  = vector of levels for each nontreatment factor, length is number of nontreatment factors.
#    isCrossOver          = 1 for crossover study (will have latin square design), 0 if not
#
#    output is a 3-d array of random numbers whose dimensions are
#           nSubPerGp x number of treatment groups (product of levels for each treatment) x number of nontrt factor groups.
#           **each non-treatment factor group represents a distinct subset of the subject population.  As such, each
#             non-treatment factor group gets a separate subject randomization list. For example, the female subjects and male subjects
#             get separate randomization lists.
#           **within each non-treatment factor group, the subjects are randomly assigned to treatment groups. 
#       
#    for a parallel repeated measure study, the randomization list is the same as for the non-repeated measures study with the
#          same ANOVA grouping structure
#
#    for a crossover study, there should be only one treatment with multiple levels and no other factors.
#          in this case output is a 2-d array, whose first column represents subject number (the randomization list)
#          the remaining columns of the outPut array are the latin square design for treatment level sequencing
#
n   <- nSubPerGp;
tF  <- nLevelsEachTrtFactor;
fF  <- nLevelsEachNonTrtFactor;

ntF <- length(tF);  # no dims of treatments
ntG <- prod(tF);    # total number of treatment groups

nfF <- length(fF);  # no dims of non-treatment factors
nfG <- prod(fF);    # total number of nontreatment factor groups

ntS <- ntG*n;       # total number of subjects per non-treatment factor

if (isCrossOver == 0){

	r1 <- array(0,dim=c(n,ntG,nfG));

	for (kk in 1:nfG){

		x       <- sample(c(1:ntS),size=ntS,replace=FALSE);
		
		iCount <- 1;
		for (ii in 1:n){
			for (jj in 1:ntG){
				r1[ii,jj,kk] <- x[iCount];
				iCount <- iCount + 1;
			}
		}
	}
	outPut <- r1
}

if (isCrossOver == 1){

	x       	<- sample(c(1:ntS),size=ntS,replace=FALSE);
	outPut 		<- matrix(0,nrow = ntS,ncol=1+ntG);
	outPut[,1]  <- x;
	
    rr 			<- sample(c(1:ntG),size=ntG,replace=FALSE);
	r2 			<- matrix(0,nrow = ntG,ncol = ntG);
	r2[,1]  	<- rr;
	
	for (ii in 2:ntG){ 
		r2[1:(ntG-ii+1),ii]   <- rr[ii:ntG];
		r2[(ntG-ii+2):ntG,ii] <- rr[1:(ii-1)];
	}
	
	iSubNum <- 0;
	for (ii in 1:ntG){
		for (jj in 1:n){
			iSubNum <- iSubNum + 1;
			outPut[iSubNum,2:(ntG+1)] <- r2[ii,];
		}
	}
}

return(outPut)

}

