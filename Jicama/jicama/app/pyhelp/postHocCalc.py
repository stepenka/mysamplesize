import numpy as np, math
from scipy.stats import t, f, nct, ncf
from statsmodels.stats.libqsturng import qsturng as qtukey
from scipy.optimize import brentq as root, ridder

# for debugging
import pdb

def postHocCalc(sigLevel,stDev,effectSize,nLevel,ssVal=None,powerVal=None):
    '''Post-hoc computation with assumptions of 
        same standard deviation and sample size are same for all.
    :Input: 
        sigLevel    - significance level, scaler
        stDev       - standard deviation, scaler 
        nLevel      - number of levels for each factor, list 
        effectSize  - effect size, list, 2**nLevel - 1 elements
        ssVal       - sample size per group, scaler, default to None
        powerVal    - statistical power, scaler, default to None
        NOTE: one one of ssVal and powerVel can be None. 
    :Output:
        out         - dictionary of several key values
                      Output is statistical power if powerVal is None containing
                        power for ANOVA, Dunnett & Tukey with keys =
                        ("value","valueDunnett","valueTukey"). Values > 0 and < 1
                        with number of decimal points decided by OS.
                      Output is sample size if ssVal is None containing sample size
                        for ANOVA, Dunnett & Tukey with key
                        "value","valueDunnett","valueTukey" - integer, sample size
                        "power","powerDunnett","powerTukey" - power at the sample size, with accuracy to 3rd decimal
                        "warning" - 0, 1, 2 for normal root at zero, func(a,b) > 0, func(a,b) < 0
                        "error" - True or False to indicate how the root is solved
                        "msg"   - message corresponding to "error"
    
    :Functions:
        AnovaPower  - power for F distribution
        DunnettTestPower
        TukeyTestPower 
        TestIndexList
        SamplesizeA
        SamplesizePH
    '''
    
    def fTestPower(sigLevel,degFreeN,degFreeD,nonCentParm):
        '''Power computation for F distribution
        Return float
        R equivalent:
          fCrit       = qf(1-sigLevel,df1 = degFreeN,df2=degFreeD)
          betaVal     = pf(fCrit,df1 = degFreeN,df2=degFreeD,ncp = nonCentParm);
          powerVal    = 1 - betaVal
        ''' 
        fCrit  = f.ppf(1-sigLevel, dfn=degFreeN, dfd=degFreeD)
        powerV = ncf.sf(fCrit, dfn=degFreeN, dfd=degFreeD, nc=nonCentParm)
        return powerV

    def PowerDunnett(sig,nLx,ndf,ncp):
        ## Return power (float) calculation for Dunnett test
        tCritDunnett = tCritBonfDunn = t.ppf(1-sig/(2*(nLx-1)),ndf)
        powerV = 1 - nct.cdf(tCritDunnett,ndf,ncp) + nct.cdf(-tCritDunnett,ndf,ncp)
        return powerV        
    
    def PowerTukey(sig,nLx,ndf,ncp):
        ## Return power (float) calculation for Tukey test
        tCritTukey = qtukey(1-sig, nLx, ndf)/np.sqrt(2)
        powerV = 1 - nct.cdf(tCritTukey,ndf,ncp) + nct.cdf(-tCritTukey,ndf,ncp)
        return powerV

    def indexList(nWay):
        ## test index list
        if(nWay == 1):
            indxList = [0]
        elif(nWay == 2):
            indxList = [0,1,(0,1)]
        elif(nWay == 3):
            indxList = [0,1,2,(0,1),(0,2),(1,2),(0,1,2)]
        elif(nWay == 4):
            indxList = [0,1,2,3,(0,1),(0,2),(0,3),(1,2),(1,3),(2,3),
                        (0,1,2),(0,1,3),(0,2,3),(1,2,3),
                        (0,1,2,3)]
        else: #(nWay == 5):
            indxList = [0,1,2,3,4,(0,1),(0,2),(0,3),(0,4),(1,2),(1,3),(1,4),(2,3),(2,4),(3,4),
                        (0,1,2),(0,1,3),(0,1,4),(0,2,3),(0,2,4),(0,3,4),(1,2,3),(1,2,4),(1,3,4),(2,3,4),
                        (0,1,2,3),(0,1,2,4),(0,1,3,4),(0,2,3,4),(1,2,3,4),(1,2,3,4,5)]
        return indxList

    def SamplesizeAN(sigLevel,dfN,dfDx,ncpx,powerVal,rootsLB=2,rootsUB=1e5):

        def ProbFitF(n):
            ## power calculation for F test        
            ncp = n*ncpx
            dfD = (n-1)*dfDx
            myPower = fTestPower(sigLevel,dfN,dfD,ncp)
            return(myPower - powerVal)
            
        ss = {"power":[], "value":[], "warning":0, "converged":True, "msg":"All is well"}             
        p1 = ProbFitF(rootsLB)
        p2 = ProbFitF(rootsUB)
        
        if (p1>0) and (p2>0):
            ss.update( {"value":2, "power": round(min(p1+powerVal,1),3), "warning":1} )
        elif (p1<0) and (p2<0):
            ss.update( {"value":1e5, "power": round(p2+powerVal,3), "warning":2} )
        
        if ss["warning"] == 0:
            # nn = root(probFitF,rootsLB,rootsUB,args=(sigLevel,dfN,p_dfD,p_ncp,powerVal))
            outp, r = ridder(ProbFitF,rootsLB,rootsUB,full_output=True)
            # outp, r = ridder(ProbFitF,rootsLB,rootsUB,args=(sigLevel,dfN,dfDx,ncpx,powerVal),full_output=True)
            myn = np.floor(outp)
            myE = ProbFitF(myn)

            while myE<0:
                myn += 1
                myE = ProbFitF(myn)

            powerOut = round(myE + powerVal,3);

            ss.update( {"power":powerOut, "value":myn, "converged":r.converged, "msg":r.flag} )
        return ss

    def SamplesizePH(PowerFnc,sigLevel,p_x,dfDx,ncpx,powerVal,rootsLB=2,rootsUB=1e5):
    
        def ProbFit(n):  
            ncp = np.sqrt(n)*ncpx
            ndf = np.floor((n-1)*dfDx)
            postHocPowerVal = PowerFnc(sigLevel,p_x,ndf,ncp)
            return(postHocPowerVal - powerVal)
		
        ss = {"power":[], "value":[], "warning":0, "converged":True, "msg":"All is well"} 
        p1 = ProbFit(rootsLB)
        p2 = ProbFit(rootsUB)
        
        if (p1>0) and (p2>0):
            ss.update( {"value":2, "power": round(min(p1+powerVal,1),3), "warning":1} )
        elif (p1<0) and (p2<0):
            ss.update( {"value":1e5, "power": round(p2+powerVal,3), "warning":2} )
        
        if ss["warning"] == 0:
            # nn = root(probFit,rootsLB,rootsUB,args=(sigLevel,p_x,p_dfD,p_ncp,powerVal,PowerFnc))
            outp, r = ridder(ProbFit,rootsLB,rootsUB,full_output=True)
            myn = np.floor(outp)
            myE = ProbFit(myn)

            while myE<0:
                myn += 1
                myE = ProbFit(myn)

            powerOut = round(myE + powerVal,3);

            ss.update( {"power":powerOut, "value":myn, "converged":r.converged, "msg":r.flag} )
            
        return ss
    
    out = {"value":[], "valueDunnett":[], "valueTukey":[], 
           "error":False, "msg":"All is well", 
           "power":[], "powerDunnett":[], "powerTukey":[],
           "warning":[], "warnDunnett":[], "warnTukey":[] }
    
    nLevel = [nLevel] if type(nLevel)!=list else nLevel
    nWay   = len(nLevel)
    nTest  = 2**nWay - 1
    ss     = 1 if ssVal==None else ssVal

    # use list instead of numpy array for faster computation
    es = [effectSize]*nTest if type(effectSize)!=list else effectSize
    es = nTest*es if len(es)!=nTest else es    

    esStdR   = [n/stDev for n in es]  # build list for effectsize/std
    nLProd   = np.prod(nLevel)
    
    nLProdss = nLProd * ss
    nLProdssSqrt = np.sqrt(0.5*nLProd*ss)
    dfD = ndf = (ss-1)*nLProd if powerVal==None else nLProd
    indxList = indexList(nWay)

    ii  = 0
    while ii < len(indxList):

        if type(indxList[ii])==int:
            nLx  = nLevel[ii]
            nLx1 = nLevel[ii]-1
        else:
            nLx  = [nLevel[jj] for jj in indxList[ii]]
            nLx1 = [nLevel[jj]-1 for jj in indxList[ii]]
    
        nLxProd  = np.prod(nLx)
        nLx1Prod = np.prod(nLx1)
        
        if powerVal == None:
            # ANOVA power
            dfN = float(nLx1Prod)
            ncpAN = float(nLx1Prod/nLxProd * nLProdss * esStdR[ii]**2)            
            pA =  fTestPower(sigLevel,dfN,dfD,ncpAN)
            out["value"].append(pA)
            
            ''' # Alt Power calc -----------------------------
            quant = f.isf(sigLevel,dfN,dfD)
            powerV = float(1.0 - ncf.cdf(quant, dfN, dfD, ncpAN))
            out2["value"].append(powerV)
            # Alt Power calc ----------------------------- '''
            
            # Post-Hoc power
            x     = nLxProd
            ncpPH = np.multiply(nLProdssSqrt*np.sqrt(1/nLxProd),esStdR[ii])          
            pD    = PowerDunnett(sigLevel,x,ndf,ncpPH)    
            pT    = PowerTukey(sigLevel,x,ndf,ncpPH)

            out["valueDunnett"].append(pD)
            out["valueTukey"].append(pT)
                       
        else:
            # ANOVA sample size
            dfNx   = nLx1Prod
            ncpANx = nLx1Prod*nLProd/nLxProd * esStdR[ii]**2
            ssA    = SamplesizeAN(sigLevel,dfNx,dfD,ncpANx,powerVal)
            
            out["value"].append(ssA["value"])
            out["power"].append(ssA["power"])
            out["warning"].append(ssA["warning"])
            if (ssA["converged"] == False):
                out["error"] = True
                out["msg"]   = ssA["msg"]
            ''' # Alt Power calc -----------------------------
            fun = lambda n: 1 - ncf.cdf(f.isf(sigLevel, dfNx, (n-1)*dfD), dfNx, (n-1)*dfD, n*ncpANx) - powerVal
            # ridder is root finding within range
            p1 = fun(1+1e-5); p2 = fun(1e5)
            outp, r = ridder(lambda n: fun(n), 1+1e-5, 1e5, full_output=True)
            out2["value"].append(math.ceil(outp))    
            if(r.converged == False):
                out2["error"] = True
                out2["msg"]   = r.flag
            # Alt power calc ----------------------------- '''

            # Post-Hoc sample size
            nLx    = nLxProd
            ncpPHx = np.multiply(np.sqrt(0.5*nLProd/nLxProd),esStdR[ii])
            ssD = SamplesizePH(PowerDunnett,sigLevel,nLx,ndf,ncpPHx,powerVal)    
            ssT = SamplesizePH(PowerTukey,sigLevel,nLx,ndf,ncpPHx,powerVal)

            if(ssD["converged"] == False):
                out["error"] = True
                out["msg"]   = ssD["msg"]
            if(ssT["converged"] == False):
                out["error"] = True
                out["msg"]   = ssT["msg"]

            out["valueDunnett"].append(ssD["value"])            
            out["valueTukey"].append(ssT["value"])
            out["powerDunnett"].append(ssD["power"])
            out["powerTukey"].append(ssT["power"])
            out["warnDunnett"].append(ssD["warning"])
            out["warnTukey"].append(ssT["warning"])

        ii += 1
        
    return out
        
