(function() {

  return {
    resources: {
      // Pattern for "subdomain.zendesk.com" extraction.
      PATTERN: /[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+/
    },

    events: {
      'app.activated':'onAppActivated',
      'click .signin': 'onSignIn',
      'click .error': 'onErrorOk',
      'click .call': 'onCall',
      'click .cancelcall': 'onCancelCall',
      'click .acceptcall': 'onAcceptCall',
      'click .rejectcall': 'onRejectCall',
      'click .disconnect': 'onDisconnectCall',
      'click .searchcustomer': 'onSearchCustomer',
      'click .phonenumber': 'onClickToDial',
      'keyup .destination': 'getKeyUp',
      'click .clearvalue': 'clearValue',
      'notification.callReceived': 'onCallReceived',
      'notification.callAnswered': 'onCallAnswered',
      'notification.callReleased': 'onCallReleased',
      'notification.signedIn': 'onSignedIn',
      'notification.signInError': 'onSignInError',
    },

    requests: {
      sendSignIn: function(data){
        console.log("sendSignIn - url: " + data.url + "/com.broadsoft.xsi-actions/v2.0/user/" + 
                                        data.username + "/profile");
        return{
          url: "http://localhost:3000/log_in/?username=" + data.username + 
                                            "&password=" + data.password + 
                                            "&appid=" + this.variables.thisAppId,
          type: 'GET',
          async: false,
          cache: false,
          proxy_v2: true,
          cors: true,
        };
      },
      makeCall: function(destination){
        console.log("makeCall - destination: " + destination);

        return{
          url: "http://localhost:3000/make_call/?destination=" + destination + 
                                                "&username=" + this.credentials.username,
          type: 'GET',
          async: false,
          cache: false,
          proxy_v2: true,
          cors: true,
        };
      },
      acceptCall: function(){
        console.log("acceptCall");
        return{
          url: "http://localhost:3000/accept_call/?username=" + this.credentials.username,
          type: 'GET',
          async: false,
          cache: false,
          proxy_v2: true,
          cors: true,
        };
      },
      rejectCall: function(){
        console.log("rejectCall");
        return{
          url: "http://localhost:3000/disconnect_call/?username=" + this.credentials.username,
          type: 'GET',
          async: false,
          cache: false,
          proxy_v2: true,
          cors: true,
        };
      },
      disconnectCall: function(){
        console.log("disconnectCall");
        return{
          url: "http://localhost:3000/disconnect_call/?username=" + this.credentials.username,
          type: 'GET',
          async: false,
          cache: false,
          proxy_v2: true,
          cors: true,
        };
      },
      createNewCustomer: function(jsondata){
        console.log("createNewCustomer");
        console.log("jsondata: " + jsondata);
        return{
          url: 'https://pbxltest.zendesk.com/api/v2/users.json/',
          type: 'POST',
          async: false,
          chache: false,
          proxy_v2: true,
          contentType: 'application/json',
          data: jsondata,
          dataType: 'json',
        };
      },
      sendCommand: function(url, type, thedata){
        console.log("Sending command " + url);
        return{
          url: url,
          type: type,
          async: false,
          cache: false,
          proxy_v2: true,
          cors: true,
          data: thedata,
          headers: {'Authentication':'Basic joaopaulo.borras@pbxl.jp:zendesktest'},
         // headers: {'Authentication':'Basic BWS_Test.zentestuser1@pbxl.net:Borras123'},
        };
      },
  },

    //App's variables and functions declarations

    //******************** variables ************************
    credentials: {
      url: '',
      username: '',
      password: '',
      authheader: '',
      agentid: '',
    },
    variables: {
      thisAppId: '',
      callingpartynumber: '',
      proxyhost: '',
    },
    appState: {//possible states: signin, ready, incoming_call, dialing, talking
      state: 'signin',
    },

    //********************** funtions and handlers ***********************
    onAppActivated: function(e){
      console.log("App state is " + this.appState.state);
      switch(this.appState.state){
        case 'signin':
          this.credentials.agentid = this.currentUser().id();
          this.variables.thisAppId = this.id();
          this.variables.proxyhost = this.setting('proxyhost');
          this.credentials.url = this.setting('bwhost');
          this.credentials.username = this.setting('username');
          this.credentials.password = this.setting('password');
          this.signin(e);
          //this.switchTo("signin");
          break;
        case 'ready':
          this.switchTo('outgoingcallwindow');
          break;
        case 'incoming_call':
          //this.switchTo('incomingcallwindow');
          this.switchTo('index');
          break;
        case 'talking':
          this.switchTo('talkingwindow');
          break;
        default:
      }
    },

    signin: function(e){
      console.log("Sign in function called");
      console.log("Proxy host: " + this.variables.proxyhost);
      var url = this.variables.proxyhost + "/log_in/?url=" + this.credentials.url + 
                                                          "&username=" + this.credentials.username + 
                                                          "&password=" + this.credentials.password + 
                                                          "&appid=" + this.variables.thisAppId +
                                                          "&zddomain=" + this.getDomainFromURL(e.currentTarget.baseURI);      
      console.log("url: " + url);
      //var request = this.ajax('sendCommand', url, 'GET');
      this.onSignedIn();
    },

    onSignIn: function(e){//talvez nao precise mais
      e.preventDefault();
      this.credentials.url = this.$('.url').val();
      this.credentials.username = this.$('.username').val();
      this.credentials.password = this.$('.password').val();

      var url = this.variables.proxyhost + "/log_in/?url=" + this.credentials.url + 
                                                      "&username=" + this.credentials.username + 
                                                      "&password=" + this.credentials.password + 
                                                      "&appid=" + this.variables.thisAppId +
                                                      "&zddomain=" + this.getDomainFromURL(e.currentTarget.baseURI);      
      console.log("url: " + url);

      var request = this.ajax('sendCommand', url, 'GET');
      this.appState.state = 'ready';
    }, 

    onSignInError: function(){
      console.log("onSignInError function called");
      this.switchTo('loginerror');
      this.appState.state = 'signin';
    },

    onSignedIn: function(){
      console.log("onSignedIn function called");
      this.switchTo('outgoingcallwindow');
      this.appState.state = 'ready';
    },

    onCall: function(e){
      e.preventDefault();
      console.log("onCall - destination: " + this.$('.destination').val());
      var destination = this.$('.destination').val(); 
      var url = this.variables.proxyhost + "/make_call/?destination=" + destination + "&username=" + this.credentials.username;
      var request = this.ajax('sendCommand', url, 'GET');
      this.appState.state = 'dialing';  
    },

    onClickToDial: function(e){
      e.preventDefault();
      console.log("onClickToDial function called");
      var destination = this.$('.phonenumber').text();
      var url = this.variables.proxyhost + "/make_call/?destination=" + destination + "&username=" + this.credentials.username;
      var request = this.ajax('sendCommand', url, 'GET');
      this.appState.state = 'dialing';
    },

    onCancelCall: function(e){
      e.preventDefault();
      console.log("onCancelCall called");
      var url = this.variables.proxyhost + "/disconnect_call/?username=" + this.credentials.username ;
      var request = this.ajax('sendCommand', url, 'GET');
      this.appState.state = 'ready';
    },

    onAcceptCall: function(e){
      e.preventDefault();
      console.log("onAcceptCall function called");
      var url = this.variables.proxyhost + "/accept_call/?username=" + this.credentials.username;
      var request = this.ajax('sendCommand', url, 'GET');
    },

    onRejectCall: function(e){
      e.preventDefault();
      console.log("onRejectCall function called");
      var url = this.variables.proxyhost + "/disconnect_call/?username=" + this.credentials.username;
      var request = this.ajax('sendCommand', url, 'GET');
    },

    onErrorOk: function(){
      this.switchTo("signin");
    },

    onCallReceived: function(data){
      console.log("onCallReceived function called with data: " + data);
      this.switchTo('incomingcallwindow', {callerid: data});
      this.appState.state = 'incoming_call';
    },

    onCallAnswered: function(data){ //the data is the calling party number
      console.log("onCallAnswered called. Data is " + data);
      if(this.appState.state != 'dialing'){//only try to crate new user is not click2dial
          this.appState.state = 'talking';
          //store it in the variables to use if we need to create a new customer
          this.variables.callingpartynumber = data;
          //search if there is any customer with the received phone number in data
          var url = "https://pbxltest.zendesk.com/api/v2/users/search.json?query=" + '"' + data + '"';
          var request = this.ajax('sendCommand', url, 'GET');
          request.done(this.checkIfCustomer);
          request.fail(function(e){
            console.log("Error on sending users query. Message is " + e.message);
        });
      }else{
        this.appState.state = 'talking';
      }
      
      this.switchTo('talkingwindow');
    },

    checkIfCustomer: function(data){
      console.log("Number of customers: " + data.count);
      if(data.count > 0){ //there is customer registered so, show it
        var url = 'https://pbxltest.zendesk.com/api/v2/channels/voice/agents/' + 
                     this.credentials.agentid + '/users/' + data.users[0].id + '/display.json';
        this.ajax('sendCommand', url, 'POST');
      }else if(data.count === 0){ //there is no customer registered so, create it
        var newcustomertempname = 'Calling customer: ' + this.variables.callingpartynumber;
        var phone = this.variables.callingpartynumber;
        var role = 'End-User';
        var post_data = '{"user":{"name":"' + newcustomertempname + '", "phone":"' + phone + '", "role":"' + role + '", "verified":"true"}}';
        var request = this.ajax('createNewCustomer', post_data);
        request.done(this.onNewCustomerCreated);
        request.fail(this.onRequestFail);
      }
    },

    onNewCustomerCreated: function(data){
      console.log("New customer created: " + data.users[0].id);
      //show the new customer to the agent
      var url = 'https://pbxltest.zendesk.com/api/v2/channels/voice/agents/' + 
                                                    this.credentials.agentid + 
                                                    '/users/' + data.users[0].id + 
                                                    '/display.json';
      this.ajax('sendCommand', url, 'POST');
    },

    onRequestFail: function(data){
      console.log("Request failed!");
    },

    onDisconnectCall: function(e){
      e.preventDefault();
      console.log("onDisconnectCall function called");
      var url = this.variables.proxyhost + "/disconnect_call/?username=" + this.credentials.username;
      var request = this.ajax('sendCommand', url, 'GET');
    },

    onSearchCustomer: function(e){
      e.preventDefault();
      console.log("onSearchCustomer function called");
      var customerquery = this.$('.destination').val(); 
      console.log("customerquery: " + customerquery);
      var url = "https://pbxltest.zendesk.com/api/v2/users/search.json?query=" + '"' + customerquery + '"';
      var request = this.ajax('sendCommand', url, 'GET');
      request.done(this.showSearchResults);
    },

    onCallReleased: function(){
      this.switchTo('outgoingcallwindow');
      this.appState.state = 'ready';
    },

    getAuthorizationHeader: function(){
      var header = "Basic " + Base64.encode(this.credentials.username + ":" + this.credentials.password);
      return header;
    },

    getKeyUp: function(){
      console.log("keying up! " + this.$('.destination').val());
      this.partialSearchCustomer();
    },

    clearValue: function(e){
      e.preventDefault();
      this.$('.destination').val('');
    },

    partialSearchCustomer: function(){
      var customerquery = this.$('.destination').val(); 
      var url = 'https://pbxltest.zendesk.com/api/v2/users/search.json?query=' + '"' + customerquery + '"';
      console.log("url is " + url);
      var request = this.ajax('sendCommand', url, 'GET');
      request.done(this.showSearchResults);
    },

    showSearchResults: function(data){
      if(data.users.length > 0){
        if(data.users[0].phone.indexOf('81') >= 0){ //TODO: country code is hard-coded! Must be from settings
          var newtel = data.users[0].phone.replace('81', '0');
          data.users[0].phone = newtel;
          this.switchTo('outgoingcallwindow', data);
        }
      }
    },

    getDomainFromURL: function(baseURI) {
      // Run regular expression to extract domain url
      var regexResult = this.resources.PATTERN.exec(baseURI);
      return regexResult[0];
    },

    removeCountryCode: function(callerid){
      console.log("removeCountryCode called with callerid " + callerid);
      var nationalnumber;
      if(callerid.indexOf('81') >= 0){//verify only Japanese country
          nationalnumber = callerid.replace('81', '0');
      }
      console.log("return nationalnumber " + nationalnumber);
      return nationalnumber;
    } 
};
}());