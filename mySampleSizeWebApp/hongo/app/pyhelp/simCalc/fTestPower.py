from scipy.stats import f, ncf

def fTestPower(sigLevel,degFreeN,degFreeD,nonCentParm):
    #
    # Power computation
    #
    fCrit    = f.ppf(1-sigLevel, dfn=degFreeN, dfd=degFreeD)
    powerVal = ncf.sf(fCrit, dfn=degFreeN, dfd=degFreeD, nc=nonCentParm)
    
    myParms             = dict()
    myParms["fCrit"]    = fCrit
    myParms["powerVal"] = powerVal

    return myParms

# R equivalent:
#   fCrit       = qf(1-sigLevel,df1 = degFreeN,df2=degFreeD)
#   p1          = pf(fCrit,df1 = degFreeN,df2=degFreeD,ncp = nonCentParm);
#   betaVal     = p1
#   powerVal    = 1 - betaVal
