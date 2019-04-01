import numpy
from sklearn import preprocessing
from python_speech_features import mfcc
from python_speech_features import delta


def extractFeatures(signal, sampleRate):
    mfccFeatures = mfcc(signal, sampleRate, numcep = 20, appendEnergy = True)
    mfccFeatures = preprocessing.scale(mfccFeatures)
    deltaFeatures = delta(mfccFeatures, 2)
    return numpy.hstack((mfccFeatures, deltaFeatures))
 