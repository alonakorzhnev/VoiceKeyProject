import os
import numpy
import _pickle as cPickle
from django.conf import settings
from scipy.io.wavfile import read
from sklearn.mixture import GaussianMixture
from .extractFeatures import extractFeatures


def train(userName):
    source = os.path.join(settings.DATA_ROOT, 'usersData', userName, 'wav')
    destination = os.path.join(settings.DATA_ROOT, 'usersModels', userName)
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
            print('+ modeling completed for speaker:', picklefile)
            features = numpy.asarray(())


def test():
    source = os.path.join(settings.DATA_ROOT, 'whoIsIt', 'audio.wav')
    sampleRate, signal = read(source)
    mfccVector = extractFeatures(signal, sampleRate)

    modelsPath = os.path.join(settings.DATA_ROOT, 'usersModels')
    gmmFiles = [os.path.join(modelsPath, fname) for fname in os.listdir(modelsPath) if fname.endswith('.gmm')]

    models = [cPickle.load(open(fname, 'rb')) for fname in gmmFiles]

    speakers = [os.path.splitext(os.path.basename(fname))[0] for fname in gmmFiles]

    log_likelihood = numpy.zeros(len(models))

    for i in range(len(models)):
        gmm = models[i]  # checking with each model one by one
        scores = numpy.array(gmm.score(mfccVector))
        log_likelihood[i] = scores.sum()

    winner = numpy.argmax(log_likelihood)

    print(log_likelihood[winner])

    if log_likelihood[winner] >= -25:
        print("\tdetected as -", speakers[winner])
    else:
        print("Error in detecting")

    return speakers[winner]