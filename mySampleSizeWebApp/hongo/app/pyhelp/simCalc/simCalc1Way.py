#mu=5; deltaValue=0.5; sigma=1.2; n=10; alpha=0.05; p=3; n=10; iType="linearUp"

import numpy as np
from scipy.stats import t, f, nct, ncf

from pyhelp.simCalc import responseShape as rs
from pyhelp.simCalc.simSupport import * 
from pyhelp.simCalc.anovaPower import anovaPower
from pyhelp.simCalc.buildXfn import buildXfn

def pValueCalc(nLevelsEachFactor, sampSize, allDatVec):
    pv      = nLevelsEachFactor
    y       = allDatVec
    nParms  = np.prod(pv)
    
    XX      = buildXfn(sampSize, pv)
    XTX     = XX.T @ XX                     # equiv to X^T * X
    XXi     = np.linalg.inv(XTX)
    
    H1z1    = np.zeros((pv[0]-1, 1))
    H1diag  = np.diagflat( np.ones((pv[0]-1, 1)) )
    H1z2    = np.zeros( (pv[0]-1, nParms-pv[0]))
    H1      = np.hstack((H1z1, H1diag, H1z2))
    H1i     = np.linalg.inv(H1 @ XXi @ H1.T )
    
    sampSize= np.atleast_1d(sampSize)
    if len(sampSize) == 1:
        sampSize = sampSize * np.ones(nParms)
    
    N       = np.sum(sampSize) #sampSize * nParms
    
    xgm     = np.mean(y);
    ss      = np.linalg.lstsq(XX, y, rcond=None)
    bet     = ss[0]                     # coefficients
    s2hat   = np.var( XX @ bet - y )    # variance of residuals

    yF      = XX @ bet
    resF    = y - yF
    resH    = y - xgm
    
    ssF     = sum(resF**2)/N;
    ssH     = sum(resH**2)/N;
    
    fStat1  = (N-pv[0])*(ssH-ssF)/((pv[0]-1)*ssF);
    pValue  = f.sf(fStat1, dfn=(pv[0]-1), dfd=(N-pv[0]));
    
    return pValue


#def sampledData(mu, sigLevel, stDev, n, p, efctSizeEachEffect, iType):
def sampledData(mu, efctSizeEachEffect, stDev, n, sigLevel, p, iType, dataIn=None):
    if dataIn is not None:
        data= parseDataFromCSV(dataIn, 1)
        g   = np.asarray(data[:,0], 'int')
        x   = data[:,1]
        y   = x
        
        nGroups = np.unique(g)
        
        if len(nGroups) < 2:
            raise Exception('Number of groups must be equal to or greater than 2')
        
        nSub = []
        tmp = y[g==nGroups[0]]
        n = len(tmp)
        
        for ii in nGroups:
            tmp = y[g==ii]
            nSub.append( len(tmp) )
            #np.testing.assert_equal(n, len(tmp), 'An equal number of subjects is not in each group!');

        p       = len(np.unique(g))
        pv      = np.asarray([p])
        nParms  = np.prod(pv)
        
        # need to reshape the data in the same form as yA...
        # ...as far as minimal testing, the reshape below leads to: ytmp == yA
        
        # we need to do things this way in case the design is unbalanced
        n       = np.asarray(nSub)
        xbar    = np.zeros(nParms)
        xs      = np.zeros(nParms)
        yQuant  = np.zeros((nParms,5))
        ndx     = 0
        for ii in range(nParms):
            yTmp            = y[ndx : (ndx+nSub[ii])]
            xbar[ii]        = np.mean(yTmp)
            xs[ii]          = rsd(yTmp)
            yQuant[ii,:]    = quantileData(yTmp)
            ndx            += nSub[ii]
        
        # ...the original reshape works if n is the same for all groups...
        #yA = np.reshape(np.reshape(y, (n[0],-1), order='F'), (n[0],p))
        
        #import pdb
        #pdb.set_trace()
        
        myParms     = {}
        popLevel    = None
        
    else:   # generate random data
        nLevels = np.asarray([p])
        efctSizeEachEffect = np.asarray([efctSizeEachEffect])
        
        myParms = anovaPower(sigLevel,stDev,n,nLevels,efctSizeEachEffect)

        pv      = nLevels
        delt    = efctSizeEachEffect
        
        nParms  = np.prod(pv)
        nWay    = len(pv)
        N       = n*nParms
        
        delta   = rs.selectResponseShape(iType,delt,p)    
        pattrn  = {"efct1": delta}
        
        alf = np.zeros(pv[0])
        alf = pattrn["efct1"] - np.mean(pattrn["efct1"])
        alf = delt[0]*(alf/rsd(alf))
        mu0 = mu - alf[0]
        
        x       = np.random.normal(0, stDev, N)
        g       = np.zeros((N, nWay))
        y       = np.zeros(N)
        yA      = np.zeros( np.concatenate(([n], pv)) )

        from app_context import DEBUG_FLAG
        import pdb
        if DEBUG_FLAG:
            dataFolder = "../ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/"
            dataFolder = ""
            data = np.fromfile(dataFolder+"xmat.bin")
            x = data;
        
        ind     = np.arange(n)
        for ii in range( pv[0] ):
            y[ind]      = x[ind] + mu0 + alf[ii]
            yA[:,ii]    = y[ind]
            g[ind]      = ii + 1
            ind         = ind + n
    
        popLevel= mu0 + alf
        
        xbar    = np.mean(yA, axis=0)
        xs      = rsd(yA, axis=0)
        yQuant  = quantileData(yA, axis=0).T
    
    tCrit   = t.ppf(1-sigLevel/2, df=n-1)
    xbL     = xbar - xs*(tCrit/sqrt(n))
    xbU     = xbar + xs*(tCrit/sqrt(n))
    
    pValue  = pValueCalc(pv, n, y)
    
    '''
    ssH1   = (t(H1%*%bet))%*%H1i%*%(H1%*%bet)/N;
    fStatH1  = ((N-nParms)/(pv[1]-1))*(ssH1/ssF);
    pValH1   =  1 - pf(fStatH1,df1 = (pv[1]-1),df2=(N-nParms));
    #'''
    
   #------------------------------------------------------
    myStats = {}

    #myStats["fStat"]    = fStat
    myStats["xbar"]     = xbar
    myStats["delta"]    = popLevel
    myStats["xs"]       = xs
    #myStats["ys"]       = ys
    myStats["pValue"]   = [pValue]
    
    myStats["errBarL"]  = xbL
    myStats["errBarU"]  = xbU

    myStats["y"]        = y
    myStats["g"]        = g
    myStats["p"]        = p
    myStats["n"]        = n
    
    myStats["quantiles"] = yQuant
    #------------------------------------------------------
    '''
    myParms = {"tCrit": tCrit,
               "fCrit": fCrit,
               "powerVal": [powerVal],
               "delta": delta,
               "sEfct": sEfct,
               "sigma": sigma,
               "alpha": alpha,
               "n": n,
               "p": p,
               "mu": mu}
    #'''
    myStats = dict2list( myStats )
    myParms = dict2list( myParms )
    
    myStats["csvdata"] = dataToCSV(g, y)
    
    myOutput = {"myParms":myParms, "myStats":myStats}

    for key1 in myOutput:
        for key in myOutput[key1]:
            if type(myOutput[key1][key]) is np.ndarray:
                myOutput[key1][key] = myOutput[key1][key].tolist()
    
    return(myOutput)
