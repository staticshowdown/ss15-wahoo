(function(){
  var app = angular.module('memoreez', ["ngRoute", "services", "firebase"]);

  app.config(['$routeProvider', function($routeProvider) {
        $routeProvider.
                when('/home', {templateUrl: 'src/templates/home.html',   controller: 'IndexCtrl'}).
                when('/eventList', {templateUrl: 'src/templates/all-events.html',   controller: 'EventsCtrl'}).
                when('/event/:itemId', {templateUrl: 'src/templates/specific-event.html'}).
                when('/eg/:eventId/:guestId', {templateUrl: 'src/templates/all-guests.html'}).
                when('/create', {templateUrl: 'src/templates/create-event.html',   controller: 'IndexCtrl'}).
                when('/memory/:eventId/:guestId', {templateUrl: 'src/templates/my-memories.html',   controller: 'MemoriesCtrl'}).
                when('/about', {templateUrl: 'src/templates/about.html',   controller: 'IndexCtrl'})
                .otherwise({redirectTo: '/home'});
  }]);

  app.controller('MemoriesCtrl', ['$scope', 'eventsFactory', 'guestFactory', 'memoriesFactory',
    function($scope, eventsFactory, guestFactory, memoriesFactory){
      console.log('we are being fired');
      $scope.theMemories = memoriesFactory.getMemories($scope.memory);
      $scope.theMemories.$loaded().then(function(data){
        console.log("ahh, the memories!",$scope.theMemories, data);
      })

      console.log("scope.memory",$scope.memory);

      $scope.resolveMemories = function(eventId){
        console.log("eId", eventId);
        memoriesFactory.getMemories(eventId);
      }
  }])

  app.controller('SpecificEventCtrl', ['$scope', '$location', 'eventsFactory', 'guestFactory','$route','$routeParams',
    function($scope, $location, eventsFactory, guestFactory, $route, $routeParams){
      console.log('SpecificEventController');
      this.params = $routeParams;
      $scope.thisEvent = this.params.itemId;
      console.log("params",this.params.itemId);
      $scope.eventInfo = eventsFactory.getEvent($scope.thisEvent);
      $scope.guestInfo = guestFactory.getGuests($scope.thisEvent);
      $scope.guestInfo.$loaded().then(function(data){
        console.log("GUEST INFO:", $scope.guestInfo, data);
      })

      // this.event
  }]);

  app.controller('EventsCtrl', ['$scope', '$location','eventsFactory', 'guestFactory', 'memoriesFactory',
    function($scope, $location, eventsFactory, guestFactory, memoriesFactory){

    $scope.openSpecific = function(obj){
      console.log(obj);
      console.log(obj.item.$id);
    }

    $scope.goNext = function (hash) {
      console.log('HASH: ', hash);
      $location.path(hash);
    }

    $scope.list = eventsFactory.getEvents();
    // get a specific event
    //console.log(eventFactory.getEvent('-JgPDtrYrbLaMcZ61JkH'));
    //eventFactory.delEvent('-JgPTVAXNBh42iNSVoTF');
    //console.log();
    console.log($scope.list);

    var eID = '-JgU3UFT391NjFMzisGI', gID = '-JgUEMUe_GrzkXr4ShYu';
    var x = guestFactory.getGuests(eID);


    x.$loaded().then(function(){
      console.log('Guest has ' + x.length);
      if (x.length < 5 ) {
        guestFactory.addGuest(eID, 'me', 'me@me.com', '111', '1 main', 'msg', '').then(function(data) {
          console.log('.... data: ', data, data.key());
          gID = data.key();
        });
      }
    });


    $scope.hasMedia= function() {
      return (window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia);
      //return false;
    };

    $scope.uploadPic = function(thePic){
      memoriesFactory.addMemory(eID, gID, thePic,'image','this is my awesome 2', false);
    };

    $scope.uploadFile = function(element) {
      console.log('bbbbb',element.files,arguments );
      var fd = new FormData();
        //Take the first selected file
        fd.append("file", element.files[0]);
        console.log('ccccc',fd );

        $scope.theFile =  element.files[0];
        //scope.progressVisible = false
        console.log('file is here: ', $scope.theFile);

        var reader = new FileReader();

        reader.onload = function(readerEvt) {
            var binaryString = readerEvt.target.result;
            $scope.blobFile = "data:"+ $scope.theFile.type + ";base64,"+ btoa(binaryString);
            document.getElementById('myimg').src = $scope.blobFile;
            //console.log($scope.blobFile);

            memoriesFactory.addMemory(eID, gID, $scope.blobFile,'image','this is my awesome', false);
        };

        reader.readAsBinaryString($scope.theFile);

    };

    //
    var m = memoriesFactory.getMemories(eID);
        m.$loaded().then(function(){
      console.log('Event has  ' + m.length + " memories");
    })
  }]);

  app.controller('IndexCtrl', ['$scope', '$location', 'eventsFactory','$route','$routeParams',
                               function($scope, $location, eventsFactory, $route, $routeParams){
    console.log('ROUTE INFO:', $route, $routeParams);
    this.$route = $route;
    this.$location = $location;
    console.log("route", $route);
    console.log("location", $location.path());
    if($location.path() === "/home"){
      console.log($location.path());
      $scope.showHome = false;
      //document.getElementById("navbar1").style.display="none";
    }else{
      console.log("not home");
      $scope.showHome=true;
      //document.getElementById("navbar1").style.display="block";
    }
    console.log("showHome", $scope.showHome);

    /**
    *@summary will use ng-click to submit form, gets info from ng-models
    *@param eventName
    *@param orgName organizer's name
    *@param orgEmail organizer's email
    */
    $scope.submitEvent = function(){
      if($scope.eventName == undefined || $scope.orgName == undefined ||
        $scope.orgEmail== undefined){
        $scope.showAlert = true;
        console.log("");
      }else{
        console.log($scope.eventName, $scope.orgName, $scope.orgEmail);
        eventsFactory.addEvent($scope.eventName, $scope.orgName, $scope.orgEmail);

      }


    }


  }]);
  app.directive('myMemories', function(){
    return{
      restrict: 'E',
      scope:{
        memory: "=info"
      },
      templateUrl: 'src/templates/my-memories.html'
    }
  });

  app.directive('myAttendee', function(){
    return{
      restrict: 'E',
      scope: true, // uses prototypical inheritence
      templateUrl: 'src/templates/all-guests.html'
    }
  });

    app.directive('allGuest', function(){
    return{
      restrict: 'E',
      scope: true, // uses prototypical inheritence
      templateUrl: 'src/templates/my-attendee.html'
    }
  });

  app.directive('createEvent', function(){
    return{
      restrict: 'E',
      templateUrl: 'src/templates/create-event.html'
    }
  })

  app.directive('allEvents', function(){
    return{
      restrict: 'E',
      scope: true,
      templateUrl: 'src/templates/all-events.html'
    }
  });

    app.directive('myMenu', function(){
    return{
      restrict: 'E',
      scope: true,
      templateUrl: 'src/templates/my-menu.html'
    }
  });
})();
