This folder contains all R/shiny ANOVA simulation code.  

oneWaySim is the shiny app for a one-way ANOVA experiment
twoWaySim is the shiny app for a two-way ANOVA experiment
threeWaySim is the shiny app for a three-way ANOVA experiment

Each of the above has two files, server.R and ui.R, as required by Shiny

the folder src contains R function files for various tasks.

 anovaPower.R  				computes power for various ANOVA hypothesis tests (calls fTestPower)
 buildXfn.R    				computes the GLM model matrix (calls eyeMinus, vertStack)
 eyeMinus.R    				computes a structured matrix needed for ANOVA modeling        
 fTestPower.R  				computes power of a generic F test
 plotScatter.R				generates graphics for shiny app display
 sampledData.R				generates simulated experimental data from an ANOVA experiment
 selectResponseShape.R		creates 1-d response shapes for ANOVA effects
 selectResponseShape2.R     creates 2-d response shapes for ANOVA interaction effects
 selectResponseShape3.R     creates 3-d response shape for 3-way ANOVA interaction   
 vertStack.R                computes a structured matrix needed for ANOVA modeling