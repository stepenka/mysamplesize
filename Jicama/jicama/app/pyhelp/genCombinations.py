import string

def genCombinations(nComb):
    from itertools import combinations
    
    AZstr = string.ascii_uppercase
    
    if nComb > len(AZstr) - 1:
        nComb = len(AZstr) - 1
    
    AZstr = AZstr[0:nComb]
    
    intStr = []
    for ch in AZstr:
        intVal = ord(ch) - ord(AZstr[0]) + 1
        intStr.append( str(intVal) )
    
    AZcomb = []
    for ii in range( len(AZstr) ):
        c = combinations(AZstr,ii+1)
        c = list(c)
        tmpStr = [];
        for jj in c:
            tmpStr.append( ''.join( jj ) )
        
        AZcomb.append( tmpStr )
    
    intComb = []
    indComb = []
    for ii in range( len(intStr) ):
        c = combinations(intStr,ii+1)
        c = list(c)
        tmpStr = [];
        for jj in c:
            tmpStr.append( ''.join( jj ) )
        
        intComb.append( tmpStr )
        
        combVec = combinations(range(nComb), ii+1 )
        indComb.append( list(combVec) )
    
    tmpInt = []
    for ii in intComb:
        for jj in ii:
            tmpInt.append( jj )
            
    return (AZcomb, tmpInt, indComb)

