buildXfn <- function(nSubPerGp,nLevelsEachFactor){
# USAGE: buildXfn(nSubPerGp,nLevelsEachFactor)
#
#  inputs:
#      nSubPerGroup      = integer scalar number of subjects per group
#      nLevelsEachFactor = integer vector number of levels for each factor
#                          length of this vector is the number of factors 
#                           = 1,2, or 3
# output:
#     X = real matrix of size nSubPerGroup*product(nLevelsEachFactor) by product(nLevelsEachFactor)
#       = model matrix for the GLM formulation of multiway ANOVA.

n    = nSubPerGp;
pv   = nLevelsEachFactor;
p1   = pv - 1;
pC   = 2+c(0,cumsum(p1));
nWay = length(pv);
fs   = seq(1,nWay);

nParm = prod(pv);
nData = n*nParm;

X      = matrix(0,nrow=nData,ncol=nParm);
X[,1]  = 1;
kCol   = 1;

# set basic first order effects

for (ii in 1:nWay){
    pMe = pv[ii];
    
    q   = 1;
	
	if ( (ii+1) <= nWay ){
        for (jj in (ii+1):nWay){
            q = q*pv[jj];
        }
	}
    #q = q*n;
    
    r = 1;
	if (ii>1) {
        for (kk in 1:(ii-1) ){
            r = r*pv[kk];
        }
    }
	
    A = matrix(1,nrow=n*q,ncol=1);
    B = eyeMinus(A,pv[ii]);
    C = vertStack(B,r);
    
    X[,(kCol+1):(kCol+p1[ii]) ]= C;
    
    kCol = kCol+p1[ii];
}

# set 2nd order interaction effects
 
for (ii in 1:nWay){
	if ( (ii+1) <= nWay ){
		for (jj in (ii+1):nWay){
			for (i1 in 1:p1[ii]){
				i2 = pC[ii] + (i1-1);
				for (j1 in 1:p1[jj]){
					j2 = pC[jj] + (j1-1);
					X[,kCol + 1] = X[,i2]*X[,j2];
					kCol = kCol + 1;
				}
			}
		}
	}
}

# set 3rd order interaction effects
 
for (ii in 1:nWay){
	if ( (ii+1) <= nWay ){
		for (jj in (ii+1):nWay){
			if ( (jj+1) <= nWay ){
				for (kk in (jj+1):nWay){
					for (i1 in 1:p1[ii]){
						i2 = pC[ii] + (i1-1);
						for (j1 in 1:p1[jj]){
							j2 = pC[jj] + (j1-1);
							for (k1 in 1:p1[kk]){
								k2 = pC[kk] +(k1-1);
								X[,kCol + 1] = X[,i2]*X[,j2]*X[,k2];
								kCol = kCol + 1;
							}
						}
					}
				}
			}
		}
    }
}
return(X);
}