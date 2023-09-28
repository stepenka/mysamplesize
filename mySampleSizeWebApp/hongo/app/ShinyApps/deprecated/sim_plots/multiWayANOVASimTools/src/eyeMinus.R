eyeMinus <- function(A,cc){

    v   <- dim(A);
    a   <- v[1];
    b   <- v[2];
    S   <- matrix(0,nrow=cc*a,ncol=b*(cc-1));

    for (ii in 1:(cc-1) ){
        indU <- seq((1+(ii-1)*a),ii*a);
        indB <- seq((1+(ii-1)*b),ii*b);
        indD <- seq((1+(cc-1)*a),cc*a);
        S[ indU, indB ] <-  A;
        S[ indD, indB ] <- -A; 
    }
    return(S)
}