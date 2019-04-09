'use strict'

    var constraints = {
            audio : true,
    };
    var csrftoken = getCookie('csrftoken');
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

   function submitToServer() {
       var userName = document.getElementById('userName');
       var email = document.getElementById('email');

       if (userName != null && userName.value == '') {
           displayError("There is no user name here!");
           return;
       }

       var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
       if (email != null && email.value == '') {
           displayError("There is no email here!");
           return;
       }

       if (!re.test(email.value)) {
           displayError("The email is not valid!");
           return;
       }

        var formData = new FormData();
        var userData = JSON.stringify({userName: userName.value, email: email.value});
        formData.append('userData', userData);

        $.ajax({
          url: "/handleForgot/",
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
        if(String(result) == "ok") {
            setTimeout(function(){window.location.href = '/signIn';}, 100);
        }
    }