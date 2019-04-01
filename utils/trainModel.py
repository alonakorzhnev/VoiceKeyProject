import os
import numpy
import _pickle as cPickle
from django.conf import settings
from scipy.io.wavfile import read
from sklearn.mixture import GaussianMixture 
from .extractFeatures import extractFeatures


def train(userName):
    source = os.path.join(settings.MEDIA_ROOT, userName, 'wav')
    destination = os.path.join(settings.UTILS_ROOT, 'voiceModels', userName)
    countRecords = 0
    listOfFiles = os.listdir(source)

    # Extracting features for each speaker (3 files per speaker)
    features = numpy.asarray(())
    for path in listOfFiles:
        sampleRate, signal = read(os.path.join(source, path))
        mfccVector = extractFeatures(signal, sampleRate)

        if features.size == 0:
            features = mfccVector
        else:
            features = numpy.vstack((features, mfccVector))

        countRecords += 1

        if countRecords == 3:
            gmm = GaussianMixture(n_components=16, max_iter=200, covariance_type='diag', n_init=3)
            gmm.fit(features)

            picklefile = destination + ".gmm"
            cPickle.dump(gmm, open(picklefile, 'wb'))
            print('+ modeling completed for speaker:', picklefile, " with data point = ", features.shape)
            features = numpy.asarray(())
