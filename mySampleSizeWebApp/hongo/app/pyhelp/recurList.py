import numpy
import rpy2.robjects as ro

def recurList(data):
    rDictTypes  = [ro.vectors.DataFrame, ro.vectors.ListVector]
    rArrayTypes = [ro.vectors.FloatVector, ro.vectors.IntVector]
    rListTypes  = [ro.vectors.StrVector]
    rMatrixTypes = [ro.vectors.Array, ro.vectors.Matrix]
    
    if type(data) in rDictTypes:
        return dict(zip(data.names, [recurList(elt) for elt in data]))
    elif type(data) in rListTypes:
        return [recurList(elt) for elt in data]
    elif type(data) in rArrayTypes:
        return numpy.array(data).tolist()
    elif type(data) in rMatrixTypes:
        return numpy.asarray(data).tolist()
    else:
        if hasattr(data, "rclass"): # An unsupported r class
            raise KeyError('Could not proceed, type {} is not defined'.format(type(data)))
        else:
            return data # We reached the end of recursion
    