'use strict'

    var constraints = {
            audio : true,
    };
    var recorder = null;
    var audioStream = null;
    var audioData = null;
    var audioContext = null;
    var csrftoken = getCookie('csrftoken');
    var interval;
    var flagRecording = true;

    $(document).ready(function() {

        $('.bar').css('background', 'transparent');


        var pastTimes = [];
        var interval;
        var tensCount = 0;
        var secondsCount = 0;

        var wasPaused = true;
        var startButton = $('#micButton');

        var display = $('#display');
        var tens = $('#tens');
        var seconds = $('#seconds');

        for (var i=0; pastTimes.length; i++){
          var p = $('<p>'+pastTimes[i]+'</p>');
          display.append(p);
        }

        var startCallback = function(){
          if (wasPaused) {
              clearInterval(interval);
              tensCount = 0;
              secondsCount = 0;
              tens.html("00");
              seconds.html("00");
              interval = setInterval(startTimer, 10);
              wasPaused = false;
          } else {
              clearInterval(interval);
              wasPaused = true;
            }
          };

          startButton.on('click', startCallback);

          function startTimer(){
            tensCount++;
            if (tensCount < 10){
              tens.html('0' + tensCount);
            }
            if (tensCount > 9){
              tens.html(tensCount);
            }
            if (tensCount > 99){
              secondsCount++;
              seconds.html('0' + secondsCount);
              tensCount = 0;
              tens.html('0' + 0);
            }
            if (secondsCount > 9){
              seconds.html(secondsCount);
            }
          }

    });

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function toggler(){
        if(flagRecording){
            startRecording();
            flagRecording = false;
            $('.bar').css('background', 'orange');
            starttime();
        }
        else {
            stopRecording();
            flagRecording = true;
            $('.bar').css('background', 'transparent');
        }
    }

    function startRecording(){
        document.getElementById('micIcon').style.color = '#FF0000';
        document.getElementById('submitAudio').disabled = true;
        $('#result').text("");

    	$("#file").val("");
    	if (navigator.mediaDevices.getUserMedia === undefined) {
    		displayError("This browser doesn't support getUserMedia.");
    	}

        navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream){
        	audioStream = stream;
            if(!audioContext){
                audioContext = new AudioContext();
            }
            var source = audioContext.createMediaStreamSource(stream);
            recorder = audioRecorder.fromSource(source);
            recorder.record();
        })
        .catch(function(err){
        	displayError("Error occurred while getting audio stream: " + err);
        })
    }

    function stopRecording(){
        document.getElementById('micIcon').style.color = '#FFFFFF';
        document.getElementById('submitAudio').disabled = false

    	recorder.stop();
    	clearInterval(interval);
        recorder.exportWAV(function(blob){
            audioStream.getTracks()[0].stop();
            audioStream = null;
            audioData = blob;
            var url = URL.createObjectURL(blob);
            var mt = document.createElement('audio');
            mt.controls = true;
            mt.src = url;
            $('#player')[0].innerHTML = "";
            $('#player').append(mt);
        }, true);
        recorder.clear();
    }

    function submitToServer(){
        var userName = document.getElementById('userName');
        if(userName != null && userName.value == ''){
            displayError("There is no user name here!");
            return;
        }

        if(audioData == null) {
            displayError("There is no audio data here!");
            return;
        }

        $('#error-panel').hide();

        var formData = new FormData();
        var userName = JSON.stringify({userName: userName.value});
        formData.append('userName', userName);
        formData.append('audio', audioData);

        $.ajax({
          url: "/handleSignIn/",
          type: "POST",
          contentType: false,
          data: formData,
          processData: false,
          headers: {
            'X-CSRFTOKEN': csrftoken
          },
          success: function(response){
              $('#result').text(response);
              if(String($("#result").val()) == 'Successful SignIn') {
                  setTimeout(function(){window.location.assign('/secretPage');}, 2000);
              }
          },
          error: function(response){
            $('#result').text(response.responseText);
          }
        });
    }

    var openFile = function(event) {
        var input = event.target;
        var isValid = checkValidity(input.files[0]);
        if(!isValid){
        	displayError("Only wav file type allowed.");
        	return;
        }
        var url = URL.createObjectURL(input.files[0]);
        var mt = document.createElement('audio');
        audioData = input.files[0];
        mt.controls = true;
        mt.src = url;
        $('#player')[0].innerHTML = "";
        $('#player').append(mt);
    };

    function checkValidity(file){
    	var isValid = false;
    	var allowedFileTypes = ['audio/x-wav', 'audio/wav'];
    	isValid = allowedFileTypes.includes(file.type);
    	return isValid;
    }

    function displayError(errorMsg){
    	$('#error-panel').addClass('alert-danger');
        $('#error-message').text(errorMsg);
        $('#error-panel').show();
    }

    $(window).on('load',function(){
    	$("#file").val("");
    	$("#file").change(openFile);
    });


