//Ajusta a fonte que esta muito grande. Deixei algumas imagens de outras naves para vocês modificarem.
//AS METAS É TENTA FAZER O MENU, COM ESCOLHA DE 3 NAVES, TER UM CHEFÃO E ESPECIAIS.

(function(){
  //canvas
  var cnv = document.querySelector('canvas');
  //contexto de renderezição 2d
  var ctx = cnv.getContext('2d');


//RECURSOS DO JOGO =========================================================>
  //ARRAYS:
  var sprites = [];
  var assetsToLoad = [];
  var missiles = [];
  var aliens = [];
  var messages = [];

  //variáveis úteis
  var alienFrequency = 100;
  var alienTimer = 0;
  var hits = 0;
  var scoreTowin = 100;
  var FIRE = 0, EXPLOSION = 1;

  //SPRITES:
  //cenario:
  var background = new Sprite(0, 56, 400, 500, 0, 0);
  sprites.push(background);
  //nave:
  var defender = new Sprite(0, 0, 30, 50, 185, 450);
  sprites.push(defender);

  //mensagem tela inicial
  var starMessage = new ObjectMessage(cnv.height/2, "Comecar o jogo", "#f00");
  messages.push(starMessage);

  //mensagem de pausa
  var pausedMessage = new ObjectMessage(cnv.height/2, "Pause", "#f00");
  pausedMessage.visible = false;
  messages.push(pausedMessage);

  //Game over
  var gameOverMessage = new ObjectMessage(cnv.height/2, "", "#f00");
  gameOverMessage.visible = false;
  messages.push(gameOverMessage);

  //placar
  var scoreMessage = new ObjectMessage(10, "", "#0f0");
  scoreMessage.font = "normal bold 20px emulogic"; //Ajustar o tamanho da fonte.
  updateScore();
  messages.push(scoreMessage);

  //IMAGEM:
  var img = new Image();
  img.addEventListener('load',loadHandler,false);
  img.src = 'img/img.png';
  assetsToLoad.push(img);
  //contador de recursos
  var loadedAssets = 0;

  //ENTRADAS:
  var LEFT = 37, RIGHT = 39, ENTER = 13, SPACE = 32;

  //AÇÕES:
  var mvLeft = mvRight = shoot = spaceIsDown = false;

  //ESTADO DO JOGO:
  var LOADING = 0, PLAYING = 1, PAUSED = 2, OVER = 3;
  var gameState = LOADING;

  //listeners:
  window.addEventListener('keydown', function(e){
    var key = e.keyCode;
    switch(key){
      case LEFT:
        mvLeft = true;
        break;
      case RIGHT:
        mvRight = true;
        break;
      case SPACE:
        if(!spaceIsDown){
          shoot = true;
          spaceIsDown = true;
        }
        break;
    }
    //alert(key);
  },false);

  window.addEventListener('keyup', function(e){
    var key = e.keyCode;
    switch(key){
      case LEFT:
        mvLeft = false;
        break;
      case RIGHT:
        mvRight = false;
        break;
      case ENTER:
        if(gameState !== OVER){
          if(gameState !== PLAYING){
            gameState = PLAYING;
            starMessage.visible = false;
            pausedMessage.visible = false;
          } else {
            gameState = PAUSED;
            pausedMessage.visible = true;
          }
        }
        break;
      case SPACE:
        spaceIsDown = false;
    }
    //alert(key);
  },false);



//FUNÇÕES ========================================================================>
  function loadHandler(){
    loadedAssets = loadedAssets + 1;
    if(loadedAssets === assetsToLoad.length){
      img.removeEventListener('load',loadHandler,false);
      //iniciar o jogo
      gameState = PAUSED;
    }
  }

  function loop(){
    requestAnimationFrame(loop, cnv);
    //define as ações com base no estado do jogo
    switch(gameState){
      case LOADING:
        console.log('Carregando...');
        break;
      case PLAYING:
        update();
        break;
      case OVER:
        endGame();
        break;
    }
    render();
  }

  function update(){

    //move para a esquerda
    if(mvLeft && !mvRight){
      defender.vx = -5;
    }
    //move para a direita
    if(mvRight && !mvLeft){
      defender.vx = 5;
    }
    //para anave
    if(!mvLeft && !mvRight){
      defender.vx = 0
    }
    //dispara o canhão
    if(shoot){
      fireMissile();
      shoot = false;
    }

    //atualiza a posição
    defender.x = Math.max(0, Math.min(cnv.width - defender.width, defender.x + defender.vx));
    //alert('update ok');

    //atualiza a posição dos misseis
    for(var i in missiles){
      var missile = missiles[i];
      missile.y += missile.vy;
      if(missile.y < -missile.height){
        removeObjects(missile, missiles);
        removeObjects(missile, sprites);
        i-- ;
      }
    }

    //encremento do alienTimer
    alienTimer++;

    //criação do alien, caso o timer se iguale a fraquencia
    if(alienTimer === alienFrequency){
      makeAlien();
      alienTimer = 0;
      //ajuste na frequ~encia de criação de aliens
      if(alienFrequency > 2){
        alienFrequency--;
      }
    }
    //move os aliens
    for(var i in aliens){
      var alien = aliens[i];
      if(alien.state !== alien.EXPLODED){
        alien.y += alien.vy;
        if(alien.state === alien.CRAZY){
          if(alien.x > cnv.width - alien.width || Alien.x < 0){
            alien.vx *= -1;
          }
          alien.x += alien.vx;
        }
      }
      //confere se algum alien chegou a Terra
      if(alien.y > cnv.height + alien.height){
        gameState = OVER;
      }

      //Confere se algum alien colidiu com a nave
      if(collide(alien, defender)){
        destroyAlien(alien);
        removeObjects(defender, sprites);
        gameState = OVER;
      }

      //confere se algum, alien foi destruido
      for(var j in missiles){
        var missile = missiles[j];
        if(collide(missile, alien) && alien.state !== alien.EXPLODED){
          destroyAlien(alien);
          hits++;
          updateScore();
          if(parseIn(hits) === scoreTowin){
            gameState = OVER;
            //Destroi todos os aliens
            for(var k in aliens){
              var alienk = aliens[k];
              destroyAlien(alienk);
            }
          }
          removeObjects(missile, missiles);
          removeObjects(missile, sprites);
          j--;
          i--;
          //alert('boom');
        }
      }
    }//fim da movimentação dos aliens
  }

  //Criação dos misseis
  function fireMissile(){
    var missile = new Sprite(136, 12, 8, 13, defender.centerX() - 4, defender.y - 13);
    missile.vy = -8;
    sprites.push(missile);
    missiles.push(missile);
    playSound(FIRE);
  }

  //Criação dos aliens
  function makeAlien(){
    //cria um valor aleatório entre 0 e 7=>largura do canvas/largurado alien.
    //divide o canvas em 8 colunas para o posicionamento aleatorio do alien.
    var alienPosition = (Math.floor(Math.random() * 8)) * 50;
    console.log(alienPosition);
    var alien = new Alien(30, 0, 50, 50, alienPosition, -50);
    alien.vy = 1;

    //Otimização do alien
    if(Math.floor(Math.random() * 11) > 7){
      alien.state = alien.CRAZY;
      alien.vx = 2;
    }
    if(Math.floor(Math.random() * 11) > 5){
      alien.vy = 2;
    }

    sprites.push(alien);
    aliens.push(alien);
  }

  //Destruição dos aliens
  function destroyAlien(alien){
    alien.state = alien.EXPLODED;
    alien.explode();
    playSound(EXPLOSION);
    setTimeout(function(){
      removeObjects(alien, aliens);
      removeObjects(alien, sprites);
    }, 1000);
  }

  //remove os objetos do jogo
  function removeObjects(objectToRemove, array){
    var i = array.indexOf(objectToRemove);
    if(i !== -1){
      array.splice(i, 1);
    }
  }

  function render(){
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    //exibição dos sprites
    if(sprites.length !== 0){
      for(var i in sprites){
        var spr = sprites[i];
        ctx.drawImage(img, spr.sourceX, spr.sourceY, spr.width, spr.height, Math.floor(spr.x), Math.floor(spr.y), spr.width, spr.height);
      }
    }
    //alert('Ok');
    //exibir os textos
    if(messages.length !== 0){
      for(var i in messages){
        var message = messages[i];
        if(message.visible){
          ctx.font = message.font;
          ctx.fillStyle = message.color;
          ctx.textBaseline = message.baseline;
          message.x = (cnv.width - ctx.measureText(message.text).width)/2;
          ctx.fillText(message.text, message.x, message.y);
        }
      }
    }
  }

  //Atualizção do placar
  function updateScore(){
    scoreMessage.text = "ACERTOS: " + hits;
  }

  //função de game over
  function endGame(){
    if(hits < scoreTowin){
      gameOverMessage.text = "A Terra foi destruída!";
    } else {
      gameOverMessage.text = "A Terra foi salva!!!";
      gameOverMessage.color = "#00f";
    }
    gameOverMessage.visible = true;
    setTimeout(function(){
      location.reload();
    },3000);
  }

  //Efeito sonoros do jogo
  function playSound(soundType){
    var sound = document.createElement("audio");
    if(soundType === EXPLOSION){
      sound.src = "sound/explosion.mp3";
    } else{
      sound.src = "sound/fire.mp3"
    }
    sound.addEventListener("canplaythrough", function(){
      sound.play();
    }, false);

  }

  loop();



}());
