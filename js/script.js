(function(){
  // Criar local do jogo "canvas"
  var cnv = document.querySelector('canvas');
  //contexto de renderização 2d no "canvas"
  var ctx = cnv.getContext('2d');
  
  //RECURSOS DO JOGO ========================================================>
  //arrays
  var PowerUpList = ['double', 'triple', 'special'];
  var sprites = [];
  var assetsToLoad = [];
  var missiles = [];
  var aliens = [];
  var messages = [];
  var statusData = {
    earth: {life: 3, count: 0},
    spaceship: {life: 1, count: 0},
    opacity: {}
  };
  var powerUps = [];
  var menuMessages = [];
  var menuMessagesSelection = [];
  var menuOptions = {default: []};
  // coordenadas padrões da nave principal (Defender)
  var defaultDefender = {
    sourceX: 0, sourceY: 0, 
    sourceXLeft: 227, sourceYLeft: 0,
    sourceXRight: 257, sourceYRight: 0
  };
  
  //variáveis úteis
  var alienFrequency = 100;
  var alienTimer = 0;
  var shots = 0;
  var hits = 0;
  var acuracy = 0;
  var bossStatus = 0;
  var scoreToWin = 70;
  var FIRE = 0, EXPLOSION = 1;
  // Variaveis úteis pt.2
  var RED = "#F00", YELLOW = "#FF0", GREEN = "#0F0", BLUE = "#00F";
  var missileType = 'default';
  var powerUpFrequency = 0;
  var bossFrequency = 0;
  var alienType = 'default';
  var gameStatus = 'lose';
  var shootCount = 0;
  var alienCount = 0;
  var aliensCountToWin = 100;
  var mvHorizontal = 3;
  var mvVertical = 2;
  var menuHeight = cnv.height/2;
  var menuWidth = cnv.width/2;
  var menuX = (cnv.width-menuWidth)/2;
  var menuY = (cnv.height-menuHeight)/2;
  var toggleSound = 'on';
  var menuType = 'default';
  var isMenu = false;

  //sprites
  //imagem
  var img = new Image();
  img.addEventListener('load',loadHandler,false);
  img.src = "img/img2.png";
  assetsToLoad.push(img);
  //contador de recursos
  var loadedAssets = 0;

  //cenário
  var background = new Sprite(0,200,400,500,0,0);
  background.spriteType = 'background';
  var imgBackground = new Image();
  background.img = imgBackground;
  imgBackground.addEventListener('load',loadHandler,false);
  // Colorar aqui o caminho da imagem de fundo
  imgBackground.src = "img/background.png"; // <<<---
  assetsToLoad.push(imgBackground);
  //contador de recursos
  var loadedAssets = 0;
  sprites.push(background);
  
  //nave
  var defender = new Sprite(0,0,30,43,185,450);
  defender.spriteType = 'defender';
  sprites.push(defender);
  
  //mensagem da tela inicial
  var startMessage = new ObjectMessage(cnv.height/2,"PRESSIONE ENTER","#f00");
  messages.push(startMessage);
  
  //mensagem de pausa
  var pausedMessage = new ObjectMessage(cnv.height/2,"PAUSADO","#f00");
  pausedMessage.visible = false;
  messages.push(pausedMessage);
  
  //mensagem de game over
  var gameOverMessage = new ObjectMessage(cnv.height/2,"","#f00");
  gameOverMessage.visible = false;
  messages.push(gameOverMessage);
  
  //placar
  var scoreMessage = new ObjectMessage(10,"","#0f0");
  scoreMessage.font = "normal bold 15px emulogic";
  scoreMessage.textAlign = 'left';
  updateScore();
  messages.push(scoreMessage);

  // Mensagens do Menu
  var menuMessageTitle = new ObjectMessage(menuX+60,"MENU","#FFF");
  menuMessageTitle.font = "15px emulogic";
  menuMessages.push(menuMessageTitle);
  var menuMessageSound = new ObjectMessage(menuX+115,"SOM LIG","#EEE");
  menuMessageSound.font = "12px emulogic";
  menuMessageSound.actionType = 'sound';
  menuMessages.push(menuMessageSound);
  var menuMessageStyles = new ObjectMessage(menuX+160,"NAVES","#EEE");
  menuMessageStyles.font = "12px emulogic";
  menuMessageStyles.actionType = 'ships';
  menuMessages.push(menuMessageStyles);
  var menuMessageAbout = new ObjectMessage(menuX+205,"SOBRE","#EEE");
  menuMessageAbout.font = "12px emulogic";
  menuMessageAbout.actionType = 'about';
  menuMessages.push(menuMessageAbout);
  menuMessages[1].color = YELLOW;
  
  //entradas
  var TOP = 38, BOTTOM = 40, LEFT = 37, RIGHT = 39;
  var ENTER = 13, SPACE = 32, SHIFT = 15, ESC = 27, BACKSPACE = 8;
  
  //ações
  var mvLeft = mvRight = mvTop = mvBottom = shoot = spaceIsDown = confirmESC = false;
  
  //estados do jogo
  var LOADING = 0, PLAYING = 1, PAUSED = 2, OVER = 3;
  var gameState = LOADING;

  var menuMessagesSelectionObj = {};
  function checkNextMenu(direction) {
    var limitMin = menuType === 'default' ? 1 : 0;
    if (typeof menuMessagesSelectionObj[menuType] === 'undefined') {
      menuMessagesSelectionObj[menuType] = limitMin;
    }
    menuMessagesSelectionObj[menuType] = menuMessagesSelectionObj[menuType];
    if (direction.length > 0) {
      var dimension = menuType === 'default' ? 0 : 1;
      var loopAction = menuOptions[menuType];
      menuMessagesSelectionObj[menuType] += direction[dimension] > 1 ? 0 : direction[dimension];
      if (direction[dimension]) {
        if (menuMessagesSelectionObj[menuType] === menuOptions[menuType].length) {
          menuMessagesSelectionObj[menuType] = limitMin;
        } else if (menuMessagesSelectionObj[menuType] < limitMin) {
          menuMessagesSelectionObj[menuType] = menuOptions[menuType].length-1;
        }
      }
      for (var i in menuOptions[menuType]) {
        if (menuType === 'default') {
          menuOptions[menuType][i].color = i == menuMessagesSelectionObj[menuType] ? YELLOW : "white";
          if (!direction[dimension] && i == menuMessagesSelectionObj[menuType]) {
            var changeText = ['LIG', 'DES'];
            changeText = menuOptions[menuType][i].text.indexOf('LIG') > -1 ? ['LIG','DES'] : ['DES','LIG']
            menuOptions[menuType][i].text = menuOptions[menuType][i].text.replace(changeText[0], changeText[1]);
            menuOptions[menuType][i].action = true;
          }
        } else if (menuType === 'ships') {
          menuOptions[menuType][i].outline = i == menuMessagesSelectionObj[menuType] ? true : false;
          if (!direction[dimension] && i == menuMessagesSelectionObj[menuType]) {
            // Mudar o sprite da nave padrão
            defaultDefender.sourceX = menuOptions[menuType][i].sourceX;
            defaultDefender.sourceY = menuOptions[menuType][i].sourceY;
            defaultDefender.sourceXLeft = menuOptions[menuType][i].sourceXLeft;
            defaultDefender.sourceYLeft = menuOptions[menuType][i].sourceYLeft;
            defaultDefender.sourceXRight = menuOptions[menuType][i].sourceXRight;
            defaultDefender.sourceYRight = menuOptions[menuType][i].sourceYRight;
            defender.sourceX = menuOptions[menuType][i].sourceX;
            defender.sourceY = menuOptions[menuType][i].sourceY;
            defender.sourceXLeft = menuOptions[menuType][i].sourceXLeft;
            defender.sourceYLeft = menuOptions[menuType][i].sourceYLeft;
            defender.sourceXRight = menuOptions[menuType][i].sourceXRight;
            defender.sourceYRight = menuOptions[menuType][i].sourceYRight;
          }
        }
      }
    }
  }
  // Verificação das teclas pressionadas no jogo
  // movimento 'keydown': sempre que uma tecla for pressionada
  window.addEventListener('keydown',function(e){
    var direction = [];
    var key = e.keyCode;
    // Para descobrir o código das teclas específicas 
    // descomente a linha abaixo e abra o console no navegador
    // console.log('Codigo da Tecla: ' + key);
    switch(key){
      case LEFT:
        mvLeft = true;
        direction = [0,-1];
        e.preventDefault();
        break;
      case RIGHT:
        mvRight = true;
        direction = [0,1];
        e.preventDefault();
        break;
      case TOP:
        mvTop = true;
        direction = [-1,-1];
        e.preventDefault();
        break;
      case BOTTOM:
        mvBottom = true;
        direction = [1,1];
        e.preventDefault();
        break;
      case ENTER:
        direction = [0,0];
        e.preventDefault();
        break;
      case BACKSPACE:
      case ESC:
        e.preventDefault();
        if (menuType !== 'default') {
          confirmESC = false;
          menuType = 'default';  
        } else {
          confirmESC = true;
        }
        break;
      case SPACE:
        if(!spaceIsDown){
          shoot = true;
          spaceIsDown = true;
        }
        break;
    }
    if(isMenu) {
      checkNextMenu(direction);
    }
  },false);
  // movimento 'keyup': sempre que uma tecla pressionada for solta
  window.addEventListener('keyup',function(e){
    var key = e.keyCode;
    switch(key){
      case LEFT:
        mvLeft = false;
        e.preventDefault();
        break;
      case RIGHT:
        mvRight = false;
        e.preventDefault();
        break;
      case TOP:
        mvTop = false;
        e.preventDefault();
        break;
      case BOTTOM:
        mvBottom = false;
        e.preventDefault();
        break;
      case ENTER:
        if(gameState !== OVER){
          if (startMessage.visible) {
            gameState = PLAYING;
            startMessage.visible = false;
          }
          // if (gameState === PLAYING) {
          //   gameState = PAUSED;
          //   isMenu = true;
          // }
        }
        break;
      case ESC:
        if(gameState !== OVER){
          if(gameState !== PLAYING && confirmESC){
            gameState = PLAYING;
            isMenu = false;
            startMessage.visible = false;
            pausedMessage.visible = false;
          } else {
            gameState = PAUSED;
            isMenu = true;
            pausedMessage.visible = true;
          }
        }
        break;
      case SPACE:
        shoot = false;
        spaceIsDown = false;
    }
  },false);
  
  
  
  //FUNÇÕES =================================================================>
  function loadHandler(){
    loadedAssets++;
    if(loadedAssets === assetsToLoad.length){
      this.removeEventListener('load',loadHandler,false);
      //inicia o jogo
      gameState = PAUSED;
    }
  }
  
  // função para garantir que a imagem vai preencher a tela do jogo
  var preencherTela = function(imgObj){
    // garante que só ira executar a função com a imagem carregada
    // se não entrará em loop infinito
    if (!imgObj.complete) return false;
      for (var w = 0; w < cnv.width; w += imgObj.width) {
          for (var h = 0; h < cnv.height; h += imgObj.height) {
              ctx.drawImage(imgObj, w, h);
          }
      }
  }

  function loop(){
    requestAnimationFrame(loop, cnv);
    var extra;
    gameSounds();
    //define as ações com base no estado do jogo    
    switch(gameState){
      case LOADING:
        statusData.earth.count = 0;
        statusData.spaceship.count = 0;
        console.log('CARREGANDO...');
        break;
      case PLAYING:
        update();
        break;
      case OVER:
        endGame();
        break;
      case PAUSED:
        if (!startMessage.visible) {
          extra = 'menu';
        }
        break;
    }
    render(extra);
  }

  function update(){
    // move para cima
    if(mvTop && !mvBottom){
      defender.vy = mvVertical;
      defender.sourceX = defaultDefender.sourceX;
      defender.sourceY = defaultDefender.sourceY;
    }

    // move para baixo
    if(mvBottom && !mvTop){
      defender.vy = -mvVertical;
      defender.sourceX = defaultDefender.sourceX;
      defender.sourceY = defaultDefender.sourceY;
    }

    //move para a esquerda
    if(mvLeft && !mvRight){
      defender.vx = -mvHorizontal;
      // muda o sprite da nave ao virar para esquerda
      defender.sourceX = defaultDefender.sourceXLeft;
      defender.sourceY = defaultDefender.sourceYLeft;
    }
    
    //move para a direita
    if(mvRight && !mvLeft){
      defender.vx = mvHorizontal;
      // muda o sprite da nave ao virar para esquerda
      defender.sourceX = defaultDefender.sourceXRight;
      defender.sourceY = defaultDefender.sourceYRight;
    }
    
    //para a nave
    if(!mvLeft && !mvRight && !mvTop && !mvBottom){
      defender.vx = 0;
      defender.vy = 0;
      defender.sourceX = defaultDefender.sourceX;
      defender.sourceY = defaultDefender.sourceY;
    }

    
    // Dispara os misseis mesmo com a barra de espaço apertada
    shootCount++;
    if(shoot){
      if (shootCount > 5) {
        fireMissile(missileType);
        shootCount = 0;
      }
    }
    
    // atualiza a posição coordenadas (x, y) da nave no "Canvas"
    defender.x = Math.max(0,Math.min(cnv.width - defender.width, defender.x + defender.vx));
    defender.y = Math.max(0,Math.min(cnv.height - defender.height, defender.y - defender.vy));
    
    //atualiza a posição dos mísseis
    for(var i = missiles.length -1; i >= 0 ; i--){ // <<<< AQUI ESTAVA O ERRO (Removendo elemento do array durante iteração)
      var missile = missiles[i];
      missile.y += missile.vy;
      if(missile.y < -missile.height){
        removeObjects(missile,missiles);
        removeObjects(missile,sprites);
        updateScore();
      }     
    }   
    //encremento do alienTimer
    alienTimer++;

    // determinar a frequencia de aparecimento dos powerUps
    powerUpFrequency++;
    if (powerUpFrequency > 1000) {
      powerUpFrequency = 0;
      makePowerUp();
    }

    //criação do alien, caso o timer se iguale à frequência
    if(alienTimer === alienFrequency){
      makeAlien(alienType);
      alienTimer = 0;
      bossFrequency++;
      if (!(bossFrequency % 10)) {
        alienType = 'miniboss';
      }
      if (!(bossFrequency % 100)) {
        alienType = 'boss';
      }
      //ajuste na frequência de criação de aliens
      if(alienFrequency > 2){
        alienFrequency--;
      }
    }
    
    //move os aliens
    for(var i in aliens){
      var alien = aliens[i];
      if(alien.state !== alien.EXPLODED){
        alien.y += alien.vy;
        // fazer efeito ao receber tiro
        if (alien.opacity < 0.75) {
          alien.opacity = 1;
          alien.fade = false;
        }
        if(alien.state === alien.CRAZY){
          if(alien.x > cnv.width - alien.width || alien.x < 0){
            alien.vx *= -1;
          }
          alien.x += alien.vx;
        }
      }
      
      //confere se algum alien chegou à Terra
      if(alien.y > cnv.height + alien.height){
        statusData.earth.count += 1;
        // destroi o alien só deletando os sprites
        destroyAlien(alien,'direct');
        updateScore();
        if(statusData.earth.life == statusData.earth.count){
          gameState = OVER;
        }
      }
      
      //confere se algum alien colidiu com a nave
      if(collide(alien,defender)){
        statusData.spaceship.count += 1;
        destroyAlien(alien);
        if (statusData.spaceship.count === statusData.spaceship.life) {
          removeObjects(defender,sprites);
          gameState = OVER;
        }
      }
      
      //confere se algum alien foi destruido
      for(var j in missiles){
        var missile = missiles[j];
        if(collide(missile,alien) && alien.state !== alien.EXPLODED){
          alien.life = alien.life - missile.power;
          if (alien.life <= 0) {
            destroyAlien(alien);
            alienCount++;
          } else {
            alien.fade = true;
          }
          // contador de tiros
          hits++;
          //// Contador de tiros para acabar com o jogo foi RETIRADO
          //// Verificar função checkEndGame()
          // updateScore();
          // if(parseInt(hits) === scoreToWin){
          //  gameState = OVER;
          //  //destroi todos os aliens
          //  for(var k in aliens){
          //    var alienk = aliens[k];
          //    destroyAlien(alienk);
          //  }
          // }
          removeObjects(missile,missiles);
          removeObjects(missile,sprites);
          j--;
          i--;
        }
      }
    }//fim da movimentação dos aliens

    function checkEndGame() {
      // Verifica se a quantidade de aliens abatidos é igual
      // a quantidade de aliens necessária para vencer
      if (parseInt(alienCount) === aliensCountToWin) {
        gameState = OVER;
        gameStatus = 'win';
      }
    }
    checkEndGame();
    
    for (var i in powerUps) {
      var powerUp = powerUps[i];
      //confere se a nave pegou algum powerUp
      if(collide(powerUp,defender)){
        absorvPowerUp(powerUp);
      }

      if(powerUp.y > cnv.height + powerUp.height || powerUpFrequency > 100){
        removeObjects(powerUp,powerUps);
        removeObjects(powerUp,sprites);
      }
    }//fim da movimentação dos aliens
  }//fim do update


  //criação dos mísseis
  function fireMissile(shootType){
    var shootType = shootType || 'default';
    if(shootType === 'default'){
      var missile = new Missile(150,0,8,13,defender.centerX() - 4,defender.y - 13);
      missile.vy = -8;
      sprites.push(missile);
      missiles.push(missile);
      playSound(FIRE, toggleSound);
      shots++;
    } else if(shootType === 'double'){
      var missile1 = new Missile(158,0,11,30,defender.centerX() - 6 - 15,defender.y - 13);
      var missile2 = new Missile(158,0,11,30,defender.centerX() - 6 + 15,defender.y - 13);
      missile1.vy = -8;
      missile2.vy = -8;
      missile1.power = 2;
      missile2.power = 2;
      sprites.push(missile1);
      missiles.push(missile1);
      sprites.push(missile2);
      missiles.push(missile2);
      playSound(FIRE, toggleSound);
      shots=shots+2;
    } else if(shootType === 'triple'){
      var missile1 = new Missile(158,0,11,30,defender.centerX() - 4,defender.y - 21);
      var missile2 = new Missile(158,0,11,30,defender.centerX() - 4 + 20,defender.y - 13);
      var missile3 = new Missile(158,0,11,30,defender.centerX() - 4 - 20,defender.y - 13);
      missile1.vy = -8;
      missile2.vy = -8;
      missile3.vy = -8;
      missile1.power = 3;
      missile2.power = 3;
      missile3.power = 3;
      sprites.push(missile1);
      missiles.push(missile1);
      sprites.push(missile2);
      missiles.push(missile2);
      sprites.push(missile3);
      missiles.push(missile3);
      playSound(FIRE, toggleSound);
      shots=shots+3;
    } else if(shootType === 'special'){
      var missile = new Missile(169,0,29,43,defender.centerX() - 15,defender.y - 13);
      missile.power = 6;
      missile.vy = -8;
      sprites.push(missile);
      missiles.push(missile);
      playSound(FIRE, toggleSound);
      shots++;
    }
  }
  
  //criação de aliens
  function makeAlien(alienType_){
    var alienT = alienType_ || 'default';
    //cria um valor aleatório entre 0 e 7 => largura do canvas / largura do alien
    //divide o canvas em 8 colunas para o posicionamento aleatório do alien
    var alienTypesListIndexes = [0,1,2,3];
    var alienPosition = (Math.floor(Math.random() * 8)) * 50;
    var alienSourceX = (alienTypesListIndexes[Math.floor(Math.random() * 4)]+1)*30;
    var alien = new Alien(alienSourceX,0,30,40,alienPosition,-50);
    alien.spriteType = 'alien';
    if (alienT === 'miniboss') {
      var alienSourceX = alienTypesListIndexes[Math.floor(Math.random() * 4)]*50;
      alien.sourceX = alienSourceX;
      alien.sourceY = 50;
      alien.height = 50;
      alien.width = 50;
      alien.life = 10;
      alienType = 'default';
    } else if (alienT === 'boss') {
      var alienSourceX = alienTypesListIndexes[Math.floor(Math.random() * 4)]*50;
      alien.sourceX = alienSourceX;
      alien.sourceY = 50;
      alien.height = 50;
      alien.width = 50;
      alien.life = 50;
      alien.opacity = .3;
      alienType = 'default';
    }
    alien.type = alienT;
    alien.vy = 1;
    
    //otimização do alien
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


  // criar PowerUps
  function makePowerUp(){
    //cria um valor aleatório entre 0 e 7 => largura do canvas / largura do PowerUp
    //divide o canvas em 8 colunas para o posicionamento aleatório do PowerUp
    function sortPowerUp() {
      return PowerUpList[Math.floor(Math.random() * 3)];
    }
    var powerUpPositionX = (Math.floor(Math.random() * 8)) * 50;
    var powerUpPositionY = (Math.floor(Math.random() * 4)) * 50 + 200;
    var count = 1;
    var powerUpType;
    while (1) {
      count++;
      powerUpType = sortPowerUp();
      if (powerUpType === 'special' && count > 3)
        powerUpType = 'special';
        break;
      if (count === 1 &&  powerUpType !== 'special') {
        break;
      }
    }
    if (powerUpType === 'special')
      var powerUpType = PowerUpList[Math.floor(Math.random() * 3)];
    var powerUp = new PowerUp(288,0,26,26,powerUpPositionX,powerUpPositionY);
    powerUp.vy = 20;
    powerUp.type = powerUpType;
    if(Math.floor(Math.random() * 11) > 5){
      powerUp.vy = 40;
    }
    sprites.push(powerUp);
    powerUps.push(powerUp);
  }
  
  //destroi aliens
  function destroyAlien(alien, destroyType){
    var destroyType = destroyType || 'default';
    if (destroyType === 'direct') {
      removeObjects(alien,aliens);
      removeObjects(alien,sprites);
      return 0;
    }
    alien.state = alien.EXPLODED;
    alien.explode();
    // habilitar opacidade conforme o tempo passa
    alien.opacity = 1;
    alien.fade = true;
    playSound(EXPLOSION, toggleSound);
    setTimeout(function(){
      removeObjects(alien,aliens);
      removeObjects(alien,sprites);
    },1000);
  }

  // absorver powerUps
  function absorvPowerUp(powerUp){
    missileType = powerUp.type;
    // playSound(EXPLOSION, toggleSound);
    removeObjects(powerUp,powerUps);
    removeObjects(powerUp,sprites);
  }
  
  //remove os objetos do jogo
  function removeObjects(objectToRemove,array){
    var i = array.indexOf(objectToRemove);
    if(i !== -1){
      array.splice(i,1);
    }
  }
  
  //atualização do placar
  function updateScore(){
    //cálculo do aproveitamento
    if(shots === 0){
      acuracy = 100;
    } else {
      acuracy = Math.floor((hits/shots) * 100);
    }
    //ajuste no texto do aproveitamento
    if(acuracy < 100){
      acuracy = acuracy.toString();
      if(acuracy.length < 2){
        acuracy = "  " + acuracy;
      } else {
        acuracy = " " + acuracy;
      }
    }
    //ajuste no texto do hits
    hits = hits.toString();
    if(hits.length < 2){
      hits = "0" + hits;
    }
    // scoreMessage.text = "PONTOS: " + hits " - ACC: " + acuracy + "%";
    var earthLife = statusData.earth.life - statusData.earth.count;
    switch (earthLife) {
      case 1:
        scoreMessage.color = RED;
        break;
      case 2:
        scoreMessage.color = YELLOW;
        break;
      case 3:
        scoreMessage.color = GREEN;
        break;
    }
    scoreMessage.text = "Vidas: " + (earthLife).toString();
  }
  
  //função de game over
  function endGame(){
    if(gameStatus === 'win'){
      gameOverMessage.text = "TERRA SALVA!";
      gameOverMessage.color = BLUE;
      if (bossStatus > 0) {
        gameOverMessage.text = "CHEFÃO DESTRUIDO!";
        gameOverMessage.color = GREEN;
      }
    } else {
      if(statusData.earth.life === statusData.earth.count) {
        gameOverMessage.text = "TERRA DESTRUIDA!";
      } else {
        gameOverMessage.text = "NAVE DESTRUIDA!";
      }
      if (bossStatus === -1) {
        gameOverMessage.text = "CHEFÃO DESTRUIU A TERRA!";  
      }
    }
    gameOverMessage.visible = true;
    // recarrega a página inteira usando o comando: `location.reaload();`
    // utilizando a função `setTimeout()` que depois determinado tempo
    // executará a função, nesse caso 3000ms
    setTimeout(function(){
      location.reload();
    },3000);
  }
  
  //efeitos sonoros do jogo
  function playSound(soundType, toggle){
    if (toggle === 'on') {
      var sound = document.createElement("audio");
      if(soundType === EXPLOSION){
        sound.src = "sound/explosion.mp3";
      } else {
        sound.src = "sound/fire.mp3";
      }
      sound.addEventListener("canplaythrough",function(){
        sound.play();
      },false);
    }
  }

  // atualizar os sprites de explosão
  function renderExplosion(sprite_) {
    if (sprite_.count<6) {
      sprite_.sourceX = 200;
      sprite_.width = 39;
      sprite_.height = 38;
    } else if (sprite_.count<12) {
      sprite_.sourceX = 239;
      sprite_.width = 37;
      sprite_.height = 36;
    } else if (sprite_.count<18) {
      sprite_.sourceX = 276;
      sprite_.width = 37;
      sprite_.height = 34;
    } else if (sprite_.count<24) {
      sprite_.sourceX = 313;
      sprite_.width = 37;
      sprite_.height = 34;
    } else if (sprite_.count<30) {
      sprite_.sourceX = 350;
      sprite_.width = 32;
      sprite_.height = 32;
    } else if (sprite_.count<36) {
      sprite_.sourceX = 200;
      sprite_.sourceY += 50;
      sprite_.width = 28;
      sprite_.height = 30;
    } else if (sprite_.count<42) {
      sprite_.sourceX = 231;
      sprite_.width = 29;
      sprite_.height = 28;
    } else if (sprite_.count<48) {
      sprite_.sourceX = 260;
      sprite_.width = 26;
      sprite_.height = 25;
    } else {
      sprite_.sourceX = 286;
      sprite_.width = 21;
      sprite_.height = 24;
    }
  }

  function renderText(message) {
    if(message.visible){
      ctx.font = message.font;
      ctx.fillStyle = message.color;
      ctx.textBaseline = message.baseline;
      ctx.textAlign = message.textAlign;
      // garante que os textos com alinhamento no centro seja centralizado
      if (message.textAlign === 'center') {
        message.x = (cnv.width - ctx.measureText(message.text).width)/2;
        ctx.textAlign = 'left';
      }
      ctx.fillText(message.text,message.x,message.y);
    }
  }
  function gameSounds() {
    if (toggleSound === 'on') {
      if (!document.getElementById('musicTheme')) {
        document.getElementsByTagName("body")[0].insertAdjacentHTML('beforeend','<audio id="musicTheme" src="sound/music.mp3" type="audio/mpeg" loop autoplay></audio>');
      }
    }
    else if (toggleSound === 'off') {
      if (document.getElementById('musicTheme')) {
        document.getElementById("musicTheme").parentNode.removeChild(document.getElementById("musicTheme"));
      }
    }
  }
  function renderMenuLayout(layoutType) {
    var newMenuX = (cnv.width-menuHeight)/2;
    var newMenuY = (cnv.height-menuWidth)/2;
    if (layoutType === 'default') {
      ctx.fillStyle = "#151515";
      ctx.fillRect(menuX,menuY,menuWidth,menuHeight);
      ctx.fillStyle = "white";
      ctx.fillRect(menuX+10,menuY+10,menuWidth-20,menuHeight-20);
      ctx.fillStyle = "#131313";
      ctx.fillRect(menuX+15,menuY+15,menuWidth-30,menuHeight-30);
    } else if (layoutType === 'ships') {
      ctx.fillStyle = "#151515";
      ctx.fillRect(newMenuX,newMenuY,menuHeight,menuWidth);
      ctx.fillStyle = "white";
      ctx.fillRect(newMenuX+10,newMenuY+10,menuHeight-20,menuWidth-20);
      ctx.fillStyle = "#131313";
      ctx.fillRect(newMenuX+15,newMenuY+15,menuHeight-30,menuWidth-30);
    } else if (layoutType === 'about') {
      ctx.fillStyle = "#151515";
      ctx.fillRect(newMenuX,newMenuY,menuHeight,menuWidth);
      ctx.fillStyle = "white";
      ctx.fillRect(newMenuX+10,newMenuY+10,menuHeight-20,menuWidth-20);
      ctx.fillStyle = "#131313";
      ctx.fillRect(newMenuX+15,newMenuY+15,menuHeight-30,menuWidth-30);
    }
  }
  // Renderizar a tela de Menu
  function renderMenu(MenuType) {
    var loopMessages = [];
    var loopSprites = [];
    var newMenuX = (cnv.width-menuHeight)/2;
    var newMenuY = (cnv.height-menuWidth)/2;
    // box com as opções do menu
    // -->> Essa fonte não permite acentos <<--
    // criando a janela do menu
    renderMenuLayout(MenuType);
    if (MenuType === 'default') {
      loopMessages = menuMessages;
    } else if (MenuType === 'ships') {
      loopMessages = [];
      // adicionando conteúdo na janela
      var messageAbout = new ObjectMessage(newMenuY+30,"Selecione a Nave","#EEE");
      messageAbout.font = "12px emulogic";
      loopMessages.push(messageAbout);
      loopSprites = menuOptions[MenuType];
      // carregando os sprites
      if (typeof menuOptions[MenuType] === 'undefined') {
        loopSprites = [];
        var newDefenderSprite = new Sprite(0,0,30,40,newMenuX+50,newMenuY+75);
        newDefenderSprite.sourceXLeft = 227;
        newDefenderSprite.sourceXRight = 257;
        newDefenderSprite.sourceYRight = 0;
        newDefenderSprite.sourceYLeft = 0;
        newDefenderSprite.outline = true;
        loopSprites.push(newDefenderSprite);
        var newDefenderSprite = new Sprite(0,100,30,40,newMenuX+110,newMenuY+75);
        newDefenderSprite.sourceXLeft = 30;
        newDefenderSprite.sourceXRight = 60;
        newDefenderSprite.sourceYRight = 100;
        newDefenderSprite.sourceYLeft = 100;
        loopSprites.push(newDefenderSprite);
        var newDefenderSprite = new Sprite(90,100,30,40,newMenuX+170,newMenuY+75);
        newDefenderSprite.sourceXLeft = 120;
        newDefenderSprite.sourceXRight = 150;
        newDefenderSprite.sourceYRight = 100;
        newDefenderSprite.sourceYLeft = 100;
        loopSprites.push(newDefenderSprite);
      }
    } else if (MenuType === 'about') {
      loopMessages = [];
      // adicionando conteúdo na janela
      var messageAbout = new ObjectMessage(newMenuY+20,"COLABORADORES","#EEE");
      messageAbout.font = "12px emulogic";
      loopMessages.push(messageAbout);
      var messageAbout = new ObjectMessage(newMenuY+65,"BRUNA LIMA","#EEE");
      messageAbout.font = "12px emulogic";
      messageAbout.textAlign = "left";
      messageAbout.x = newMenuX+25;
      loopMessages.push(messageAbout);
      var messageAbout = new ObjectMessage(newMenuY+105,"PAULO MELO","#EEE");
      messageAbout.font = "12px emulogic";
      messageAbout.textAlign = "left";
      messageAbout.x = newMenuX+25;
      loopMessages.push(messageAbout);
      var messageAbout = new ObjectMessage(newMenuY+145,"YAGO ALVES","#EEE");
      messageAbout.font = "12px emulogic";
      messageAbout.textAlign = "left";
      messageAbout.x = newMenuX+25;
      loopMessages.push(messageAbout);
    }
    menuOptions[MenuType] = loopSprites.length === 0 ? loopMessages : loopSprites;

    for (var i in loopMessages) {
      var message = loopMessages[i];
      // verificar se alguma ação foi requisitada pela função `checkNextMenu()`
      if (message.action) {
        // verificar o tipo da ação
        switch (message.actionType) {
          case 'sound':
            toggleSound = toggleSound === 'on' ? 'off': 'on';
            gameSounds();
            break;
          case 'ships':
            menuType = 'ships';
            break;
          case 'about':
            menuType = 'about';
            break;
        }
        message.action = false;
      }
      renderText(message);
    }

    for (var i in loopSprites) {
      var spr = loopSprites[i];
      if (!spr.img) {
        spr.img = img;
      }
      if (spr.outline) {
        // var dArr = [-1,-1, 0,-1, 1,-1, -1,0, 1,0, -1,1, 0,1, 1,1], // offset array
        // s = 2,  // scale
        // i = 0;  // iterator
        // for(; i < dArr.length; i += 2) 
        //   ctx.drawImage(spr.img,spr.sourceX,spr.sourceY,spr.width,spr.height,spr.x + dArr[i]*s,spr.y + dArr[i+1]*s,spr.ratioX*spr.width,spr.ratioY*spr.height);

        // fill with color
        // ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "#333";
        ctx.fillRect(spr.x,spr.y,spr.width,spr.height);

        // draw original image in normal mode
        // ctx.globalCompositeOperation = "source-over";
      }
      ctx.drawImage(spr.img,spr.sourceX,spr.sourceY,spr.width,spr.height,Math.floor(spr.x),Math.floor(spr.y),spr.ratioX*spr.width,spr.ratioY*spr.height);
    }
  }

  function render(extraContent){
    var extra = extraContent || 'default';
    ctx.clearRect(0,0,cnv.width,cnv.height);
    //exibe os sprites
    if(sprites.length !== 0){
      for(var i in sprites){
        var spr = sprites[i];
        // FORMATO DOS PARAMETROS: drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        // image    => Imagem selecionada
        // (sx, sy) => coordenadas do canto superior esquerdo na imagem de origem
        // sWidth   => largura da imagem selecionada
        // sHeight  => altura da imagem selecionada
        // (dx, dy) => coordenadas do canto superior esquerdo na imagem de destino
        // sWidth   => largura na imagem no destino
        // sHeight  => altura na imagem no destino

        // fazer a animação com a opacidade do elemento se o fade estiver habilitado
        if (spr.fade && spr.opacity >= 0.05) {
          spr.opacity -= 0.05;
          spr.opacity = Math.round(spr.opacity*100)/100;
        }
        // caso seja sprite de explosão realizar a mudança de sprites
        if (spr.spriteType === 'explosion') {
          spr.count += 1;
          renderExplosion(spr);
        }
        // garantir que utilize a imagem padrão
        if (!spr.img)
          spr.img = img;
        // modificar a opacidade do objeto no canvas
        ctx.globalAlpha = spr.opacity;
        // para garantir que a imagem do fundo preencha completamente o canvas
        if (spr.spriteType === 'background') {
          preencherTela(spr.img);
        } else {
          ctx.drawImage(spr.img,spr.sourceX,spr.sourceY,spr.width,spr.height,Math.floor(spr.x),Math.floor(spr.y),spr.ratioX*spr.width,spr.ratioY*spr.height); 
        }
        
      }
    }
    //exibe os textos
    if(messages.length !== 0){
      for(var i in messages){
        var message = messages[i];
        renderText(message);
      }
    }
    if (extra === 'menu') {
      renderMenu(menuType);
    }
  }
  
  loop();
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
}());
