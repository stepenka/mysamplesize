import numpy as np
from pyhelp.simCalc.eyeMinus import eyeMinus
from pyhelp.simCalc.vertStack import vertStack

def buildXfn(nSubPerGpVec, nLevelsEachFactor):
    # USAGE: buildXfn(nSubPerGpVec,nLevelsEachFactor)
    #
    #  inputs:
    #      nSubPerGroup      = integer vector number of subjects per group
    #      nLevelsEachFactor = integer vector number of levels for each factor
    #                          length of this vector is the number of factors 
    #                           = 1,2, or 3
    # output:
    #     X = real matrix of size max(nSubPerGroup)*product(nLevelsEachFactor) by product(nLevelsEachFactor)
    #       = model matrix for the GLM formulation of multiway ANOVA.
    
    n       = np.atleast_1d(nSubPerGpVec)
    pv      = np.asarray(nLevelsEachFactor)
    p1      = pv - 1
    pC      = 2 + np.concatenate([[0], np.cumsum(p1)]) # 2 + [0, cumsum(p1)]
    nWay    = len(pv)
    nParm   = np.prod(pv)
    
    # n vector is the same size as # of groups (prod(pv))
    #     
    if len(n) == 1:
        n = n * np.ones(nParm)
    
    nMax    = int(np.max(n))
    nData   = nMax * nParm #np.sum(n)
    
    X       = np.zeros((nData,nParm))
    X[:,0]  = 1
    kCol    = 0

    # set basic first order effects
    for ii in range(nWay):
        q   = 1
        r   = 1

        if ii+1 < nWay:
            q = np.prod( pv[ii+1:nWay] )
        
        if ii>0:
            r = np.prod( pv[0:ii] )
        
        A = np.ones((nMax * q, 1))
        B = eyeMinus(A, pv[ii])
        C = vertStack(B, r)
        
        X[:, kCol+1:(kCol+p1[ii]+1) ] = C;
        
        kCol = kCol + p1[ii]

    # set 2nd order interaction effects
    for ii in range(nWay-1):
        for jj in range(ii+1, nWay):
            for i1 in range(p1[ii]):
                i2 = pC[ii] + (i1-1);
                for j1 in range(p1[jj]):
                    j2 = pC[jj] + (j1-1);
                    X[:,kCol + 1] = X[:,i2]*X[:,j2];
                    kCol = kCol + 1;

    # set 3rd order interaction effects
    for ii in range(nWay-1):
        for jj in range(ii+1, nWay):
            for kk in range(jj+1,nWay):
                for i1 in range(p1[ii]):
                    i2 = pC[ii] + (i1-1)

                    for j1 in range( p1[jj] ):
                        j2 = pC[jj] + (j1-1)

                        for k1 in range( p1[kk] ):
                            k2 = pC[kk] +(k1-1)
                            X[:, kCol+1] = X[:,i2]*X[:,j2]*X[:,k2]
                            kCol = kCol + 1
    
    X = removeRows(X, n)
    
    return(X);
    
def removeRows(X0, nSubPerGpVec):
    nMax    = np.max(nSubPerGpVec);
    rows    = []
    nSub2Add= -nMax
    
    for nSub in nSubPerGpVec:
        nSub2Add += nMax
        if nSub < nMax:
            rows2del = nSub2Add + range(nMax - nSub)
            rows.append(rows2del)
    
    if rows:
        rows = np.concatenate(rows).flatten()
    
    X = np.delete(X0, rows, axis=0)
    
    return X
