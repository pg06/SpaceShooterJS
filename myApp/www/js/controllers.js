angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('MyCtrl', function($scope) {
    // for opening a background db:
    var db = $cordovaSQLite.openDB({ name: "my.db", bgType: 1 });

    $scope.execute = function() {
      var query = "INSERT INTO test_table (data, data_num) VALUES (?,?)";
      $cordovaSQLite.execute(db, query, ["test", 100])
      .then(function(res) {
        console.log("insertId: " + res.insertId);
      }, function (err) {
        console.error(err);
      });
    };
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
