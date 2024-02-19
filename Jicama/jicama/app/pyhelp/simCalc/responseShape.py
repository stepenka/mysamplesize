import numpy

def rsd(tmp):
    return numpy.std(tmp, ddof=1)

def sqrt(x):
    return x**(1.0/2.0)

def selectResponseShape1Way(iType, deltaValue, p):  # for 1-way anovae

    delta = numpy.asarray(range(p)) + 1

    if (iType == "linearUp") | (iType == 'linear'):
        delta = numpy.asarray(range(p)) + 1
    elif iType == 'saturating':
        delta = 1 - numpy.exp( -delta / (p/2) )
    elif iType == 'invertedU':
        delta = delta * sqrt(p - delta)
    else:
        raise Exception('ERROR: invalid type selected')

    deltaVec = deltaValue * (delta - numpy.mean(delta)) / rsd(delta)

    return deltaVec

def selectResponseShape3(pv):
    
    delta = numpy.zeros(pv)
    
    for ii in range(pv[0]):
        for jj in range(pv[1]):
            for kk in range(pv[2]):
                delta[ii,jj,kk] = ii*jj*kk

    return delta

def selectResponseShape2(iType, deltaValue, d1, d2):
    
    pp = len(d1)
    qp = len(d2)

    delta = numpy.zeros((pp,qp))

    dd1 = d1[pp-1] - d1[0]
    dd2 = d2[qp-1] - d2[0]
    md1 = numpy.sign(dd1)
    md2 = numpy.sign(dd2)
    
    ad1 = abs(dd1)
    ad2 = abs(dd2)
    
    intSign = md2
    if ad1 < ad2:
        iMx = 1
    
    if iType == "coop":
        for ii in range(pp):
            for jj in range(qp):
                delta[ii,jj] = md1 * d1[ii] * d2[jj]
    elif iType == "oppo":
        for ii in range(pp):
            for jj in range(qp):
                delta[ii,jj] = intSign * d1[ii] * d2[jj]
    else:
        raise Exception("Response shape must be 'oppo' or 'coop'")
    
    delta = deltaValue * delta / (rsd(delta) * sqrt((pp*qp-1) / ((pp-1) * (qp-1))) )
    
    return(delta)

def selectResponseShape(iType, deltaValue, p):
    delta = numpy.asarray( range(p) )
    
    if (iType == "linearUp") | (iType == 'linear'):
        delta = deltaValue * delta / rsd(delta)
    elif iType == "linearDown":
        delta = -deltaValue * delta / rsd(delta)
    elif iType == "invertedU":
        delta = delta * (p*1.1 - delta)
        delta = deltaValue * delta / rsd(delta)
    elif iType == "regU":
        delta = delta * (delta - p*1.02) + p
        delta = deltaValue * delta / rsd(delta)
    else:
        raise Exception("Invalid response shape selected")

    return delta

