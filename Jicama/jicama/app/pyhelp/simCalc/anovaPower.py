import numpy
from pyhelp.simCalc.fTestPower import fTestPower

def anovaPower(sigLevel,stDev,nSubPerGp,nLevelsEachFactor,efctSizeEachEffect):

    n   = nSubPerGp
    pv  = nLevelsEachFactor
    es  = efctSizeEachEffect

    if len(es) == 1:
        es = es * numpy.ones(7)

    # length(pv)   = 1, 2, or 3
    # length(es)  = 1, 3, or 7
    # es          = 1; 1,2,1-2; 1,2,3,1-2,1-3,2-3,1-2-3

    nWay = len(pv)
    N    = n * numpy.prod(pv)


    # main effect
    ncp1     = n * (pv[0]-1) * (es[0]/stDev)**2
    dfN1     = pv[0] - 1
    dfD1     = (n-1) * pv[0]

    ncp1 = float(ncp1); dfN1 = float(dfN1); dfD1 = float(dfD1);
    
    main     =  fTestPower(sigLevel,dfN1,dfD1,ncp1)

    outPut              = dict()
    outPut["ncp"]       = ncp1;
    outPut["dfN"]       = dfN1;
    outPut["dfD"]       = dfD1;
    outPut["powerVal"]  = [main["powerVal"]];
    outPut["fCrit"]     = main["fCrit"];

    if(nWay == 2):

        if (es[2] <= 0):
            nParm = pv[0] + pv[1];
            dfD   = n*pv[0]*pv[1] - (nParm-1);
        else:
            dfD = (n-1)*pv[0]*pv[1];
        
        # main effect
        ncp1     = n*(pv[0]-1)*pv[1]*(es[0]/stDev)**2;
        dfN1     = (pv[0]-1);
        dfD1     = dfD;
        pow1     =  fTestPower(sigLevel,dfN1,dfD1,ncp1);
        
        # secondary effect
        ncp2     = n*(pv[1]-1)*pv[0]*(es[1]/stDev)**2;
        dfN2     = (pv[1]-1);
        dfD2     = dfD;
        pow2     =  fTestPower(sigLevel,dfN2,dfD2,ncp2);

        if (es[2] > 0):
            # interaction effect
            ncp12     = n*(pv[1]-1)*(pv[0]-1)*(es[2]/stDev)**2;
            dfN12     = (pv[1]-1)*(pv[0]-1);
            dfD12     = dfD;
            pow12     =  fTestPower(sigLevel,dfN12,dfD12,ncp12); 
        else:
           ncp12 = 0;
           dfN12 = 0;
           dfD12 = 0;
           pow12 = dict();
           pow12["powerVal"] = 0;
           pow12["fCrit"] = 0;
            
        # np asarray needed 
        outPut["ncp"]   = numpy.asarray([ncp1,ncp2,ncp12]);
        outPut["dfN"]   = numpy.asarray([dfN1,dfN2,dfN12]);
        outPut["dfD"]   = numpy.asarray([dfD1,dfD2,dfD12]);
        outPut["powerVal"] = numpy.asarray([pow1["powerVal"],pow2["powerVal"],pow12["powerVal"]]);
        outPut["fCrit"] = numpy.asarray([pow1["fCrit"],pow2["fCrit"],pow12["fCrit"]]);

    if (nWay == 3):

        dfD    = n*pv[0]*pv[1]*pv[2];
        nParms = 1+pv[0]-1+pv[1]-1+pv[2]-1;

        if (es[3] <= 0):
            i12   = 0;
            nP12  = 0;
        else:
            i12   =1;
            nP12  = (pv[0]-1)*(pv[1]-1);

        if (es[4] <= 0):
            i13   = 0;
            nP13  = 0;
        else:
            i13   =1;
            nP13  = (pv[0]-1)*(pv[2]-1);

        if (es[5] <= 0):
            i23   = 0;
            nP23  = 0;
        else:
            i23   =1;
            nP23  = (pv[2]-1)*(pv[1]-1);
        
        if (i12*i13*i23 == 1):
            i123 = 1;
            n123 = (pv[2]-1)*(pv[1]-1)*(pv[0]-1);
        else:
            i123 = 0;
            n123 = 0;
            
        nParms = nParms + nP12 + nP13 + nP23 + n123;   
        dfD    = dfD - nParms;
        
        # main effect
        ncp1     = n*(pv[0]-1)*pv[1]*pv[2]*(es[0]/stDev)**2;
        dfN1     = (pv[0]-1);
        dfD1     = dfD;
        pow1     =  fTestPower(sigLevel,dfN1,dfD1,ncp1);
        
        # secondary effect
        ncp2     = n*(pv[1]-1)*pv[0]*pv[2]*(es[1]/stDev)**2;
        dfN2     = (pv[1]-1);
        dfD2     = dfD;
        pow2     =  fTestPower(sigLevel,dfN2,dfD2,ncp2);
        
        # tertiary effect
        ncp3     = n*(pv[2]-1)*pv[0]*pv[1]*(es[2]/stDev)**2;
        dfN3     = (pv[2]-1);
        dfD3     = dfD;
        pow3     =  fTestPower(sigLevel,dfN3,dfD3,ncp3);
        
        # 1-2 effect
        if (i12 == 1):
            ncp12     = n*(pv[1]-1)*(pv[0]-1)*pv[2]*(es[3]/stDev)**2;
            dfN12     = (pv[1]-1)*(pv[0]-1);
            dfD12     = dfD;
            pow12     =  fTestPower(sigLevel,dfN12,dfD12,ncp12);
        else:
            ncp12     = 0;
            dfN12     = 0;
            dfD12     = dfD;
            pow12     =  dict();
            pow12["powerVal"] = 0;
            pow12["fCrit"]    = 0;
            
        # 1-3 effect
        if (i13 == 1):
            ncp13     = n*(pv[2]-1)*(pv[0]-1)*pv[1]*(es[4]/stDev)**2;
            dfN13     = (pv[2]-1)*(pv[0]-1);
            dfD13     = dfD;
            pow13     =  fTestPower(sigLevel,dfN13,dfD13,ncp13);
        else:
            ncp13     = 0;
            dfN13     = 0;
            dfD13     = dfD;
            pow13     = dict();
            pow13["powerVal"] = 0;
            pow13["fCrit"]    = 0;

        # 2-3 effect
        if (i13 == 1):
            ncp23     = n*(pv[2]-1)*(pv[1]-1)*pv[0]*(es[5]/stDev)**2;
            dfN23     = (pv[2]-1)*(pv[1]-1);
            dfD23     = dfD;
            pow23     =  fTestPower(sigLevel,dfN23,dfD23,ncp23);
        else:
            ncp23     = 0;
            dfN23     = 0;
            dfD23     = dfD;
            pow23     = dict();    
            pow23["powerVal"] = 0;
            pow23["fCrit"]    = 0;

        # 1-2-3 effect
        if (i123 == 1):
            ncp123     = n*(pv[2]-1)*(pv[0]-1)*(pv[1]-1)*(es[6]/stDev)**2;
            dfN123     = (pv[2]-1)*(pv[1]-1)*(pv[0]-1);
            dfD123     = dfD;
            pow123     =  fTestPower(sigLevel,dfN123,dfD123,ncp123);
        else:
            ncp123     = n*(pv[2]-1)*(pv[0]-1)*(pv[1]-1)*(es[6]/stDev)**2;
            dfN123     = (pv[2]-1)*(pv[1]-1)*(pv[0]-1);
            dfD123     = dfD;
            pow123     = dict();
            pow123["powerVal"] = 0;
            pow123["fCrit"]    = 0;
        
        outPut["ncp"]   = numpy.asarray([ncp1,ncp2,ncp3,ncp12,ncp13,ncp23,ncp123]);
        outPut["dfN"]   = numpy.asarray([dfN1,dfN2,dfN3,dfN12,dfN13,dfN23,dfN123]);
        outPut["dfD"]   = numpy.asarray([dfD1,dfD2,dfD3,dfD12,dfD13,dfD23,dfD123]);
        
        outPut["powerVal"] = numpy.asarray([pow1["powerVal"],pow2["powerVal"],pow3["powerVal"],pow12["powerVal"],pow13["powerVal"],pow23["powerVal"],pow123["powerVal"]])
        
        outPut["fCrit"]    = numpy.asarray([pow1["fCrit"],   pow2["fCrit"],   pow3["fCrit"],   pow12["fCrit"],   pow13["fCrit"], pow23["fCrit"], pow123["fCrit"]])

    return(outPut)
    