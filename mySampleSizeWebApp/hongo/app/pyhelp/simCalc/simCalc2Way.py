import numpy as np
from scipy.stats import t, f, nct, ncf

from pyhelp.simCalc import responseShape as rs
from pyhelp.simCalc.simSupport import * 
from pyhelp.simCalc.anovaPower import anovaPower
from pyhelp.simCalc.buildXfn import buildXfn

# length(pv)   = 1, 2, or 3
# length(delt)  = 1, 3, or 7
# delt          = 1 1,2,1-2 1,2,3,1-2,1-3,2-3,1-2-3

def pValueCalc(nLevelsEachFactor, sampSize, allDatVec):
    pv      = nLevelsEachFactor
    y       = allDatVec
    
    nLevels = pv
    nParms  = np.prod(pv)
    #N       = n*nParms
    
    sampSize = np.atleast_1d(sampSize)
    if len(sampSize) == 1:
        sampSize = sampSize * np.ones(nParms)
    else:
        sampSize = sampSize.flatten()
    
    n       = sampSize
    N       = np.sum(sampSize) #sampSize * nParms
    
    XX      = buildXfn(n, nLevels)
    XTX     = XX.T @ XX                     # equiv to X^T * X
    XXi     = np.linalg.inv(XTX)
    
    #========================================
    
    H1z1    = np.zeros((pv[0]-1, 1))
    H1diag  = np.ones((pv[0]-1, 1))
    H1diag  = np.diagflat(H1diag)
    H1z2    = np.zeros( (pv[0]-1, nParms-pv[0]))
    H1      = np.hstack((H1z1, H1diag, H1z2))   # hstack is colstack (cbind in R)
    
    H2z1    = np.zeros((pv[1]-1, pv[0]))
    H2diag  = np.ones((pv[1]-1, 1))
    H2diag  = np.diagflat(H2diag)
    H2z2    = np.zeros( (pv[1]-1, nParms-(pv[0]+pv[1]-1)))
    H2      = np.hstack((H2z1, H2diag, H2z2))
    
    H12z1   = np.zeros(((pv[0]-1)*(pv[1]-1), pv[0]+pv[1]-1))
    H12diag = np.ones((pv[0]-1) * (pv[1]-1))
    H12diag = np.diagflat( H12diag )
    H12     = np.hstack((H12z1, H12diag))
    
    ss      = np.linalg.lstsq(XX, y, rcond=None)
    bet     = ss[0]                     # coefficients
    s2hat   = np.var( XX @ bet - y )     # variance of residuals
    
    '''
    alfE              = np.zeros( pv[0] )
    betTmp            = bet[1:pv[0]]
    alfE[0:(pv[0]-1)] = betTmp
    alfE[pv[0]-1]     = -sum( betTmp )    
    e1sq              = max(0,(sum(alfE**2)/(pv[0]-1) - s2hat/(pv[1]*n)))
    efct1e            = sqrt(e1sq)

    btaE              = np.zeros( pv[1] )
    betTmp            = bet[pv[0] : (pv[0]+pv[1]-1)]
    btaE[0:(pv[1]-1)] = betTmp
    btaE[pv[1]-1]     = -sum( betTmp )  
    e2sq              = max(0,sum(btaE**2)/(pv[1]-1) - s2hat/(pv[0]*n))
    efct2e            = sqrt(e2sq)

    gam1            = bet[(pv[0]+pv[1]-1):(pv[0]*pv[1])]
    gam2            = gam1.reshape((pv[0]-1, -1))
    gamR            = -np.sum(gam2, 1)
    gamC            = -np.sum(gam2, 0)
    gamm            = -sum(gamC)    
    gamE            = np.zeros(pv)

    gamE[0:(pv[0]-1), 0:(pv[1]-1)] = gam2
    gamE[pv[0]-1, 0:(pv[1]-1)]    = gamC.T.flatten()
    gamE[0:(pv[0]-1), pv[1]-1]    = gamR.T.flatten()
    gamE[pv[0]-1, pv[1]-1]        = gamm
    gam3                          = gamE.T.flatten()

    e12sq = sum(gam3**2)/((pv[0]-1)*(pv[1]-1)) - s2hat/(n)
    if e12sq < 0:
        e12sq =0
    
    efct12e = sqrt(e12sq)
    #'''
    
    yF      = XX @ bet
    resF    = y-yF

    H1i     = np.linalg.inv(H1 @ XXi @ H1.T)
    H2i     = np.linalg.inv(H2 @ XXi @ H2.T)
    H12i    = np.linalg.inv(H12 @ XXi @ H12.T)

    ssF     = resF.T @ resF

    ssH1    = (H1 @ bet).T  @ H1i  @ (H1 @ bet)
    ssH2    = (H2 @ bet).T  @ H2i  @ (H2 @ bet)
    ssH12   = (H12 @ bet).T @ H12i @ (H12 @ bet)
    
    DFD     = N - nParms
    fStat1  = (DFD/(pv[0]-1)) * (ssH1/ssF)
    pVal1   =  f.sf(fStat1, dfn=pv[0]-1, dfd=DFD)

    fStat2  = (DFD/(pv[1]-1)) * (ssH2/ssF)
    pVal2   =  f.sf(fStat2, dfn=pv[1]-1, dfd=DFD)

    fStat12 = (DFD/((pv[0]-1)*(pv[1]-1))) * (ssH12/ssF)
    pVal12  =  f.sf(fStat12, dfn=(pv[0]-1)*(pv[1]-1), dfd=DFD)
    
    pValue  = [pVal1, pVal2, pVal12]
    return pValue

def sampledData(muControl, efctSizeEachEffect, stDev, n, sigLevel, nLevels, iType, dataIn=None):
    if dataIn is not None:
        sortedData  = parseDataFromCSV(dataIn, len(nLevels))
        g           = sortedData[:,0:2]        # to match output of the "g" matrix
        y           = sortedData[:,-1]
        x           = y
        
        g0 = np.unique(g[:,0])
        g1 = np.unique(g[:,1])
        nLevels = [len(g0), len(g1)]
        pv = np.asarray(nLevels)
        
        nParms  = np.prod(pv)
        nSub    = []
        
        uniqueGroups = np.unique(g, axis=0)
        for ii in uniqueGroups:
            tmp = np.prod((g == ii), axis=1, dtype='bool')
            tmp = y[tmp]
            nSub.append( len(tmp) )
        
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
        
        xbar = np.reshape(xbar, pv)
        xs = np.reshape(xs, pv)
        n = np.reshape(n, pv)
        
        # need to reshape the data in the same form as yA...
        # ...as far as minimal testing, the reshape below leads to: ytmp == yA
        #yA = np.reshape(np.reshape(y, (n,-1), order='F'), (n,pv[0],pv[1]))
        
        myParms = {}
        popLevel = None
        
    else:
        nLevels = np.asarray(nLevels)
        myParms = anovaPower(sigLevel,stDev,n,nLevels,efctSizeEachEffect)

        pv      = nLevels
        delt    = efctSizeEachEffect
        
        nParms  = np.prod(pv)
        nWay    = len(pv)
        N       = n*nParms

        mydeltM = rs.selectResponseShape(iType[0], delt[0], pv[0])
        mydeltS = rs.selectResponseShape(iType[1], delt[1], pv[1])
        mydeltI = rs.selectResponseShape2(iType[2], delt[2], mydeltM, mydeltS)
        pattrn  = {"efct1":mydeltM, "efct2":mydeltS, "efct12":mydeltI}
        
        gamDotDot = np.mean( pattrn["efct12"] )
        alfDot    = np.mean( pattrn["efct1"] )
        btaDot    = np.mean( pattrn["efct2"] )

        gamiiDot = np.mean(pattrn["efct12"], 1)
        gamDotjj = np.mean(pattrn["efct12"], 0)

        alf = pattrn["efct1"] - alfDot + gamiiDot - gamDotDot
        bta = pattrn["efct2"] - btaDot + gamDotjj - gamDotDot
        gam = pattrn["efct12"]

        for ii in range( pv[0] ):
            for jj in range( pv[1] ):
                gam[ii,jj] += - gamiiDot[ii] - gamDotjj[jj] + gamDotDot
        
        alf = delt[0] * alf / rsd(alf)
        bta = delt[1] * bta / rsd(bta)
        gam = delt[2] * (gam / (rsd(gam) * sqrt((pv[0]*pv[1]-1) / ((pv[0]-1)*(pv[1]-1))) ))

        mu0     = muControl - alf[0] - bta[0] - gam[0,0]
        trueLvls= np.zeros(pv)
        ind     = np.arange(n)
        
        #========================================
        x       = np.random.normal(0, stDev, N)
        y       = np.zeros(N)
        yA      = np.zeros( np.concatenate(([n], pv)) )
        g       = np.zeros((N, nWay))

        from app_context import DEBUG_FLAG
        if DEBUG_FLAG:
            dataFolder = "../ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/"
            dataFolder = ""
            data = np.fromfile(dataFolder+"xmat.bin")
            x = data;

        for i1 in range( pv[0] ):
            for i2 in range( pv[1] ):
                trueLvls[i1,i2] = mu0 + alf[i1] + bta[i2] + gam[i1,i2]
                y[ind]      = x[ind] + trueLvls[i1,i2]
                yA[:,i1,i2] = y[ind]
                
                g[ind,0] = i1+1
                g[ind,1] = i2+1
                
                ind = ind + n
        
        popLevel= mu0 + alf.reshape((-1,1))
        xbar    = np.mean(yA, 0)
        xs      = rsd(yA, axis=0)
        yQuant  = quantileData(yA, axis=0).T
    
    tCrit   = t.ppf(1-sigLevel/2, df=n-1)
    xbL     = xbar - xs*(tCrit/sqrt(n))
    xbU     = xbar + xs*(tCrit/sqrt(n))
    pValue  = pValueCalc(pv, n, y)
    
    #------------------------------------------------------
    myStats = {}

    myStats["xbar"]     = xbar
    myStats["xs"]       = xs
    myStats["errBarL"]  = xbL    
    myStats["errBarU"]  = xbU
    myStats["y"]        = y
    myStats["n"]        = n
    #myStats["yA"]   = yA
    #myStats["xgm"]  = xgm
    myStats["g"]        = g
    
    #myStats["alf"]  = alf.reshape((-1,1))
    #myStats["bta"]  = bta.reshape((-1,1))
    #myStats["gam"]  = gam
    
    #myStats["mu0"]    = mu0
    #myStats["trueLvls"]= trueLvls

    #myStats["fStat1"]  = fStat1
    #myStats["fStat2"]  = fStat2
    #myStats["fStat12"] = fStat12

    myStats["pValue"] = pValue
    
    myStats["quantiles"] = np.reshape(yQuant, (pv[0],pv[1],-1))
    
    #myStats["alfE"] = alfE
    #myStats["btaE"] = btaE
    #myStats["gamE"] = gamE
    #myStats["gamR"] = gamR
    #myStats["gamC"] = gamC

    myStats["delta"] = popLevel
    myStats["nLevels"] = pv
    
    #myStats["effectSize"] = [efct1e, efct2e, efct12e]

    myStats["csvdata"] = dataToCSV(g, myStats["y"])
    
    #------------------------------------------------------
    myOutput = {"myParms":myParms, "myStats":myStats}
    
    for key1 in myOutput:
        for key in myOutput[key1]:
            if type(myOutput[key1][key]) is np.ndarray:
                myOutput[key1][key] = myOutput[key1][key].tolist()
    
    return(myOutput)
