//(function(){
    'use strict'

    var constraints = {
            audio : true,
    };
    var recorder = null;
    var audioStream = null;
    var audioData = null;
    var audioContext = null;
    var csrftoken = getCookie('csrftoken');
    var socket = null;
    var interval;
    var flagRecording = true;

    /*$(".nav a").on("click", function(){
       $(".nav").find(".active").removeClass("active");
       $(this).parent().addClass("active");
    });*/
    $(document).ready(function() {
        $(this).addClass('active');
            //$(this).toggleClass('active',
                //window.location.pathname.indexOf($(this).find('a').attr('href')) > -1);
        $(this).siblings().removeClass('active');
        // -----------------------------------------------------------------------
        //$.each($('#navbar').find('li'), function() {
            //$(this).addClass('active');
            //$(this).toggleClass('active',
                //window.location.pathname.indexOf($(this).find('a').attr('href')) > -1);
            //$(this).siblings().removeClass('active');
        //});
        // -----------------------------------------------------------------------
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
        }
        else {
            stopRecording();
            flagRecording = true;
        }
    }

    function startRecording(){
        document.getElementById('micButton').style.color = '#FF0000';
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
        document.getElementById('micButton').style.color = '#FFFFFF';
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
          },
          error: function(response){
            $('#result').text(response.responseText);
          }
        });
        setTimeout(redirecting,100);
    }

    function redirecting() {
        var result = $("#result").val();
        if(String(result) == "true") {

            setTimeout(function(){window.location = '/secretPage';}, 100);
        }
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
