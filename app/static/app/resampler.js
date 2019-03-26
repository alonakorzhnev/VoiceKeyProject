(function (worker_instance) {
  "use strict";

  var INCORRECT_BUFFER_LENGTH = "Buffer was of incorrect sample length.";
  var INCORRECT_SETTINGS = "Invalid settings specified for the resampler.";

  function Resampler(fromSampleRate, toSampleRate, channels, outputBufferSize, noReturn) {

    if (!fromSampleRate || !toSampleRate || !channels) {
      throw(new Error(INCORRECT_SETTINGS));
    }

    this.fromSampleRate = fromSampleRate;
    this.toSampleRate = toSampleRate;
    this.channels = channels || 0;
    this.outputBufferSize = outputBufferSize;
    this.noReturn = !!noReturn;

    this.initialize();
  }

  Resampler.prototype.bypassResampler = function (buffer) {
    if (this.noReturn) {
      this.outputBuffer = buffer;
      return buffer.length;
    }
    return buffer;
  };

  Resampler.prototype.initialize = function () {
    if (this.fromSampleRate == this.toSampleRate) {
      this.resampler = this.bypassResampler;
      this.ratioWeight = 1;
    } else {
      
      if (this.fromSampleRate < this.toSampleRate) {
        this.linearInterpolation();
        this.lastWeight = 1;

      } else {
        this.multiTap();
        this.tailExists = false;
        this.lastWeight = 0;
      }
      this.initializeBuffers();
      this.ratioWeight = this.fromSampleRate / this.toSampleRate;
    }
  };

  Resampler.prototype.bufferSlice = function (sliceAmount) {
    if (this.noReturn) {
      return sliceAmount;
    }
    try {
      return this.outputBuffer.subarray(0, sliceAmount);
    }
    catch (error) {
      try {
        this.outputBuffer.length = sliceAmount;
        return this.outputBuffer;
      }
      catch (error) {
        return this.outputBuffer.slice(0, sliceAmount);
      }
    }
  };

  Resampler.prototype.initializeBuffers = function () {
    try {
      this.outputBuffer = new Float32Array(this.outputBufferSize);
      this.lastOutput = new Float32Array(this.channels);
    }
    catch (error) {
      this.outputBuffer = [];
      this.lastOutput = [];
    }
  };

  Resampler.prototype.linearInterpolation = function () {
    this.resampler = function (buffer) {
      var bufferLength = buffer.length,
        channels = this.channels,
        outLength,
        ratioWeight,
        weight,
        firstWeight,
        secondWeight,
        sourceOffset,
        outputOffset,
        outputBuffer,
        channel;

      if ((bufferLength % channels) !== 0) {
        throw(new Error(INCORRECT_BUFFER_LENGTH));
      }
      if (bufferLength <= 0) {
        return (this.noReturn) ? 0 : [];
      }

      outLength = this.outputBufferSize;
      ratioWeight = this.ratioWeight;
      weight = this.lastWeight;
      firstWeight = 0;
      secondWeight = 0;
      sourceOffset = 0;
      outputOffset = 0;
      outputBuffer = this.outputBuffer;

      for (; weight < 1; weight += ratioWeight) {
        secondWeight = weight % 1;
        firstWeight = 1 - secondWeight;
        this.lastWeight = weight % 1;
        for (channel = 0; channel < this.channels; ++channel) {
          outputBuffer[outputOffset++] = (this.lastOutput[channel] * firstWeight) + (buffer[channel] * secondWeight);
        }
      }
      weight -= 1;
      for (bufferLength -= channels, sourceOffset = Math.floor(weight) * channels; outputOffset < outLength && sourceOffset < bufferLength;) {
        secondWeight = weight % 1;
        firstWeight = 1 - secondWeight;
        for (channel = 0; channel < this.channels; ++channel) {
          outputBuffer[outputOffset++] = (buffer[sourceOffset((channel > 0) ? (" + " + channel) : "")] * firstWeight) + (buffer[sourceOffset(channels + channel)] * secondWeight);
        }
        weight += ratioWeight;
        sourceOffset = Math.floor(weight) * channels;
      }
      for (channel = 0; channel < channels; ++channel) {
        this.lastOutput[channel] = buffer[sourceOffset++];
      }
      return this.bufferSlice(outputOffset);
    };
  };

  Resampler.prototype.multiTap = function () {
    this.resampler = function (buffer) {
      var bufferLength = buffer.length,
        outLength,
        output_variable_list,
        channels = this.channels,
        ratioWeight,
        weight,
        channel,
        actualPosition,
        amountToNext,
        alreadyProcessedTail,
        outputBuffer,
        outputOffset,
        currentPosition;

      if ((bufferLength % channels) !== 0) {
        throw(new Error(INCORRECT_BUFFER_LENGTH));
      }
      if (bufferLength <= 0) {
        return (this.noReturn) ? 0 : [];
      }

      outLength = this.outputBufferSize;
      output_variable_list = [];
      ratioWeight = this.ratioWeight;
      weight = 0;
      actualPosition = 0;  
      amountToNext = 0;
      alreadyProcessedTail = !this.tailExists;
      this.tailExists = false;
      outputBuffer = this.outputBuffer;
      outputOffset = 0;
      currentPosition = 0;
            
      for (channel = 0; channel < channels; ++channel) {
        output_variable_list[channel] = 0;
      }

      do {
        if (alreadyProcessedTail) {
          weight = ratioWeight;
          for (channel = 0; channel < channels; ++channel) {
            output_variable_list[channel] = 0;
          }
        } else {
          weight = this.lastWeight;
          for (channel = 0; channel < channels; ++channel) {
            output_variable_list[channel] = this.lastOutput[channel];
          }
          alreadyProcessedTail = true;
        }
        while (weight > 0 && actualPosition < bufferLength) {
          amountToNext = 1 + actualPosition - currentPosition;
          if (weight >= amountToNext) {
            for (channel = 0; channel < channels; ++channel) {
              output_variable_list[channel] += buffer[actualPosition++] * amountToNext;
            }
            currentPosition = actualPosition;
            weight -= amountToNext;
          } else {
            for (channel = 0; channel < channels; ++channel) {
              output_variable_list[channel] += buffer[actualPosition + ((channel > 0) ? (" + " + channel) : "")] * weight;
            }
            currentPosition += weight;
            weight = 0;
            break;
          }
        }
            
        if (weight === 0) {
          for (channel = 0; channel < channels; ++channel) {
            outputBuffer[outputOffset++] = output_variable_list[channel] / ratioWeight;
          }
        } else {
          this.lastWeight = weight;
          for (channel = 0; channel < channels; ++channel) {
            this.lastOutput[channel] = output_variable_list[channel];
          }
          this.tailExists = true;
          break;
        }
      } while (actualPosition < bufferLength && outputOffset < outLength);
        return this.bufferSlice(outputOffset);
      };
  };

  worker_instance.Resampler = Resampler;

}(self));