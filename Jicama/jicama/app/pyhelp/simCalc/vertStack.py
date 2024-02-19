import numpy

def vertStack(A, cc):
    
    v       = numpy.shape(A)
    a       = v[0]
    b       = v[1]
    R       = numpy.zeros( (cc*a, b) )

    for ii in range(cc):
        colVec = numpy.arange(1+(ii-1)*a, ii*a+1)-1
        R[colVec,:] = A
    
    return R

'''
vertStack <- function(A,cc){

    v       <- dim(A);
    a       <- v[1];
    b       <- v[2];
    R       <- matrix(0,nrow=cc*a,ncol=b);

    for (ii in 1:cc){
        R[seq((1+(ii-1)*a),ii*a),] = A;
    }
    return(R)
}
#'''
