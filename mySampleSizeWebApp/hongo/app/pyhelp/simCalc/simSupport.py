import pdb
import numpy

def parseDataFromCSV(dataIn, nWay, testType=None):
    data    = [tmp.split(',') for tmp in dataIn.splitlines()]
    data    = data[1:]     # remove header lines
    data    = numpy.asarray(data, 'float')
    
    if data.shape[1] is not nWay+1:
        if testType is None:
            raise Exception('Your data is not formatted for a %d-way ANOVA'  %(nWay))
        else:
            raise Exception('Your data is not formatted for a %s' %(testType))
    
    groups  = data[:,0:-1]  # everything but the last column
    ndxs    = numpy.lexsort( numpy.flipud(groups.T) )
    data    = data[ndxs,:]
    
    return data
    
def dataToCSV(groupIds, meas):
    if groupIds.ndim == 1:
        groupIds = numpy.reshape(groupIds, (len(groupIds),1))
    if meas.ndim == 1:
        meas = numpy.reshape(meas, (len(meas),1))
    
    header_str = ''
    for ii in range(groupIds.shape[1]):
        header_str += "factor" + chr(65 + ii) + ","
    header_str += "meas"
    
    catdata = numpy.concatenate((groupIds, meas), axis=1)
    
    #numpy.savetxt("foo.csv", catdata, delimiter=",", header=header_str, fmt="%g")
    
    CSVDATA = '%s\n' % (header_str)
    for row in catdata:
        for el in row:
            CSVDATA += '%g,' %(el)
        
        CSVDATA = CSVDATA[:-1] + '\n'
    
    return CSVDATA
    
def rsd(tmp, axis=None):
    return numpy.std(tmp, axis=axis, ddof=1)

def quantileData(yvec, axis=None):
    return numpy.quantile(yvec, [0,0.25,0.50,0.75,1.0], axis=axis)
    
def sqrt(x):
    return x**(1.0/2.0)

def dict2list( myStats ):
    for key in myStats:
        if type(myStats[key]) is numpy.ndarray:
            myStats[key] = myStats[key].tolist()
    
    return myStats

