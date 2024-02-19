import rpy2.robjects as ro
rsource = ro.r['source']
import numpy
from app_context import getTestType

def tools_demos_R(data):
    type = data["type"]
    es = data["es"]
    ss = data["ss"]
    #rsource('./ShinyApps/deprecated/tools_demos/standalone.R');
    
    rsource('./ShinyApps/deprecated/rHelper/common.R');
    if type == "effectSize":
        #rsource('./ShinyApps/deprecated/tools_demos/standalone.R');
        effectSizeFunc = ro.r("efctSizer")
        tmp = effectSizeFunc( es )
    elif type == "effectSizeANOVA":
        rsource('./ShinyApps/deprecated/rHelper/effectAnova.R');
        effectFunc = ro.r('efctSizer')
        tmp = effectFunc(ss,es,data["stdev"],data["sig"],data["nGroups"])
    elif type == "ANOVAmeans":
        rsource('./ShinyApps/deprecated/rHelper/effectAnova.R');
        dataFunc = ro.r('setThreeNormals')
        tmp = dataFunc(data["mean1"],data["mean2"],data["stdev"])
    elif type == "sampleSize":
        sampFunc = ro.r("sampSizer")
        tmp = sampFunc(ss)
    elif type == "power":
        powerFunc = ro.r("powerSizer")
        tmp = powerFunc(ss, es, data["stdev"], 10**data["sig"])
    elif type == "stdev":
        stdevFunc = ro.r("stdever")
        tmp = stdevFunc( data["stdev"] )
    else:       # significance level
        sigFunc = ro.r("sigLeveler")
        tmp = sigFunc( 10**data["sig"] )
    
    tmp = dict(zip(tmp.names, map(list,list(tmp))))
    
    # two vars to pass back
    tmp["nGroups"]  = data["nGroups"]
    tmp["id"]       = data["id"]
    
    # the following values get mapped to a list, so map back to number
    tmp["es"]       = tmp["es"][0]
    tmp["sigLevel"] = tmp["sigLevel"][0]
    tmp["ss"]       = tmp["ss"][0]
    tmp["sd0"]      = tmp["sd0"][0]
    
    return tmp

  
#@app.route('/power_plot_calc', methods = ['POST'])
def power_plot_calc_R(data):
    
    eps      = numpy.finfo(float).eps
    effect   = data["effect"]
    power    = data["power"]
    sigLevel = float( data["sig"] )
    testType = data["test"]
    nGroups  = data["nGroups"]
    
    isTest = getTestType(testType)
    
    npts        = 100       # number of points to plot
    effectSize  = numpy.linspace(effect["minValue"], effect["maxValue"], npts);
    powerSize   = numpy.arange(power["minValue"], power["maxValue"]+eps, power["options"]["step"]);
    
    rsource('./ShinyApps/power_plots/standalone.R');
    
    effectSize  = ro.vectors.FloatVector( effectSize )
    powerSize   = ro.vectors.FloatVector( powerSize )
    
    if isTest["oneT"] | isTest["twoT"] | isTest["pairedT"] :
        
        if isTest["oneT"]:
            ttype = "one.sample"
        elif isTest["twoT"]:
            ttype = "two.sample"
        else:
            ttype = "paired"
        
        powerTTest  = ro.r('powerTTest')
        tmp = powerTTest(effectSize, powerSize, sigLevel, ttype)

    elif isTest["oneAOV"]:

        powerANOVA  = ro.r('powerANOVA')
        tmp = powerANOVA(effectSize, powerSize, sigLevel, nGroups[0])
    
    elif isTest["twoAOV"]:        # something wrong with R-code?

        effectSize  = ro.vectors.FloatVector( effectSize )
        powerSize   = ro.vectors.FloatVector( powerSize )

        powerANOVA2 = ro.r('powerANOVA2')
        groupsArr   = ro.vectors.FloatVector( nGroups )
        tmp         = powerANOVA2(effectSize, powerSize, sigLevel, groupsArr, data["aovEffect"])
        
    elif isTest["multAOV"]:         # this still needs work
        effectSize  = ro.vectors.FloatVector( effectSize )
        powerSize   = ro.vectors.FloatVector( powerSize )
        powerAOVM   = ro.r('powerAOVM')
        tmp         = powerAOVM(effectSize, powerSize, sigLevel, data["totGrpProd"], data["numdf"], data["lambda1"])
        
    else:
        raise("Invalid test type")
        
    tmp         = numpy.ceil( tmp )    # make sample size integers
    tmp         = tmp.T
    data        = tmp.tolist();
    data        = {'x':numpy.asarray(effectSize).tolist(), 'y':data}
    
    return data

#@app.route('/rng_table_R', methods=['POST'])
def rng_table_R(data):
    
    rsource('./ShinyApps/deprecated/random/randomAssignment.R')
    randAssign = ro.r('randomAssignment')
    
    nSubPerGp               = data["n"]
    nLevelsEachTrtFactor    = data["treatmentLevels"]
    nLevelsEachNonTrtFactor = data["nonTreatmentLevels"]
    isCrossOver             = False
    
    nLevelsEachTrtFactor    = ro.FloatVector( nLevelsEachTrtFactor )
    nLevelsEachNonTrtFactor = ro.FloatVector( nLevelsEachNonTrtFactor )
    
    output = randAssign(nSubPerGp,nLevelsEachTrtFactor,nLevelsEachNonTrtFactor,isCrossOver)
    from pyhelp.recurList import recurList
    data  = recurList(output)
    
    return data

    
def sim_plot_calc_R(data):
    delta    = data["effectSize"]   # effect size
    sigma    = data["std"]          # std dev
    alpha    = data["sig"]          # significance
    n        = data["n"]            # number of subjects per group
    testType = data["testType"]
    
    mu = 4.0*sigma                  # arbitary value for mean, to make plots look nice (for T-Test!)
    
    if (testType=="two.sample"):
        rsource('./ShinyApps/deprecated/sim_plots/2s T-Test/standalone.R')
        sampledData = ro.r("sampledData")
        output = sampledData(mu,delta,sigma,n,alpha)
        
    elif (testType=="anova"):
        #rsource('./ShinyApps/sim_plots/aov/standalone.R')
        rsource('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/standalone.R')
        simData = ro.r("simData")
        output = simData(data["mu"],delta,sigma,n,alpha, data["p"], data["iType"])
        
    elif (testType=="2anova"):
        nLevels     = data["nLevels"]
        effectSizes = delta*numpy.ones(3)
        respTypes   = data["iType"]

        rsource('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/standalone.R')
        simData = ro.r("simData")
        
        nLevelsR     = ro.FloatVector( nLevels )
        effectSizesR = ro.FloatVector( effectSizes )
        respTypesR   = ro.StrVector( respTypes )
        
        output      = simData(data["mu"], effectSizesR, sigma, n, alpha, nLevelsR, respTypesR)
        
    elif (testType=="multi"):
        nLevels     = data["nLevels3"]
        effectSizes = delta*numpy.ones(7)
        respTypes   = numpy.repeat([data["iType"][0], data["iType"][1]], 3)

        rsource('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/standalone.R')
        simData = ro.r("simData")
        
        nLevelsR     = ro.FloatVector( nLevels )
        effectSizesR = ro.FloatVector( effectSizes )
        respTypesR   = ro.StrVector( respTypes )

        output      = simData(data["mu"], effectSizesR, sigma, n, alpha, nLevelsR, respTypesR)
    
    from pyhelp.recurList import recurList
    data  = recurList(output)
    
    return data
