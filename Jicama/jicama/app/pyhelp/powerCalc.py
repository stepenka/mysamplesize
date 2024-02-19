
from statsmodels.tools.rootfinding import brentq_expanding
import statsmodels.stats.power as sm
import numpy, math

import scipy.optimize as sciopt
from scipy.stats import ncf as ncf
from scipy.stats import f as f
from pyhelp import postHocCalc

from app_context import app, getTestType

import pdb      # yw
ipdb = False # True            # yw for debug

'''
def rootFinder(func, k_groups):
    start_bqexp = dict(low=2., start_upp=50.)
    start_value = k_groups * 10
    fit_res = []
    
    try:
        val, res = brentq_expanding(func, full_output=True, **start_bqexp)
        failed = False
        fit_res.append(res)
    except ValueError:
        failed = True
        fit_res.append(None)
    
    success = None
    if (not failed) and res.converged:
        success = 1
    else:
        # try backup
        # TODO: check more cases to make this robust
        if not np.isnan(start_value):
            val, infodict, ier, msg = optimize.fsolve(func, start_value,
                                                      full_output=True) #scalar
            #val = optimize.newton(func, start_value) #scalar
            fval = infodict['fvec']
            fit_res.append(infodict)
        else:
            ier = -1
            fval = 1
            fit_res.append([None])

        if ier == 1 and np.abs(fval) < 1e-4 :
            success = 1
        else:
            #print infodict
            if key in ['alpha', 'power', 'effect_size']:
                val, r = optimize.brentq(func, 1e-8, 1-1e-8,
                                         full_output=True) #scalar
                success = 1 if r.converged else 0
                fit_res.append(r)
            else:
                success = 0
    
    return val
#'''

def oneAOV_solver(effectSize, sigLevel, nGroups, sampSize, powSize):
    '''One-Way ANOVA
    :Input:
        effectSize - app input effect size / std
        sigLevel   - app input significant level
        nGroup     - app input
        sampSize   - app input as number of subjects per group or None
        powSize    - app input as stats power or None
        NOTE: only one of sampSize and poweSize can be None
    :Output:
        out        - statistical power if poweSize = None
                     sample size per group if smapSize = None
                     for ANOVA, Dunnett's and Tukey's
    '''
    retval = 0.0
    
    # prep for post-hoc
    es = effectSize   # input effectSize=app_input_effect_size/std
    ss = sampSize
    
    # convert effectSize to Python effectSize
    effectSize = effectSize * ((nGroups-1)/nGroups)**(1/2.0)
    
    if powSize is None:
        sampSize = sampSize*nGroups
        
    retval = sm.FTestAnovaPower().solve_power(effect_size=effectSize, nobs=sampSize, alpha=sigLevel, power=powSize, k_groups=nGroups)
    
    if sampSize is None:
        retval  = math.ceil(retval / nGroups)    # divide by # of groups to get sampsize per group
        posthoc = postHocCalc.postHocCalc(sigLevel,stDev=1,effectSize=es,nLevel=nGroups,ssVal=None,powerVal=powSize)
        out = posthoc  

    else:   # power calc
        retval  = retval.tolist()
        posthoc = postHocCalc.postHocCalc(sigLevel,stDev=1,effectSize=es,nLevel=nGroups,ssVal=ss,powerVal=None)
        out = posthoc 
        # out.update( {"value":[retval]} )

    return out      # retval

def twoAOV_solver(dfVec, LS, sigLevel, dataK, pow, df2=None):
    '''Two-way ANOVA
    :Input: assume number of Levels is (a,b) for two factors, number of sample size ss
            as app input
        dfVec - vector of three elements, (a-1), (b-1), (a-1)*(b-1)
        LS    - vector of three non-central parameters
                (a-1)*b*ss*(es/std)**2
                a*(b-1)*ss*(es/std)**2
                (a-1)*(b-1)*ss*(es/std)**2
        sigLevel - app input significant level
        dataK    - product of elements in level vector
        poweSize - app input as stats power or None
        df2      - degree of freedom in denominate=(ss-1)*a*b for power calc
    '''
    retval = 0.0
        
    # prep for post-hoc
    nn     = len(dfVec)
    nWay   = int(math.log(nn+1,2))
    nLevel = [n+1 for n in dfVec[0:nWay]]
    stDev  = 1.0
    effectSize = numpy.sqrt(LS[nWay]/dfVec[nWay])

    if pow is None:
        # dfM = dfVec[0]
        # dfS = dfVec[1]
        # dfI = dfVec[2]
        
        # quant = f.isf(sigLevel, dfM, df2)
        # powerM = ncf.cdf(quant, dfM, df2, LS[0])
        
        # quant = f.isf(sigLevel, dfS, df2)
        # powerS = ncf.cdf(quant, dfS, df2, LS[1])
        
        # quant = f.isf(sigLevel, dfI, df2)
        # powerI = ncf.cdf(quant, dfI, df2, LS[2])
        
        # atmp = list(1.0 - numpy.array([powerM, powerS, powerI], float))
        
        ssVal      = df2/numpy.prod(nLevel) + 1
        effectSize = effectSize * numpy.sqrt( 1/ssVal )       
        posthoc = postHocCalc.postHocCalc(sigLevel,stDev,effectSize,nLevel,ssVal=ssVal,powerVal=None)
        out = posthoc 
        # out.update( {"value":atmp} )
        
    else:
        # fun = lambda n,ii: 1.0 - ncf.cdf(f.isf(sigLevel, dfVec[ii], (n-1)*dataK), dfVec[ii], (n-1)*dataK, n*LS[ii]) - pow
                
        # tmp = {'value': [], 'msg': 'All is well', 'error': False}
        # for ii in range(0,dfVec.size):
            # p1 = fun(1+1e-8,ii); p2 = fun(1e5,ii)
            # print("i p1 p2 = ",ii,p1,p2) 
            ## ridder is root finding within range
            # outp, r = sciopt.ridder(lambda n: fun(n, ii), 1+1e-8, 1e5, full_output=True)

            # tmp["value"].append(math.ceil(outp))
            # if(r.converged == False):
                # tmp["error"] = True
                # tmp["msg"]   = r.flag
        
        posthoc = postHocCalc.postHocCalc(sigLevel,stDev,effectSize,nLevel,ssVal=None,powerVal=pow)
        out = posthoc
        # out.update( {"value":tmp["value"], "error":tmp["error"], "msg":tmp["msg"]} )
        # out.update( {"value":tmp["value"],"valueDunnett":posthoc["valueDunnett"],"valueTukey":posthoc["valueTukey"],
                     # "error":tmp["error"],"msg":tmp["msg"]} )  

    return out      # retval

def AOVM_solver(sigLevel, totGrpProd, df1, LS, pow=None, df2=None):
    retval = 0.0
    out    = dict()
    
    # prep for post-hoc
    nn     = len(df1)
    nWay   = int(math.log(nn+1,2))    
    nLevel = [n+1 for n in df1[0:nWay]]
    stDev  = 1.0
    effectSize = numpy.sqrt(LS[nn-1]/df1[nn-1])
    
    if pow is None:
        # quant  = f.isf(sigLevel, df1, df2)
        # powerV = ncf.cdf(quant, df1, df2, LS)
        # atmp   = list(1.0 - powerV)

        # post-hoc
        ss = df2/totGrpProd + 1
        effectSize = effectSize * numpy.sqrt(1/ss)
        posthoc = postHocCalc.postHocCalc(sigLevel,stDev,effectSize,nLevel,ssVal=ss,powerVal=None)
        out = posthoc 
        # out.update( {"value":atmp} )
        # out.update( {"value":atmp,"valueDunnett":posthoc["valueDunnett"],"valueTukey":posthoc["valueTukey"]} )
        
    else:
        # fun = lambda n,ii: 1 - ncf.cdf(f.isf(sigLevel, df1[ii], (n-1)*totGrpProd), df1[ii], (n-1)*totGrpProd, n*LS[ii]) - pow

        # tmp = {'value': [], 'msg': "All is well", 'error': False}
        
        # for ii in range(0,df1.size):
            ## ridder is root finding within range
            # outp, r = sciopt.ridder(lambda n: fun(n, ii), 1+1e-5, 1e5, full_output=True)
            
            # tmp["value"].append(math.ceil(outp))    
            # if(r.converged == False):
                # tmp["error"] = True
                # tmp["msg"]   = r.flag
    
        posthoc = postHocCalc.postHocCalc(sigLevel,stDev,effectSize,nLevel,ssVal=None,powerVal=pow)
        out = posthoc
        # out.update( {"value":tmp["value"],"valueDunnett":posthoc["valueDunnett"],"valueTukey":posthoc["valueTukey"],
                     # "error":tmp["error"],"msg":tmp["msg"]} )  

    return out      #retval
    
def rmPS1_solver(sigLevel, df1, LS, dataK, pow=None, df2=None):
    retval = 0.0
    
    if pow is None:
        quant   = f.isf(sigLevel, df1, df2)
        powerV  = ncf.cdf(quant, df1, df2, LS)
        retval  = list(1.0 - powerV)
        
    else:
        fun = lambda n,ii: 1 - ncf.cdf(f.isf(sigLevel, df1[ii], (n-1)*dataK[ii]), df1[ii], (n-1)*dataK[ii], n*LS[ii]) - pow
        
        tmp = {'value': [0,0,0], 'msg': 'All is well', 'error': False}
        tmp["value"] = numpy.zeros(df1.size, float)
        
        for ii in range(0,df1.size):
            # ridder is root finding within range
            outp, r = sciopt.ridder(lambda n: fun(n, ii), 1+1e-5, 1e5, full_output=True)
            tmp["value"][ii] = r.root
            
            if(r.converged == False):
                tmp["error"] = True
                tmp["msg"]   = r.flag
    
        tmp["value"] = list( tmp["value"] )
        retval = tmp
        
    return retval

def rmCS1_solver(sigLevel, df1, LS, dataK, pow=None, df2=None):
    retval = 0.0
    
    if pow is None:
        quant   = f.isf(sigLevel, df1, df2)
        powerV  = ncf.cdf(quant, df1, df2, LS)
        retval  = 1.0 - powerV
        
    else:
        # RMCS calc is: pf(qf(sig.level, df1, df1*(n*k-1), lower=FALSE), df1, df1*(n*k-1), nlambda, lower=FALSE)
        # RMPS calc is: pf(qf(sig.level, df1, (n-1)*k, lower=FALSE), df1, (n-1)*k, nlambda, lower=FALSE)
        
        tmp = {'value': [0,0,0], 'msg': 'All is well', 'error': False}

        fun = lambda n: 1 - ncf.cdf(f.isf(sigLevel, df1, df1*(n*dataK-1)), df1, df1*(n*dataK-1), n*LS) - pow
   
        # ridder is root finding within range
        outp, r = sciopt.ridder(lambda n: fun(n), 1+1e-5, 1e5, full_output=True)
        tmp["value"][0] = r.root
        
        if(r.converged == False):
            tmp["error"] = True
            tmp["msg"]   = r.flag
    
        retval = tmp
    return retval


#===================================================================
#   Power plot routines
#===================================================================

def powerPlot_AOV1(effectSize, powerSize, sigLevel, nGroups):
    nes = effectSize.size
    nps = powerSize.size
    
    output = numpy.zeros((nes,nps))
    
    for ii in range(nes):
        for jj in range(nps):
            es = effectSize[ii]
            pw = powerSize[jj]
            
            try:
                tmp = oneAOV_solver(es, sigLevel, nGroups, None, pw);
            except:
                tmp = 0.0;
                
            if type(tmp) is not float:
                tmp = 0.0
            
            output[ii,jj] = tmp
    
    return output

def powerPlot_rmCS1(effectSize, powerSize, sigLevel, totGrpProd, numdf, lambda1):
    nes = effectSize.size
    nps = powerSize.size
    
    if lambda1 is None:
        lambda1 = 1.0
        
    if numdf is None:
        numdf = 1.0
        
    if totGrpProd is None:
        totGrpProd = 1.0
    
    lambda1     = float(lambda1)
    numdf       = [float(numdf)]
    totGrpProd  = float(totGrpProd)
    
    output      = numpy.zeros((nes,nps))
    
    for ii in range(nes):
        for jj in range(nps):
            es = effectSize[ii]
            pw = powerSize[jj]
            
            lambda2 = [lambda1*es**2]
            
            try:
                #rmCS1_solver(sigLevel, df1, LS, dataK, pow=None, df2=None):
                tmp = rmCS1_solver(sigLevel, totGrpProd, lambda2, numdf, pw)
                tmp = tmp["value"][0]
            except:
                tmp = 0.0
            
            output[ii,jj] = tmp
    
    return output

def powerPlot_AOVM(effectSize, powerSize, sigLevel, totGrpProd, numdf, lambda1):
    # effectSize, powerSize, sigLevel, data["totGrpProd"], data["numdf"], data["lambda1"])
    nes = effectSize.size
    nps = powerSize.size
    
    if lambda1 is None:
        lambda1 = 1.0
        
    if numdf is None:
        numdf = 1.0
        
    if totGrpProd is None:
        totGrpProd = 1.0
        
    lambda1 = float(lambda1)
    numdf = numpy.asarray((numdf,))
    totGrpProd = numpy.asarray((totGrpProd,))
    
    output = numpy.zeros((nes,nps))
    
    for ii in range(nes):
        for jj in range(nps):
            es = effectSize[ii]
            pw = powerSize[jj]
            
            lambda2 = [lambda1*es**2]
            
            try:
                tmp = AOVM_solver(sigLevel, totGrpProd, numdf, lambda2, pw)
                tmp = tmp["value"][0]
            except Exception as e:
                tmp = 0.0
            
            output[ii,jj] = tmp
    
    return output


def twoAOV_solver_2(dfVec, LS, sigLevel, dataK, pow, df2=None):
    retval = 0.0;
    
    if pow is None:
        dfM = dfVec[0]
        dfS = dfVec[1]
        dfI = dfVec[2]
        
        quant = f.isf(sigLevel, dfM, df2)
        powerM = ncf.cdf(quant, dfM, df2, LS[0])
        
        quant = f.isf(sigLevel, dfS, df2)
        powerS = ncf.cdf(quant, dfS, df2, LS[1])
        
        quant = f.isf(sigLevel, dfI, df2)
        powerI = ncf.cdf(quant, dfI, df2, LS[2])
        
        atmp = numpy.array([powerM, powerS, powerI], float)
        atmp = numpy.round( 1.0-atmp,  4)   # round to 4 decimals
        
        retval = list(atmp)
        
    else:
        fun = lambda n,ii: ncf.sf(f.isf(sigLevel, dfVec[ii], (n-1)*dataK), dfVec[ii], (n-1)*dataK, n*LS[ii]) - pow
        
        tmp = {'value': numpy.zeros(dfVec.size), 'msg': 'All is well', 'error': False}
        
        vfun = lambda n: ncf.sf(f.isf(sigLevel, dfVec, (n-1)*dataK), dfVec, (n-1)*dataK, n*LS) - pow
        
        x0 = 10*numpy.ones(dfVec.size)
        opts = {'xtol':0.1}
        
        import pdb
        #pdb.set_trace()
        
        # this seems to work with these parameters, but how to do error-checking??
        rsol = sciopt.root(vfun, 1/LS+1, jac=False)
        tmp["value"] = rsol.x
        return tmp
        
        for ii in range(0,dfVec.size):
            # ridder is root finding within range
            try:
                #outp, r = sciopt.ridder(lambda n: fun(n, ii), 1+1e-5, 1e5, full_output=True)
                outp, r = sciopt.brentq(lambda n: fun(n, ii), 1+1e-5, 1e5, full_output=True)
                
                tmp["value"][ii] = outp
                tmp["error"]     = (r.converged == False)
                tmp["msg"]       = r.flag
            except Exception as e:
                pdb.set_trace()
                tmp["value"][ii] = 0
        
        #pdb.set_trace()
        retval = tmp
        
    return retval

def powerPlot_AOV2_2(effectSize, powerSize, sigLevel, nGroups, aovEffect):
    # effectSize, powerSize, sigLevel, nGroups, data["aovEffect"]
    nes = effectSize.size
    nps = powerSize.size
    
    if nGroups is None:
        nGroups = [1.0, 1.0, 1.0]
    
    if aovEffect is None:
        aovEffect = "M"
    
    nGroups = numpy.array(nGroups, float)
    output = numpy.zeros((nes,nps))
    
    df1 = 1.0
    lambda1 = 1.0
    
    if aovEffect == "M":
        df1 = nGroups[0]-1
        lambda1 = nGroups[1]
    elif aovEffect == "S":
        df1 = nGroups[1]-1
        lambda1 = nGroups[0]
    else: #aovEffect == "I"
        df1 = (nGroups[0]-1) * (nGroups[1]-1)
        lambda1 = 1
    
    lambda2 = df1*lambda1*(effectSize**2)
    dataK = nGroups[0]*nGroups[0]
    #df1 = numpy.asarray((df1,))
    df1 = df1*numpy.ones(nes)
    
    import pdb
    for jj in range(nps):
        pw = powerSize[jj]
        
        if 1:
            tmp = twoAOV_solver_2(df1, lambda2, sigLevel, dataK, pw)
            tmp = tmp["value"]
        else:
            try:
                tmp = twoAOV_solver_2(df1, lambda2, sigLevel, dataK, pw)
                tmp = tmp["value"]
            except Exception as e:
                tmp = 0.0
                print(e)
                pdb.set_trace()
            
        output[:,jj] = tmp
    
    return output

def powerPlot_AOV2(effectSize, powerSize, sigLevel, nGroups, aovEffect):
    # effectSize, powerSize, sigLevel, nGroups, data["aovEffect"]
    nes = effectSize.size
    nps = powerSize.size
    
    if nGroups is None:
        nGroups = [1.0, 1.0, 1.0]
    
    if aovEffect is None:
        aovEffect = "M"
    
    nGroups = numpy.array(nGroups, float)
    output = numpy.zeros((nes,nps))
    
    df1 = 1.0
    lambda1 = 1.0
    
    if aovEffect == "M":
        df1 = nGroups[0]-1
        lambda1 = nGroups[1]
    elif aovEffect == "S":
        df1 = nGroups[1]-1
        lambda1 = nGroups[0]
    else: #aovEffect == "I"
        df1 = (nGroups[0]-1) * (nGroups[1]-1)
        lambda1 = 1
    
    df1 = numpy.asarray((df1,))
    dataK = nGroups[0]*nGroups[0]
    
    for ii in range(nes):
        for jj in range(nps):
            es = effectSize[ii]
            pw = powerSize[jj]
            
            lambda2 = df1*lambda1*(es**2)
            try:
                tmp = twoAOV_solver(df1, lambda2, sigLevel, dataK, pw)
                tmp = tmp["value"][0]
            except Exception as e:
                tmp = 0.0
            
            output[ii,jj] = tmp
    
    return output

def powerPlot_TTest(testType, effectSize, powerSize, sigLevel, nGroups):
    nes = effectSize.size
    nps = powerSize.size
    
    output = numpy.zeros((nes,nps))
    sampsize = None

    isTest = getTestType(testType)
    
    for ii in range(nes):
        for jj in range(nps):
            es = effectSize[ii]
            pw = powerSize[jj]
            
            tmp = 0.0
            
            if isTest["oneT"] | isTest["pairedT"]:
                tmp = sm.TTestPower().solve_power(effect_size=es, nobs=sampsize, alpha=sigLevel, power=pw)
            
            elif isTest["twoT"]:
                tmp = sm.TTestIndPower().solve_power(effect_size=es, nobs1=sampsize, alpha=sigLevel, power=pw)

            output[ii,jj] = tmp

    return output