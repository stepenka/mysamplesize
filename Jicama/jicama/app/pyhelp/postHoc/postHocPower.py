import numpy as np
from scipy.stats import t
from statsmodels.stats.libqsturng import qsturng as qtukey
from statsmodels.sandbox.distributions.multivariate import mvstdtprob as pmvt
from scipy.optimize import root
from scipy.stats import nct as nct
    
def qmvt(p, corr, ndf):
    	
    k = corr.shape[1]

    x0 = t.ppf(1-(1-p)/(2*(k+1)*k),ndf)  # upper bound (Dunnett Bonferroni correction)

    def probFit(q,corr,ndf,k,p): # pfct(q):
        lower = np.repeat(-abs(q),k)
        upper = np.repeat(abs(q),k)
        return(pmvt(lower,upper,corr,ndf,ieps=1e-9) - p)

    return(root(probFit,x0,args=(corr,ndf,k,p),method='lm'))

def postHocPower(sigLevel,dfPH,nGp,nonCentPH):
    sig         = sigLevel
    k           = nGp-1 
    p           = 1-sig
    ndf         = dfPH
    
    C               = 0.5*(np.ones((k,k)) + np.diag(np.ones(k)))
    tOut            = qmvt(p, C, ndf)
    tCritDunnett    = tOut.x

    # qtukey (python qsturng) comparing R to 3rd digits. Can't find a better one
    tCritTukey      = qtukey(p, nGp, ndf)/np.sqrt(2)
    tCritBonfDunn   = t.ppf(1-sig/(2*k), ndf)
    tCritBonfTukey  = t.ppf(1-sig/(2*nGp*k), ndf)

    powerValDunnett    = 1 - nct.cdf(tCritDunnett,ndf,nonCentPH) + nct.cdf(-tCritDunnett,ndf,nonCentPH)
    powerValTukey      = 1 - nct.cdf(tCritTukey,ndf,nonCentPH) + nct.cdf(-tCritTukey,ndf,nonCentPH)
    powerValBonfDunn   = 1 - nct.cdf(tCritBonfDunn,ndf,nonCentPH) + nct.cdf(-tCritBonfDunn,ndf,nonCentPH)
    powerValBonfTukey  = 1 - nct.cdf(tCritBonfTukey,ndf,nonCentPH) + nct.cdf(-tCritBonfTukey,ndf,nonCentPH)
    
    outPut = dict()
    outPut["tCritDunnett"]      = tCritDunnett
    outPut["tCritTukey"]        = tCritTukey
    outPut["tCritBonfDunn"]     = tCritBonfDunn
    outPut["tCritBonfTukey"]    = tCritBonfTukey
    outPut["powerValDunnett"]   = powerValDunnett #powerValBonfDunn #
    outPut["powerValTukey"]     = powerValTukey
    outPut["powerValBonfDunn"]  = powerValBonfDunn
    outPut["powerValBonfTukey"] = powerValBonfTukey
    
    return(outPut)

out = postHocPower(0.05, 6, 3, 1)

print("tCritDunnett\n  %g\n" % out["tCritDunnett"])
print("tCritTukey\n  %g\n" % out["tCritTukey"])
print("tCritBonfDunn\n  %g\n" % out["tCritBonfDunn"])
print("tCritBonfTukey\n  %g\n" % out["tCritBonfTukey"])

print("powerValDunnett\n  %g\n" % out["powerValDunnett"])
print("powerValTukey\n %g\n" % out["powerValTukey"])
print("powerValBonfDunn\n  %g\n" % out["powerValBonfDunn"])
print("powerValBonfTukey\n  %g\n" % out["powerValBonfTukey"]) 

