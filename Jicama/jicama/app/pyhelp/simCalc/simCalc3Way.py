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
    nParms  = np.prod(pv)
    #N       = n*nParms
    
    sampSize= np.atleast_1d(sampSize)
    if len(sampSize) == 1:
        sampSize = sampSize * np.ones(nParms)
    else:
        sampSize = sampSize.flatten()
    
    N = np.sum(sampSize)
    
    pList   = [1, pv[0]-1, pv[1]-1, pv[2]-1, (pv[0]-1)*(pv[1]-1), 
            (pv[0]-1)*(pv[2]-1),
            (pv[2]-1)*(pv[1]-1),
            (pv[0]-1)*(pv[1]-1)*(pv[2]-1)]
    pSum    = np.cumsum(pList)
    pFront  = pSum - pList
    
    H11     = np.zeros((pList[1],pSum[0]))
    H12     = np.diagflat( np.ones((pList[1],1)) )
    H13     = np.zeros((pList[1], nParms-pSum[1]))
    H1      = np.hstack((H11, H12, H13))
    
    H21     = np.zeros((pList[2],pSum[1]))
    H22     = np.diagflat( np.ones((pList[2],1)) )
    H23     = np.zeros((pList[2], nParms-pSum[2]))
    H2      = np.hstack((H21, H22, H23))
    
    H31     = np.zeros((pList[3],pSum[2]))
    H32     = np.diagflat( np.ones((pList[3],1)) )
    H33     = np.zeros((pList[3], nParms-pSum[3]))
    H3      = np.hstack((H31, H32, H33))
    
    H12_1   = np.zeros((pList[4],pSum[3]))
    H12_2   = np.diagflat( np.ones((pList[4],1)) )
    H12_3   = np.zeros((pList[4], nParms-pSum[4]))
    H12     = np.hstack((H12_1, H12_2, H12_3))
    
    H13_1   = np.zeros((pList[5],pSum[4]))
    H13_2   = np.diagflat( np.ones((pList[5],1)) )
    H13_3   = np.zeros((pList[5], nParms-pSum[5]))
    H13     = np.hstack((H13_1, H13_2, H13_3))
    
    H23_1   = np.zeros((pList[6],pSum[5]))
    H23_2   = np.diagflat( np.ones((pList[6],1)) )
    H23_3   = np.zeros((pList[6], nParms-pSum[6]))
    H23     = np.hstack((H23_1, H23_2, H23_3))
    
    H123_1  = np.zeros((pList[7], pSum[6]))
    H123_2  = np.diagflat( np.ones((pList[7],1)) )
    H123    = np.hstack((H123_1, H123_2))

    #
    #   np.linalg.lstsq(A,b) for solving Ax=b
    # returns least-squares solution to a linear matrix equation
    #
    XX      = buildXfn(sampSize, pv)
    XTX     = XX.T @ XX                     # equiv to X^T * X
    XXi     = np.linalg.inv(XTX)

    ss      = np.linalg.lstsq(XX, y, rcond=None)
    bet     = ss[0]                     # coefficients
    yF      = XX @ bet
    resF    = y - yF                    # residuals
    
    #========================================

    H1i     = np.linalg.inv(H1 @ XXi @ H1.T)
    H2i     = np.linalg.inv(H2 @ XXi @ H2.T)
    H3i     = np.linalg.inv(H3 @ XXi @ H3.T)
    H12i    = np.linalg.inv(H12 @ XXi @ H12.T)
    H13i    = np.linalg.inv(H13 @ XXi @ H13.T)
    H23i    = np.linalg.inv(H23 @ XXi @ H23.T)
    H123i   = np.linalg.inv(H123 @ XXi @ H123.T)
    
    ssF     = resF.T @ resF
    
    ssH1    = (H1 @ bet).T @ H1i @ (H1 @ bet);
    ssH2    = (H2 @ bet).T @ H2i @ (H2 @ bet);
    ssH3    = (H3 @ bet).T @ H3i @ (H3 @ bet);
    ssH12   = (H12 @ bet).T @ H12i @ (H12 @ bet);
    ssH13   = (H13 @ bet).T @ H13i @ (H13 @ bet);
    ssH23   = (H23 @ bet).T @ H23i @ (H23 @ bet);
    ssH123  = (H123 @ bet).T @ H123i @ (H123 @ bet);
    #========================================

    fStat1  = ((N-nParms)/(pv[0]-1))*(ssH1/ssF);
    pVal1   =  f.sf(fStat1, dfn=(pv[0]-1), dfd=(N-nParms));

    fStat2  = ((N-nParms)/(pv[1]-1))*(ssH2/ssF);
    pVal2   =  f.sf(fStat2, dfn=(pv[1]-1), dfd=(N-nParms));
    
    fStat3  = ((N-nParms)/((pv[2]-1)))*(ssH3/ssF);
    pVal3   =  f.sf(fStat3, dfn=(pv[2]-1), dfd=(N-nParms));    

    fStat12 = ((N-nParms)/((pv[0]-1)*(pv[1]-1)))*(ssH12/ssF);
    pVal12  =  f.sf(fStat12, dfn=((pv[0]-1)*(pv[1]-1)), dfd=(N-nParms));

    fStat13 = ((N-nParms)/((pv[0]-1)*(pv[2]-1)))*(ssH13/ssF);
    pVal13  =  f.sf(fStat13, dfn=((pv[0]-1)*(pv[2]-1)), dfd=(N-nParms));
    
    fStat23 = ((N-nParms)/((pv[2]-1)*(pv[1]-1)))*(ssH23/ssF);
    pVal23  =  f.sf(fStat23, dfn=(pv[2]-1)*(pv[1]-1), dfd=(N-nParms));    

    fStat123= ((N-nParms)/((pv[0]-1)*(pv[2]-1)*(pv[1]-1)))*(ssH123/ssF);
    pVal123 =  f.sf(fStat123, dfn=((pv[0]-1)*(pv[2]-1)*(pv[1]-1)), dfd=(N-nParms));
    
    pValue = [pVal1, pVal2, pVal3, pVal12, pVal13, pVal23, pVal123]
    return pValue
    
def sampledData(muControl, efctSizeEachEffect, stDev, n, sigLevel, nLevels, iType, dataIn=None):
    if dataIn is not None:
        sortedData  = parseDataFromCSV(dataIn, len(nLevels))
        y           = sortedData[:,-1]
        g           = numpy.asarray(sortedData[:,0:3], 'int')    # to match output of the "g" matrix
        x           = y
        
        g0 = np.unique(g[:,0])
        g1 = np.unique(g[:,1])
        g2 = np.unique(g[:,2])
        nLevels = [len(g0), len(g1), len(g2)]
        pv = nLevels
        nLevels = np.asarray(nLevels)

        
        nParms  = np.prod(pv)
        nSub    = []
        
        uniqueGroups = np.unique(g, axis=0)
        for ii in uniqueGroups:
            tmp = np.prod((g == ii), axis=1, dtype='bool')
            tmp = y[tmp]
            nSub.append( len(tmp) )
        
        # need to reshape the data in the same form as yA...
        # ...as far as minimal testing, the reshape below leads to: ytmp == yA
        #yA = np.reshape(np.reshape(y, (n,-1), order='F'), (n,nLevels[0],nLevels[1],nLevels[2]))
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
        
        xbar    = np.reshape(xbar, pv)
        xs      = np.reshape(xs, pv)
        #yQuant  = np.reshape(yQuant, (pv[2],pv[1],pv[0],-1))
        n       = np.reshape(n, pv)
        
        if np.any(n <= 1):
            raise Exception("At least one group has a sample size of 1. Please resubmit your data to have a sample size of at least 2.")
            
        popLevel= None
        myParms = {}

    else:
        pv      = nLevels
        delt    = efctSizeEachEffect
        nLevels = np.asarray(nLevels)
        nParms  = np.prod(pv)
        nWay    = len(pv)
        N       = n*nParms
        
        myParms = anovaPower(sigLevel,stDev,n,nLevels,efctSizeEachEffect)

        from app_context import DEBUG_FLAG
        if DEBUG_FLAG:
            dataFolder = "../ShinyApps/sim_plots/multiWayANOVASimTools/src/"
            dataFolder = ""
            data = np.fromfile(dataFolder+"xmat.bin")
            x = data;
        
        
        #========================================
        myDeltaM  = rs.selectResponseShape(iType[0],delt[0],pv[0])
        myDeltaS  = rs.selectResponseShape(iType[1],delt[1],pv[1])
        myDeltaT  = rs.selectResponseShape(iType[2],delt[2],pv[2])
        myDeltaMS = rs.selectResponseShape2(iType[3],delt[3],myDeltaM,myDeltaS)
        myDeltaMT = rs.selectResponseShape2(iType[4],delt[4],myDeltaM,myDeltaT)
        myDeltaST = rs.selectResponseShape2(iType[5],delt[5],myDeltaS,myDeltaT)
        
        myDeltaMST = rs.selectResponseShape3(pv)
        
        pattrn = {"efct1":myDeltaM, "efct2":myDeltaS, "efct3":myDeltaT,"efct12":myDeltaMS, "efct13":myDeltaMT, "efct23":myDeltaST, "efct123":myDeltaMST}
        
        alfDot      = np.mean( pattrn["efct1"] )
        btaDot      = np.mean( pattrn["efct2"] )
        gamDot      = np.mean( pattrn["efct3"] )
        dltDotDot   = np.mean( pattrn["efct12"] )
        eplDotDot   = np.mean( pattrn["efct13"] )
        etaDotDot   = np.mean( pattrn["efct23"] )
        xiDotDotDot = np.mean( pattrn["efct123"] )
        
        dltiiDot    = np.mean(pattrn["efct12"], 1)
        epliiDot    = np.mean(pattrn["efct13"], 1)
        xiiiDotDot  = np.mean(pattrn["efct123"], (1,2))
        
        dltDotjj    = np.mean( pattrn["efct12"], 0)
        etaDotjj    = np.mean( pattrn["efct23"], 1)
        xijjDotDot  = np.mean( pattrn["efct123"], (0,2))
        xiiijjDot   = np.mean( pattrn["efct123"], 2)
        
        eplDotkk    = np.mean( pattrn["efct13"], 0)
        etaDotkk    = np.mean( pattrn["efct23"], 0)
        xiDotDotkk  = np.mean( pattrn["efct123"], (0,1))
        xijjkkDot   = np.mean( pattrn["efct123"], 0)
        xiiikkDot   = np.mean( pattrn["efct123"], 1)
        
        alf = np.zeros((pv[0], 1))
        bta = np.zeros((pv[1],1))
        gam = np.zeros((pv[2],1))
        dlt = np.zeros((pv[0],pv[1]))
        epl = np.zeros((pv[0],pv[2]))
        eta = np.zeros((pv[1],pv[2]))
        xi  = np.zeros(pv)
        
        for ii in range(pv[0]):
            #dltiiDot = mean(pattrn["efct12[ii,]);
            #epliiDot = mean(pattrn["efct13[ii,]);
            #xiiiDotDot = mean(pattrn["efct123[ii,,]);
            
            alf[ii]  = pattrn["efct1"][ii] - alfDot + dltiiDot[ii] - dltDotDot + epliiDot[ii] - eplDotDot + xiiiDotDot[ii] - xiDotDotDot;
            
            for jj in range(pv[1]):
                #dltDotjj   = mean(pattrn["efct12[,jj]);
                #etaDotjj   = mean(pattrn["efct23[jj,]);
                #xijjDotDot = mean(pattrn["efct123[,jj,]);
                #xiiijjDot  = mean(pattrn["efct123[ii,jj,]);
                
                bta[jj]    = pattrn["efct2"][jj] - btaDot + dltDotjj[jj] - dltDotDot + etaDotjj[jj] - etaDotDot + xijjDotDot[jj] - xiDotDotDot;
                
                dlt[ii,jj] = pattrn["efct12"][ii,jj] - dltiiDot[ii] - dltDotjj[jj] + dltDotDot + xiiijjDot[ii,jj] - xiiiDotDot[ii] - xijjDotDot[jj] + xiDotDotDot;
                
                for kk in range(pv[2]):
                    #eplDotkk   = mean(pattrn["efct13[,kk]);
                    #etaDotkk   = mean(pattrn["efct23[,kk]);
                    #xiDotDotkk = mean(pattrn["efct123[,,kk]); 
                    #xijjkkDot  = mean(pattrn["efct123[,jj,kk]);
                    #xiiikkDot  = mean(pattrn["efct123[ii,,kk]);

                    gam[kk]    = pattrn["efct3"][kk] - gamDot + eplDotkk[kk] - eplDotDot + etaDotkk[kk] - etaDotDot + xiDotDotkk[kk] - xiDotDotDot;
                    
                    epl[ii,kk] = pattrn["efct13"][ii,kk] - epliiDot[ii] - eplDotkk[kk] + eplDotDot + xiiikkDot[ii,kk] - xiDotDotkk[kk] - xiiiDotDot[ii] + xiDotDotDot;
                    
                    eta[jj,kk] = pattrn["efct23"][jj,kk] - etaDotjj[jj] - etaDotkk[kk] + etaDotDot + xijjkkDot[jj,kk] - xiDotDotkk[kk] - xijjDotDot[jj] + xiDotDotDot;
                    
                    xi[ii,jj,kk] = pattrn["efct123"][ii,jj,kk] - xiiijjDot[ii,jj] - xiiikkDot[ii,kk] - xijjkkDot[jj,kk] + xiiiDotDot[ii] + xijjDotDot[jj] + xiDotDotkk[kk] - xiDotDotDot;
        
        alf = delt[0] * alf / rsd(alf)
        bta = delt[1] * bta / rsd(bta)
        gam = delt[2] * gam / rsd(gam)
        dlt = delt[3]*(dlt/(rsd(dlt)*sqrt((pv[0]*pv[1]-1)/((pv[0]-1)*(pv[1]-1)))));
        epl = delt[4]*(epl/(rsd(epl)*sqrt((pv[0]*pv[2]-1)/((pv[0]-1)*(pv[2]-1)))));
        eta = delt[5]*(eta/(rsd(eta)*sqrt((pv[2]*pv[1]-1)/((pv[2]-1)*(pv[1]-1)))));    
        xi  = delt[6]*(xi/(rsd(xi)*sqrt((pv[0]*pv[1]*pv[2]-1)/((pv[0]-1)*(pv[1]-1)*(pv[2]-1)))));
        
        #========================================
        mu0     = muControl - alf[0] - bta[0] - gam[0]
        trueLvls= np.zeros(pv)
        ind     = np.arange(n)
        
        x       = np.random.normal(0, stDev, N)
        y       = np.zeros(N)
        yA      = np.zeros( np.concatenate(([n], pv)) )
        g       = np.zeros((N, nWay))
        
        for i1 in range( pv[0] ):
            for i2 in range( pv[1] ):
                for i3 in range( pv[2] ):
                    trueLvls[i1,i2,i3] = mu0 + alf[i1] + bta[i2] + gam[i3] + dlt[i1,i2] + epl[i1,i3] + eta[i2,i3] + xi[i1,i2,i3]
                    
                    y[ind] = x[ind] + trueLvls[i1,i2,i3]
                    
                    yA[:, i1,i2,i3] = y[ind]
                    
                    g[ind,0] = i1+1
                    g[ind,1] = i2+1
                    g[ind,2] = i3+1
                    
                    ind = ind + n
                    
        popLevel= mu0 + alf
        xbar    = np.mean(yA, 0)
        xs      = rsd(yA, axis=0)
        yQuant  = quantileData(yA, axis=0).T
        
    tCrit   = t.ppf(1-sigLevel/2, df=n-1)
    xbL     = xbar - xs*(tCrit/sqrt(n))
    xbU     = xbar + xs*(tCrit/sqrt(n))
    pValue  = pValueCalc(nLevels, n, y)
    
    #------------------------------------------------------
    myStats = {}

    myStats["xbar"]     = xbar
    myStats["xs"]       = xs
    myStats["errBarL"]  = xbL
    myStats["errBarU"]  = xbU
    myStats["y"]        = y
    myStats["n"]        = n
    myStats["g"]        = g

    myStats["pValue"]   = pValue

    myStats["delta"]    = popLevel
    
    myStats["nLevels"]  = nLevels
    myStats["csvdata"]  = dataToCSV(g, myStats["y"])
    myStats["quantiles"]= np.reshape(yQuant, (pv[0],pv[1],pv[2],-1))
    
    #------------------------------------------------------
    myOutput = {"myParms":myParms, "myStats":myStats}
    
    for key1 in myOutput:
        for key in myOutput[key1]:
            if type(myOutput[key1][key]) is np.ndarray:
                myOutput[key1][key] = myOutput[key1][key].tolist()

    return(myOutput)
