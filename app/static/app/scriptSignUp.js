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
        })
        .catch(function(err){
        	displayError("Error occurred while getting audio stream: " + err);
        })
    }

    function stopRecording(numRecord){
    	recorder.stop();
    	clearInterval(interval);
    	if(numRecord == 1){
    	    recorder.exportWAV(function(blob){
                audioStream.getTracks()[0].stop();
                audioStream = null;
                audioData1 = blob;
                var url = URL.createObjectURL(blob);
                var mt = document.createElement('audio');
                mt.controls = true;
                mt.src = url;
                $('#player1')[0].innerHTML = "";
                $('#player1').append(mt);
            }, true);
            recorder.clear();
        }
    	else if(numRecord == 2){
    	    recorder.exportWAV(function(blob){
                audioStream.getTracks()[0].stop();
                audioStream = null;
                audioData2 = blob;
                var url = URL.createObjectURL(blob);
                var mt = document.createElement('audio');
                mt.controls = true;
                mt.src = url;
                $('#player2')[0].innerHTML = "";
                $('#player2').append(mt);
            }, true);
            recorder.clear();
        }
    	else{
    	    recorder.exportWAV(function(blob){
                audioStream.getTracks()[0].stop();
                audioStream = null;
                audioData3 = blob;
                var url = URL.createObjectURL(blob);
                var mt = document.createElement('audio');
                mt.controls = true;
                mt.src = url;
                $('#player3')[0].innerHTML = "";
                $('#player3').append(mt);
            }, true);
            recorder.clear();
        }
    }

    function submitToServer(){
        var userName = document.getElementById('userName');
        var email = document.getElementById('email');

        if(userName != null && userName.value == ''){
            displayError("There is no user name here!");
            return;
        }

        if(audioData1 == null) {
            displayError("There is no audio data here!");
            return;
        }

        $('#error-panel').hide();

        var formData = new FormData();
        var userData = JSON.stringify({userName: userName.value, email: email.value});
        formData.append('userData', userData);
        formData.append('audio1', audioData1);
        formData.append('audio2', audioData2);
        formData.append('audio3', audioData3);

        $.ajax({
          url: "/handleSignUp/",
          type: "POST",
          contentType: false,
          data: formData,
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

        var isValid1 = checkValidity(input.files[0]);
        var isValid2 = checkValidity(input.files[1]);
        var isValid3 = checkValidity(input.files[2]);

        if(!isValid1 || !isValid2 || !isValid3){
        	displayError("Only wav file type allowed.");
        	return;
        }

        var url1 = URL.createObjectURL(input.files[0]);
        var mt1 = document.createElement('audio');
        var url2 = URL.createObjectURL(input.files[1]);
        var mt2 = document.createElement('audio');
        var url3 = URL.createObjectURL(input.files[2]);
        var mt3 = document.createElement('audio');

        audioData1 = input.files[0];
        audioData2 = input.files[1];
        audioData3 = input.files[2];

        mt1.controls = true;
        mt1.src = url1;
        mt2.controls = true;
        mt2.src = url2;
        mt3.controls = true;
        mt3.src = url3;

        $('#player1')[0].innerHTML = "";
        $('#player1').append(mt1);
        $('#player2')[0].innerHTML = "";
        $('#player2').append(mt2);
        $('#player3')[0].innerHTML = "";
        $('#player3').append(mt3);
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

