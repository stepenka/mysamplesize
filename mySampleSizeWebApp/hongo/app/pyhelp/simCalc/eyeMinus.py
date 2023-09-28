import numpy

def eyeMinus(A, cc):
    
    v   = numpy.shape(A)
    a   = v[0]
    b   = v[1]
    S   = numpy.zeros((cc*a, b*(cc-1)))
    
    #for ii in range(cc-1):
    for ii in numpy.asarray(range(1,cc)):
        indU = numpy.arange((ii-1)*a, ii*a)
        indB = numpy.arange((ii-1)*b, ii*b)
        indD = numpy.arange((cc-1)*a, cc*a)

        S[ indU, indB ] =  A[:,b-1]
        S[ indD, indB ] = -A[:,b-1]
    
    return S
