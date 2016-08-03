Date.prototype.toStringDB = function() {
  var mes = this.getMonth() + 1;
  var dia = this.getDate();
  var hora = this.toTimeString().split(' ')[0];
  return [this.getFullYear() + '-', !mes[1] && '0', mes + '-', !dia[1] && '0', dia, ' ',hora].join('');
};

// Ionic Starter App
var db = null;
var soundOpt = "on";
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    if (!window.cordova) return; // Se for navegador ignorar sqlite transactions
    var DatetimeNow = new Date().toStringDB();

    // abrir banco de dados
    db = $cordovaSQLite.openDB({name:"app.db", location: 2, createFromLocation: 1});

    // criar tabela 'user' se nao existir 
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY, username TEXT NOT NULL, email TEXT, name TEXT, password TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, active INTEGER NOT NULL, unique(username))")
    .then(function (result) {}, function (error){});

    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS config (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, sound TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, active INTEGER NOT NULL)")
    .then(function (result) {}, function (error){});
    
    // criar tabela 'score' se nao existir
    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS score (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, score INTEGER NOT NULL, maxscore INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, active INTEGER NOT NULL)")
    .then(function (result) {}, function (error){});

    // Checar se tem user criado
    $cordovaSQLite.execute(db, "SELECT id FROM user WHERE active = 1 LIMIT 1")
    .then(function (result) {
        if (result.rows.length === 0) {
            $cordovaSQLite.execute(db, "INSERT INTO user (name, username, active, created_at, updated_at) VALUES ('', 'user1', 1, ?, ?)", [DatetimeNow, DatetimeNow])
            .then(function (result) {}, function (error){});
        }
    }, function (error){});

    // Checar se tem config criada
    $cordovaSQLite.execute(db, "SELECT id, sound FROM config WHERE active = 1 ORDER BY updated_at DESC LIMIT 1")
    .then(function (result) {
        if (result.rows.length === 0) {
            $cordovaSQLite.execute(db, "INSERT INTO config (user_id, sound, active, created_at, updated_at) VALUES (1, 'on', 1, ?, ?)", [DatetimeNow, DatetimeNow])
            .then(function (result) {}, function (error){});
        } else {
            var soundBtn = document.querySelector('a.sound');
            soundOpt = result.rows.item(0).sound;
            soundBtn.dataset.state = soundOpt;
            soundBtn.children[0].setAttribute('src', "img/sound"+ (soundOpt === "on" ? "off" : "on") +"_icon.png");
            inGame.sound(soundOpt);
        }
    }, function (error){});

    // Checar se tem score criado
    $cordovaSQLite.execute(db, "SELECT id, user_id, maxscore FROM score WHERE active = 1 ORDER BY maxscore DESC LIMIT 1")
    .then(function (result) {
        if (result.rows.length > 0) {
            // alert(JSON.stringify(result.rows.item(0)))
            document.querySelector('div#phaser').dataset.maxscore = result.rows.item(0).maxscore.toString();
        } else {
            $cordovaSQLite.execute(db, "INSERT INTO score (user_id, active, score, maxscore, created_at, updated_at) VALUES (1, 1, 0, 0, ?, ?)", [DatetimeNow, DatetimeNow])
            .then(function (result) {}, function (error){});
        }
    }, function (error){});
  })

})

.controller('myScore',function($scope, $ionicPlatform, $cordovaSQLite, $window) {
    var DatetimeNow = new Date().toStringDB();

    // inserir usuario
    $scope.insertUser = function() {
        if (!window.cordova) return; // Se for navegador ignorar sqlite transactions
        var query = "INSERT INTO user (name, username, active, created_at, updated_at) VALUES ('', 'user1', 1, ?, ?)";
        $cordovaSQLite.execute(db, query, [DatetimeNow, DatetimeNow])
        .then(function (result) {}, function (error) {});
    }

    // inserir usuario
    $scope.updateConfig = function() {
        if (!window.cordova) return; // Se for navegador ignorar sqlite transactions
        var query = "UPDATE config SET sound=?,updated_at=? WHERE user_id = 1 AND active = 1";
        var soundBtn = document.querySelector('a.sound');
        $cordovaSQLite.execute(db, query, [soundBtn.dataset.state, DatetimeNow])
        .then(function (result) {}, function (error) {});
    }

    // inserir score maximo
    $scope.insertScore = function() {
        if (!window.cordova) return; // Se for navegador ignorar sqlite transactions
        if (document.querySelector('div#phaser').dataset.maxscore !== "0") {
            var maxscore = parseInt(document.querySelector('div#phaser').dataset.maxscore);
            var score = parseInt(document.querySelector('div#phaser').dataset.score);
            var query = "INSERT INTO score (user_id, active, maxscore, score, created_at, updated_at) VALUES (1, 1, ?, ?, ?, ?)";
            $cordovaSQLite.execute(db, query, [maxscore, score, DatetimeNow, DatetimeNow])
            .then(function(result) {}, function(error) {});
        }
    }
    $window.angularControllerInsertScore = $scope.insertScore;
    $window.angularControllerUpdateConfig = $scope.updateConfig;

    // selecionar usuario
    $scope.selectUser = function() {
        if (!window.cordova) return; // Se for navegador ignorar sqlite transactions
        var username = username || '';
        var query = "SELECT id, username, name FROM user WHERE id = 1 AND active = 1 LIMIT 1";
        $cordovaSQLite.execute(db, query, [username])
        .then(function (result) {}, function (error) {});
    }

    // selecionar score maximo
    $scope.selectMaxScore = function() {
        if (!window.cordova) return; // Se for navegador ignorar sqlite transactions
        var query = "SELECT id, user_id, score, maxscore FROM score WHERE active = 1 ORDER BY maxscore DESC LIMIT 1";
        $cordovaSQLite.execute(db, query)
        .then(function (result) {
            if (result.rows.length > 0) {
                document.querySelector('div#phaser').dataset.maxscore = result.rows.item(0).maxscore;
                // alert("SELECTED -> id: " + result.rows.item(0).id + ", user_id: " + result.rows.item(0).user_id + ", score: " + result.rows.item(0).score);
            }
        }, function (error) {});
    }
})
