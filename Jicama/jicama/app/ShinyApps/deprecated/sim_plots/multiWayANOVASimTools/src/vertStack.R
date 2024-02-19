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