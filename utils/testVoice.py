import os
import numpy
import _pickle as cPickle
from django.conf import settings
from scipy.io.wavfile import read
from .extractFeatures import extractFeatures


def test():
    source = os.path.join(settings.MEDIA_ROOT, 'whoIsIt', 'audio')
    sampleRate, signal = read(source)
    mfccVector = extractFeatures(signal, sampleRate)

    modelsPath = os.path.join(settings.UTILS_ROOT, 'voiceModels')
    gmmFiles = [os.path.join(modelsPath, fname) for fname in os.listdir(modelsPath) if fname.endswith('.gmm')]

    models = [cPickle.load(open(fname, 'rb')) for fname in gmmFiles]

    speakers = [os.path.splitext(os.path.basename(fname))[0] for fname in gmmFiles]

    log_likelihood = numpy.zeros(len(models))

    for i in range(len(models)):
        gmm = models[i]  # checking with each model one by one
        scores = numpy.array(gmm.score(mfccVector))
        log_likelihood[i] = scores.sum()

    winner = numpy.argmax(log_likelihood)
    return speakers[winner]






