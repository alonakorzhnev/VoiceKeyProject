//(function(){
    'use strict'

    var constraints = {
            audio : true,
    };
    var recorder = null;
    var audioStream = null;
    var audioData1 = null;
    var audioData2 = null;
    var audioData3 = null;
    var audioContext = null;
    var csrftoken = getCookie('csrftoken');
    var socket = null;
    var interval;

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

    function startRecording(){
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
            if($('#ws-radio').prop('checked') && !socket){
            	initWebSocket();
            } else if(socket){
            	closeWebSocket();
            }
        })
        .catch(function(err){
        	displayError("Error occurred while getting audio stream: " + err);
        })
    }

    function stopRecording(){
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

        var email = document.getElementById('email');
        if(email != null && email.value == ''){
            displayError("There is no user email here!");
            return;
        }

        if(audioData1 == null || audioData2 == null || audioData3 == null) {
            displayError("Some of the audio data is missing!");
            return;
        }

        $('#error-panel').hide();


        $.ajax({
          url: "/handleaudio/",
          type: "POST",
          contentType: 'application/octet-stream',
          data: audioData,
          processData: false,
          headers: {
            'X-CSRFTOKEN': csrftoken
          },
          success: function(response){
            $('#result').text(response);
          },
          error: function(response){
            $('#result').text(response.responseText);
          }
        });

        var userData = JSON.stringify({userName: userName.value});

        $.ajax({
          url: "/handleUserName/",
          type: "POST",
          contentType: 'application/json',
          data: userData,
          processData: false,
          headers: {
            'X-CSRFTOKEN': csrftoken
          },
          success: function(response){
            $('#result').text(response);
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

//})())
