from scipy.stats import t, f, nct, ncf, norm
import numpy as np
import pdb
from pyhelp.simCalc.simSupport import rsd

#
# setBounds and setDefaults can be called to grab the necessary data
#    this construct allows for one place to hard code parameters.
#
def setBounds(str=""):

    myBounds = dict()
    
    myBounds["minSampSize"] = 2
    myBounds["maxSampSize"] = 42
    myBounds["minES"]       = 0.1
    myBounds["maxES"]       = 2.0
    myBounds["minSD"]       = 0.1       # this is 0.4 for ANOVA
    myBounds["maxSD"]       = 2.0
    myBounds["minSL"]       = 0.0001
    myBounds["maxSL"]       = 0.1
    
    # for anova
    myBounds["minMu"]       = 0.1
    myBounds["maxMu"]       = 4.0 
    myBounds["maxNG"]       = 8
    myBounds["minNG"]       = 2
    
    if( str == "power"):
        myBounds["minSD"]  = 0.4
    if( str == "stdev" ):
        myBounds["minSD"]  = 0.4
    if( str == "siglevel" ):
        myBounds["minSL"]  = 0.001;
        
    return(myBounds)

def setDefaults(str=""):

    myDefaults              = dict()
    myDefaults["ss"]        = 6
    myDefaults["es"]        = 0.7
    myDefaults["sd"]        = 1
    myDefaults["sigLevel"]  = 0.05;
    
    # for anova
    myDefaults["mu1"]       = 1
    myDefaults["mu2"]       = 2
    myDefaults["nGroups"]   = 3
    
    if( str == "siglevel" ):
        myDefaults["ss"]        = 10
        myDefaults["es"]        = 1.2
        myDefaults["sd"]        = 1
        myDefaults["sigLevel"]  = 0.05;
    
    return(myDefaults)

# functions here
#
#    all the helper functions call the omnibus function setIndepSampTTest, which contains the
#        relevant commands for constructing the helper graph data.
#
def sampSizer(ss):

    bnds  = setBounds();
    dfts  = setDefaults();
    
    output = setIndepSampTTest(bnds["minSampSize"], bnds["maxSampSize"], bnds["minES"], bnds["maxES"], bnds["minSD"], bnds["maxSD"], bnds["minSL"], bnds["maxSL"], ss, dfts["es"], dfts["sd"], dfts["sigLevel"]);
    
    return(output)

def efctSizer(es):

    bnds  = setBounds();
    dfts  = setDefaults();
    
    output = setIndepSampTTest(bnds["minSampSize"],bnds["maxSampSize"], bnds["minES"], bnds["maxES"], bnds["minSD"], bnds["maxSD"], bnds["minSL"], bnds["maxSL"], dfts["ss"], es, dfts["sd"], dfts["sigLevel"]);
    
    return(output)

def sigLeveler(sigLevel):
    testType = "siglevel";
    bnds  = setBounds(testType);
    dfts  = setDefaults(testType);
    
    output = setIndepSampTTest(bnds["minSampSize"], bnds["maxSampSize"], bnds["minES"], bnds["maxES"], bnds["minSD"], bnds["maxSD"], bnds["minSL"], bnds["maxSL"], dfts["ss"], dfts["es"], dfts["sd"], sigLevel);
    
    return(output)

def stdever(sd0):

    testType = "stdev";
    bnds  = setBounds(testType);
    dfts  = setDefaults(testType);
    
    output = setIndepSampTTest(bnds["minSampSize"], bnds["maxSampSize"], bnds["minES"], bnds["maxES"], bnds["minSD"], bnds["maxSD"], bnds["minSL"], bnds["maxSL"], dfts["ss"], dfts["es"], sd0, dfts["sigLevel"]);
    
    return(output)

def powerSizer(ss,es,sd0,sigLevel):

    #ss = 6
    #es = 1.0
    #sd0 = 1.0
    #sigLevel = 10^(-1.3)
    
    bnds  = setBounds();
    dfts  = setDefaults();
    
    # minSS,maxSS,minES,maxES,minSD,maxSD,minSL,maxSL,ss0,es0,sd0,sig0
    output = setIndepSampTTest(bnds["minSampSize"], bnds["maxSampSize"], bnds["minES"], bnds["maxES"], bnds["minSD"], bnds["maxSD"], bnds["minSL"], bnds["maxSL"], ss, es, sd0, sigLevel);
    
    return(output)

# setIndepSampTTest is the "omnibus" function for power, critical values, and graph data.
def setIndepSampTTest(minSS,maxSS,minES,maxES,minSD,maxSD,minSL,maxSL,ss0,es0,sd0,sig0):

    yMaxValue    = 2*t.pdf(0, df=2)
    
    degFree      = 2*ss0 - 2
    rootN        = np.sqrt(ss0)
    effectSize   = es0/sd0
    nonCentParm  = effectSize*rootN/(np.sqrt(2))
    tCrit        = t.ppf(1-sig0/2, df=degFree)  
    tCritMinus   = 0-tCrit
    
    p1          = 1 - nct.sf(tCrit, df=degFree, nc=nonCentParm)
    p2          = 1 - nct.sf(-tCrit, df=degFree, nc=nonCentParm)
    
    betaVal     = p1-p2;
    powerVal    = 1-betaVal;
    
    #### length.out was used so that there weren't 2300+ data points
    # x = seq(0-8/np.sqrt(minSS), effectSize + 8/np.sqrt(minSS), 0.005);
    x = np.linspace(0-8/np.sqrt(minSS), effectSize + 8/np.sqrt(minSS), num=200)
    
    y   = t.pdf(x, df=degFree);

    x2  = x;
    y2  = nct.pdf(x, df=degFree, nc=nonCentParm);
    
    #pdb.set_trace()
    
    output          = dict()
    output["x"]        = x;
    output["y"]        = y;
    output["x2"]       = x2;
    output["y2"]       = y2;
    output["tCrit"]    = [tCrit]
    output["m1"]       = 0;
    output["m2"]       = nonCentParm*np.sqrt(degFree/(1+degFree));
#    output["df1      = df1;
#    output["df2      = df2;
#    output["poly     = poly;
#    output["px"]       = poly[:,0];
#    output["py"]       = poly[:,1];
#    output["pid"]      = poly[:,2];
    output["powerVal"] = [powerVal]
    
    output["ss"]       = ss0;
    output["sd0"]      = sd0;
    output["es"]       = es0;
    output["sigLevel"] = sig0;
    
    return(output)

#===================================================================
def setThreeNormals(m1,m2,sd0):

    minMu = setBounds()["minMu"]
    maxMu = setBounds()["maxMu"]
    
    m0 = 0
    
    x = np.linspace(m0 - 3.5*sd0, maxMu + 3.5*sd0, num=200)
  
    # generate normal dist #1
    y1  = norm.pdf(x, loc=m1, scale=sd0)

    # generate normal dist #2
    y2  = norm.pdf(x, loc=m2, scale=sd0)
    
    # generate normal dist control
    y0  = norm.pdf(x, loc=m0, scale=sd0)
    
    output              = dict()
    output["x1"]        = x
    output["y1"]        = y1
    output["x2"]        = x
    output["y2"]        = y2
    output["x0"]        = x
    output["y0"]        = y0
    output["es"]        = rsd([m0,m1,m2])
    output["d12"]       = abs(m1-m2)
    output["d10"]       = abs(m1-m0)
    output["d20"]       = abs(m2-m0)

    # output some inputs
    output["sd0"]       = sd0
    output["sigLevel"]  = sd0
    output["ss"]        = setDefaults()["ss"]
    
    return(output)

def efctSizerANOVA(ss0,es0,sd0,sig0,ng0):

    bnds  = setBounds();
    bnds["minSD"] = 0.4
    
    dfts  = setDefaults();
    
    output = setFTest(bnds["minSampSize"],bnds["maxSampSize"],bnds["minES"],bnds["maxES"],bnds["minSD"],bnds["maxSD"],bnds["minSL"],bnds["maxSL"],bnds["minNG"],bnds["maxNG"],ss0,es0,sd0,sig0,ng0);
    
    return(output)

def setFTest(minSS,maxSS,minES,maxES,minSD,maxSD,minSL,maxSL,minNG,maxNG,ss0,es0,sd0,sig0,ng0):

    degFreeN    = ng0 - 1;
    degFreeD    = ng0*(ss0 - 1);
    
    sEfct       = (es0)
    nonCentParm = (ng0-1) * ss0 * (sEfct/sd0)**2;
    fCrit       = f.ppf(1-sig0, dfn=degFreeN, dfd=degFreeD)
    powerVal    = ncf.sf(fCrit, dfn=degFreeN, dfd=degFreeD, nc=nonCentParm)

    ncpMax       = maxSS * (maxNG-1) * (maxES/minSD)**2;
    xMax         = ncf.ppf(0.999, dfn=degFreeN, dfd=degFreeD, nc=nonCentParm)
    
    lenOut       = 200
    x            = np.linspace(xMax/lenOut, xMax, num=lenOut);
    x1           = x;
    x2           = x;
    y1           = f.pdf(x, dfn=degFreeN, dfd=degFreeD);
    y2           = ncf.pdf(x, dfn=degFreeN, dfd=degFreeD, nc=nonCentParm);
    
    output              = dict()
    output["x"]         = x
    output["y"]         = y1
    output["x2"]        = x2
    output["y2"]        = y2
    output["fCrit"]     = [fCrit]
    output["m1"]        = x1[np.where(y1 == max(y1))]
    output["m2"]        = x2[np.where(y2 == max(y2))]

    output["powerVal"]  = [powerVal]
    output["ss"]        = ss0
    output["sd0"]       = sd0
    output["es"]        = es0
    output["sigLevel"]  = sig0
    output["ng"]        = ng0

    return(output)
