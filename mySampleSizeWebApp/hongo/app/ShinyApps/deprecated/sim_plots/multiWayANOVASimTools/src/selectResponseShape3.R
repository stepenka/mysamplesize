selectResponseShape3 <- function(pv) {
    
	delta <- array(0,dim=pv); 
	
    for(i in 1:pv[1]){
		for(j in 1:pv[2]){
			for(k in 1:pv[3]){
				delta[i,j,k] <- (i-1)*(j-1)*(k-1);
			}
		}
	}
	
    return(delta)
}
               