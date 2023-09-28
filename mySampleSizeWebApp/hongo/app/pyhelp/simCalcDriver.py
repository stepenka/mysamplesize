#
#   pf with 3 args <==> f.sf(fStat, degFreeN, degFreeD)
#   pf with 4 args <==> 
'''
  R
      quant <- qf(sig, dfM, df2, lower=FALSE) #quantile func
      powerM <- pf(quant, dfM, df2, lambda[1], lower=FALSE) #dist func
      
  Python
      quant = f.isf(sigLevel, dfM, df2)
      powerM = ncf.cdf(quant, dfM, df2, LS[0])
#'''

import numpy
from scipy.stats import ncf, nct, f, t

from pyhelp.simCalc.simSupport import * 
from pyhelp.simCalc import simCalc1Way, simCalc2Way, simCalc3Way

def threeWayANOVA(mu, es, stDev, n, sigLevel, nLevels, iType, csvdata=None):
    dataOut = simCalc3Way.sampledData(mu, es, stDev, n, sigLevel, nLevels, iType, csvdata);
    return dataOut

def twoWayANOVA(mu, es, stDev, n, sigLevel, nLevels, iType, csvdata=None):
    dataOut = simCalc2Way.sampledData(mu, es, stDev, n, sigLevel, nLevels, iType, csvdata);
    return dataOut
    
def oneWayANOVA(muControl, efctSizeEachEffect, stDev, n, sigLevel, nLevels, iType, csvdata=None):
    dataOut = simCalc1Way.sampledData(muControl, efctSizeEachEffect, stDev, n, sigLevel, nLevels, iType, csvdata)
    return dataOut
    
def twoSampleT(mu,delta,sigma,n,alpha, csvdata=None):
    if csvdata is not None:
        data    = parseDataFromCSV(csvdata, 1, "Two-Sample T-Test")
        groups  = data[:,0]
        nGroups = numpy.unique(groups)
        
        numpy.testing.assert_equal(len(nGroups), 2, 'Two-sample T-Test must have only 2 group IDs');
        
        xy  = data[:,1]
        x   = xy[groups==nGroups[0]]
        y   = xy[groups==nGroups[1]]
        n   = numpy.asarray([len(x), len(y)])

#
#  BGF added the code below  2019 Sep 03
#		
        xs      = numpy.zeros(2)
        xBar    = numpy.zeros(2)
        yQuant  = numpy.zeros((2,5))
        ndx     = 0
        s2Pooled = 0
        rootN    = 0
        sNum     = 0
        sDen     = 0
        for ii in range(2):
            yTmp            = xy[ndx : (ndx+n[ii])]
            xBar[ii]        = numpy.mean(yTmp)
            xs[ii]          = rsd(yTmp)
            yQuant[ii,:]    = quantileData(yTmp)
            ndx            += n[ii]
            rootN          += 1/n[ii]
            currFrac        = xs[ii]*xs[ii]/(n[ii])
            sNum           += currFrac
            sDen           += (currFrac*currFrac)/(n[ii]-1)
            
        sPooled     = numpy.sqrt(sNum)
        sEfct       = sPooled
        degFree     = (sNum*sNum/sDen)
        tStat       = numpy.diff(xBar)/sEfct
        pValue      = [(1-t.cdf(abs(tStat[0]), df=degFree))*2];		

#
#  BGF added the code above and commented out the code below   2019 Sep 03
#
        
        # xs      = numpy.zeros(2)
        # xBar    = numpy.zeros(2)
        # yQuant  = numpy.zeros((2,5))
        # ndx     = 0
        
        # for ii in range(2):
            # yTmp            = xy[ndx : (ndx+n[ii])]
            # xBar[ii]        = numpy.mean(yTmp)
            # xs[ii]          = rsd(yTmp)
            # yQuant[ii,:]    = quantileData(yTmp)
            # ndx            += n[ii]
        
        # degFree     = 2*n - 2 
        # rootN       = sqrt(n)
        # sEfct       = sqrt(sum(xs**2))/rootN
        # tStat       = numpy.diff(xBar)/sEfct

        # pValue      = (1-t.cdf(abs(tStat[0]), df=degFree))*2;
        myParms = {}
        
    else:
        x           = numpy.random.normal( mu, sigma, (n) )
        y           = numpy.random.normal( (mu+delta), sigma, (n))
        
        xs          = rsd(x)
        ys          = rsd(y)

        xbar        = numpy.mean(x)
        ybar        = numpy.mean(y)
        xBar        = numpy.asarray([xbar,ybar])

        degFree     = 2*n - 2; 
        rootN       = sqrt(n);
        sEfct       = sqrt(xs**2 + ys**2)/rootN;
        tStat       = (xbar - ybar)/sEfct;

        pValue      = (1-t.cdf(abs(tStat), df=degFree))*2;
        pValue      = [pValue]
        
        tCrit       = t.ppf(1-alpha/2, df=degFree);
        
        nonCentParm = delta*rootN/(sqrt(2)*sigma);
        p1          = nct.cdf(tCrit, df=degFree, nc=nonCentParm);
        p2          = nct.cdf(-tCrit, df=degFree, nc=nonCentParm);

        betaVal     = p1-p2;
        powerVal    = 1-betaVal;
        
        yQuant = numpy.quantile(numpy.vstack((x,y)), [0,0.25,0.50,0.75,1.0], axis=1).T
        
        myParms = {"tCrit": tCrit,
                   "powerVal": [powerVal],
                   "delta": delta,
                   "sigma": sigma,
                   "alpha": alpha,
                   "n": n,
                   "mu": mu}

    tInd    = t.ppf(1-alpha/2, df=n-1);
    rootN   = sqrt(n)
    xbL     = xBar - (xs/rootN)*tInd
    xbU     = xBar + (xs/rootN)*tInd
    
   #------------------------------------------------------
    myStats = {}
    myStats["xbar"]     = xBar
    myStats["pValue"]   = pValue
    
    myStats["delta"]    = [mu, mu+delta]
    
    myStats["errBarL"]  = xbL
    myStats["errBarU"]  = xbU
    myStats["p"]        = 2
    myStats["n"]        = n
    
    # only two groups, concat group 1 and group 2 measurements
    myStats["csvdata"]  = dataToCSV(numpy.repeat([1,2],n), numpy.concatenate((x,y)))
    
    x = x.tolist()
    y = y.tolist()
    
    myStats["quantiles"] = yQuant
    myStats["y"] = x+y
    #------------------------------------------------------
    myOutput = {"myParms":myParms, "myStats":myStats}
    
    for key1 in myOutput:
        for key in myOutput[key1]:
            if type(myOutput[key1][key]) is numpy.ndarray:
                myOutput[key1][key] = myOutput[key1][key].tolist()
    
    return(myOutput)
