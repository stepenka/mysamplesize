
source('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/eyeMinus.R');
source('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/selectResponseShape.R');
source('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/selectResponseShape2.R');
source('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/selectResponseShape3.R');
source('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/anovaPower.R');
source('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/fTestPower.R');
source('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/buildXfn.R');
source('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/vertStack.R');
source('./ShinyApps/deprecated/sim_plots/multiWayANOVASimTools/src/sampledData_kh.R');


simData <- function(mu,delta,sigma,n,alpha,p,iType) {
#
#  Wrapper function for when called by Python
#
# 
    muControl           <- mu;
    sigLevel            <- alpha;
    stDev               <- sigma;
    nSubPerGp           <- n;
    nLevelsEachFactor   <- p;
    efctSizeEachEffect  <- delta;
    
    output <- sampledData_kh(muControl, sigLevel, stDev, nSubPerGp, nLevelsEachFactor, efctSizeEachEffect, iType)
    return( output );
}