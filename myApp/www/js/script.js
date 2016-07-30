(function(){

  // Criar local do jogo "canvas"
  var cnv = document.getElementById('canvas');
  var cnvBG = document.getElementById('canvas-bg');
  //contexto de renderização 2d no "canvas"
  var ctx = cnv.getContext('2d');
  var ctxBG = cnvBG.getContext('2d');
  
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
    spaceship: {life: 3, count: 0},
    opacity: {}
  };
  var powerUps = [];
  var menuMessages = [];
  var menuMessagesSelection = [];
  var menuOptions = {default: []};
  
  //variaveis
  var alienFrequency = 100;
  var alienTimer = 0;
  var shots = 0;
  var hits = 0;
  var acuracy = 0;
  var bossStatus = 0;
  var scoreToWin = 70;
  var FIRE = 0, EXPLOSION = 1;
  // Variaveis p.2
  var RED = "#F00", YELLOW = "#FF0", GREEN = "#0F0", BLUE = "#00F";
  var missileType = 'default';
  var powerUpFrequency = 0;
  var BossFrequency = 0;
  var MiniBossFrequency = 0;
  var enableAlienCreation = true;
  var enableFireMissile = true;
  var alienType = 'default';
  var gameStatus = 'lose';
  var shootCount = 0;
  var alienCount = 0;
  var alienDestroyCount = 0;
  var aliensCountToWin = 50;
  var mvHorizontal = 3;
  var mvVertical = 2;
  var menuHeight = cnv.height/2;
  var menuWidth = cnv.width/2;
  var menuX = (cnv.width-menuWidth)/2;
  var menuY = (cnv.height-menuHeight)/2;
  var toggleSound = 'on';
  var menuType = 'default';
  var isMenu = false;
  var stopBgAnimation = false;
  var invencibleStatusCount;
  var refreshPage = false;
  var isStart = true;
  var mobileCheck = true;
  var isMobile = false;
  var fps = 60;

  //sprites
  //imagem
  var img = new Image();
  img.addEventListener('load',loadHandler,false);
  img.src = "img/img2.png";
  assetsToLoad.push(img);
  //contador de recursos
  var loadedAssets = 0;

  var velocity=40;
  var bgImage;
  bgImage = new Image();
  bgImage.src = "img/background.png"
  bgImage.addEventListener('load',drawImagePattern,false);

  //cenario
  var background = new Sprite(0,200,350,554,0,0);
  background.spriteType = 'background';
  var imgBackground = new Image();
  background.img = imgBackground;
  imgBackground.addEventListener('load',loadHandler,false);
  // Colocar aqui o caminho da imagem de fundo
  imgBackground.src = "img/background.png"; // <<<---
  assetsToLoad.push(imgBackground);
  //contador de recursos
  loadedAssets = 0;
  sprites.push(background);
  
  //nave
  var defender = new Sprite(0,0,30,43,185,450);
  defender.spriteType = 'defender';
  sprites.push(defender);
  // coordenadas padrões da nave principal (Defender)
  var defaultDefender = {
    sourceX: 0, sourceY: 0, 
    sourceXLeft: 227, sourceYLeft: 0,
    sourceXRight: 257, sourceYRight: 0
  };
  
  //mensagem da tela inicial
  var startMessage = new ObjectMessage(3*cnv.height/4,"PRESSIONE ENTER","#f00");
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
  var scoreMessage = new ObjectMessage(0,"","#0f0");
  scoreMessage.font = "normal bold 12px emulogic";
  scoreMessage.textAlign = 'left';
  var scoreMessageExtra = new ObjectMessage(0,"","#0f0");
  scoreMessageExtra.font = "normal bold 12px emulogic";
  scoreMessageExtra.textAlign = 'center';
  updateScore();
  messages.push(scoreMessageExtra);
  messages.push(scoreMessage);

  // Mensagens do Menu
  var menuBoxMessages = [
    {y:menuX+60, text:"MENU", color:"#FFF", actionType:false, font:"15px emulogic"},
    {y:menuX+110, text:"INFO", color:"#EEE", actionType:"info", font:"12px emulogic"},
    {y:menuX+145, text:"SOM LIG", color:"#EEE", actionType:"sound", font:"12px emulogic"},
    {y:menuX+180, text:"NAVES", color:"#EEE", actionType:"ships", font:"12px emulogic"},
    {y:menuX+215, text:"SOBRE", color:"#EEE", actionType:"about", font:"12px emulogic"}
  ];
  pushTextObjToArray(menuBoxMessages,menuMessages)
  function pushTextObjToArray(listObjects,array) {
    for (var i in listObjects) {
      var msgObj = listObjects[i];
      var messageObj = new ObjectMessage(msgObj.y,msgObj.text,msgObj.color);
      messageObj.font = msgObj.font;
      if ('actionType' in msgObj && msgObj.actionType) {
        messageObj.actionType = msgObj.actionType;
        if ('action' in msgObj && msgObj.action) {
          messageObj.actionType = msgObj.action;
        }
      }
      if ('textAlign' in msgObj && msgObj.textAlign)
        messageObj.textAlign = msgObj.textAlign;
      if ('x' in msgObj && msgObj.x)
        messageObj.x = msgObj.x;
      array.push(messageObj);
    }
  }
  // Selecionar a primeira opção do menu
  menuMessages[1].color = YELLOW;
  
  //entradas
  var UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39;
  var ENTER = 13, SPACE = 32, SHIFT = 15, ESC = 27, BACKSPACE = 8;
  
  //ações
  var mvLeft = mvRight = mvUp = mvDown = shoot = spaceIsDown = confirmESC = false;
  var shootAlien = {};
  
  //estados do jogo
  var LOADING = 0, PLAYING = 1, PAUSED = 2, OVER = 3;
  var gameState = LOADING;

  // Fazer um loop entre as opções do menu
  // Váriavel para armazenar index do opcão seleciona por menu 
  var selectOption = {};
  function checkNextMenu(direction) {
    var limitMin = menuType === 'default' ? 1 : 0;
    if (!(menuType in selectOption))
      selectOption[menuType] = limitMin;
    if (direction.length > 0) {
      // escolher qual o index do array direção usaremos
      var dimension = menuType === 'default' ? 0 : 1;
      // variável responsável pelas opções que entrarão no loop
      var loopAction = menuOptions[menuType];
      selectOption[menuType] += direction[dimension] > 1 ? 0 : direction[dimension];
      if (direction[dimension]) {
        if (selectOption[menuType] === menuOptions[menuType].length) {
          selectOption[menuType] = limitMin;
        } else if (selectOption[menuType] < limitMin) {
          selectOption[menuType] = menuOptions[menuType].length-1;
        }
      }
      for (var i in menuOptions[menuType]) {
        if (menuType === 'default') {
          menuOptions[menuType][i].color = i == selectOption[menuType] ? YELLOW : "white";
          if (!direction[dimension] && i == selectOption[menuType]) {
            var changeText = ['LIG', 'DES'];
            changeText = menuOptions[menuType][i].text.indexOf('LIG') > -1 ? ['LIG','DES'] : ['DES','LIG']
            menuOptions[menuType][i].text = menuOptions[menuType][i].text.replace(changeText[0], changeText[1]);
            menuOptions[menuType][i].action = true;
          }
        } else if (menuType === 'ships') {
          menuOptions[menuType][i].outline = i == selectOption[menuType] ? true : false;
          if (!direction[dimension] && i == selectOption[menuType]) {
            // Mudar o sprite da nave padrão
            changeDefenderSprite(menuOptions[menuType][i]);
          }
        }
      }
    }
  }
  function changeDefenderSprite(newDefender) {
    for (var key in defaultDefender) {
      defaultDefender[key] = newDefender[key];
      defender[key] = newDefender[key];
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
      case UP:
        mvUp = true;
        direction = [-1,-1];
        e.preventDefault();
        break;
      case DOWN:
        mvDown = true;
        direction = [1,1];
        e.preventDefault();
        break;
      case ENTER:
        direction = [0,0];
        e.preventDefault();
        if (isStart) {
          isStart = false;
        }
        break;
      case BACKSPACE:
      case ESC:
        e.preventDefault();
        if (menuType !== 'default' && !isStart) {
          confirmESC = false;
          menuType = 'default';
        } else {
          confirmESC = true;
        }
        if (isStart) {
          isStart = false;
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
      case UP:
        mvUp = false;
        e.preventDefault();
        break;
      case DOWN:
        mvDown = false;
        e.preventDefault();
        break;
      case ENTER:
        if(gameState !== OVER){
          if (startMessage.visible) {
            gameState = PLAYING;
            isStart = false;
            startMessage.visible = false;
            requestAnimationFrame(drawImagePattern);
          } else {
            if (gameState === PLAYING) {
              gameState = PAUSED;
              menuType = 'default';
              isMenu = true;
            } else if (gameState === PAUSED && isStart) {
              isStart = false;
              gameState = PLAYING;
              requestAnimationFrame(drawImagePattern);
            }
          }
        }
        break;
      case BACKSPACE:
      case ESC:
        if(gameState !== OVER){
          if(gameState !== PLAYING && confirmESC){
            gameState = PLAYING;
            requestAnimationFrame(drawImagePattern);
            isMenu = false;
            startMessage.visible = false;
            pausedMessage.visible = false;
          } else {
            gameState = PAUSED;
            menuType = 'default';
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

  
    cnv.addEventListener('touchstart',function(e){
      if (e.touches[0].pageY < 150) {
        if (gameState !== OVER){
          if (startMessage.visible || gameState !== PLAYING) {
            gameState = PLAYING;
            isStart = false;
            startMessage.visible = false;
            requestAnimationFrame(drawImagePattern);
          } else {
            if (gameState === PLAYING) {
              gameState = PAUSED;
              menuType = 'touch';
              isMenu = true;
            } else if (gameState === PAUSED && isStart) {
              isStart = false;
              gameState = PLAYING;
              requestAnimationFrame(drawImagePattern);
            }
          }
        }
      }
      if (gameState === PAUSED) {
        if(gameState !== OVER){
          if (startMessage.visible) {
            gameState = PLAYING;
            isStart = false;
            startMessage.visible = false;
            requestAnimationFrame(drawImagePattern);
          } else {
            if (gameState === PLAYING) {
              gameState = PAUSED;
              menuType = 'default';
              isMenu = true;
            } else if (gameState === PAUSED && isStart) {
              isStart = false;
              gameState = PLAYING;
              requestAnimationFrame(drawImagePattern);
            }
          }
        }
      }
    },false);

    cnv.addEventListener('touchmove',function(e){
      var touchShip = true;
      if (gameState === PLAYING && touchShip) {
        touchMoveSprite(e.touches,defender);
        shootCount++;
        if (shootCount > 50) {
          fireMissile(missileType);
          shootCount = 0;
        }
      }
    },false);

    function touchMoveSprite(touches_,sprite_) {
      // Setar X do sprite
      newX = touches_[0].pageX - sprite_.width;
      if (newX < sprite_.width) {
        newX = 0;
      }
      if (newX > cnv.width - sprite_.width) {
        newX = cnv.width - sprite_.width;
      }
      sprite_.x = newX;
      // Setar Y do sprite
      newY = touches_[0].pageY - sprite_.height;
      if (newY < sprite_.height) {
        newY = 0;
      }
      if (newY > cnv.height - sprite_.height) {
        newY = cnv.height - sprite_.height;
      }
      sprite_.y = newY;
    }
  
  //FUNÇÕES =================================================================>
  var stop = false;
  var frameCount = 0;
  var fps, fpsInterval, startTime, now, then, elapsed;

  function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    // animate();
    loop();
  }
  

  function loadHandler(){
    loadedAssets++;
    if(loadedAssets === assetsToLoad.length){
      this.removeEventListener('load',loadHandler,false);
      //inicia o jogo
      gameState = PAUSED;
      setTimeout(function() {
        stopBgAnimation = true;
      }, 1)
    }
  }
  var lastRepaintTime=window.performance.now();
  function drawImagePattern(time){
    if (!stopBgAnimation) {
      lastRepaintTime = time-velocity/2;
      var framegap=time-lastRepaintTime;
      lastRepaintTime=time;
      var translateY=velocity*(framegap/1000);
      ctxBG.clearRect(0,0,cnvBG.width,cnvBG.height);
      var pattern=ctxBG.createPattern(bgImage,"repeat-y");
      ctxBG.fillStyle=pattern;
      ctxBG.rect(0,0,cnvBG.width,cnvBG.height);
      ctxBG.fill();
      ctxBG.translate(0,translateY);
      requestAnimationFrame(drawImagePattern);
    }
  }

  window.mobileAndTabletcheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  }

  function loop(){
    if (stop) return;
    requestAnimationFrame(loop, cnv);

    // calc elapsed time since last loop

    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame

    if (elapsed > fpsInterval) {

      // Get ready for next frame by setting then=now, but...
      // Also, adjust for fpsInterval not being multiple of 16.67
      then = now - (elapsed % fpsInterval);
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
          stopBgAnimation = false;
          update();
          break;
        case OVER:
          stopBgAnimation = true;
          endGame();
          break;
        case PAUSED:
          if (mobileCheck && mobileAndTabletcheck()) {
            console.log('TOUCH');
            isMobile = true;
            mobileCheck = false;
            menuType = 'touch';
          }
          if (!startMessage.visible) {
            extra = 'menu';
            isMenu = true;
            stopBgAnimation = true;
          }
          break;
      }
      if (isStart) {
        isMenu = true;
        extra = 'menu';
        checkNextMenu([0,0]);
      }
      render(extra);
    }
  }

  function update(){
    // move para cima
    if(mvUp && !mvDown){
      defender.vy = mvVertical;
      defender.sourceX = defaultDefender.sourceX;
      defender.sourceY = defaultDefender.sourceY;
    }

    // move para baixo
    if(mvDown && !mvUp){
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
    
    //para os movimentos horizontais da nave
    if(!mvLeft && !mvRight){
      defender.vx = 0;
      defender.sourceX = defaultDefender.sourceX;
    }
    //para os movimentos verticais da nave
    if(!mvUp && !mvDown){
      defender.vy = 0;
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
    
    // atualiza a posição das coordenadas (x, y) da nave no "Canvas"
    defender.x = Math.max(0,Math.min(cnv.width - defender.width, defender.x + defender.vx));
    defender.y = Math.max(0,Math.min(cnv.height - defender.height, defender.y - defender.vy));
    
    //atualiza a posição dos mísseis
    for(var i = missiles.length -1; i >= 0 ; i--){
      var missile = missiles[i];
      missile.y += missile.vy;
      if(missile.y < -missile.height){
        removeObjects(missile,missiles);
        removeObjects(missile,sprites);
      }
      if(i === 0) updateScore();
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
    if(alienTimer >= alienFrequency && alienDestroyCount < 50){
      alienTimer = 0;
      if (MiniBossFrequency >= 0) {
        MiniBossFrequency++;
      }
      if (MiniBossFrequency >= 8) {
        alienType = 'miniboss';
        BossFrequency++;
        MiniBossFrequency = 0;
      }
      if (BossFrequency >= 4) {
        alienType = 'boss';
        MiniBossFrequency = -1;
        BossFrequency = -1;
      }
      makeAlien(alienType);
      //ajuste na frequência de criação de aliens
      // if(alienFrequency > 2){
      //   alienFrequency--;
      // }
    }
    function fadeShip(ship) {
      if (ship.fade && ship.opacity < 0.75) {
        ship.opacity = ship.realOpacity;
        ship.fade = false;
      }
    }
    //move os aliens
    for(var i in aliens){
      var alien = aliens[i];
      if(alien.state !== alien.EXPLODED){
        alien.y += alien.vy;
        // gerar tiros do alien
        if (typeof shootAlien[alien.index] === 'undefined') {
          shootAlien[alien.index] = 0;
        }
        shootAlien[alien.index]++;
        if (shootAlien[alien.index] >= 90) {
          fireMissile('default',alien);
          shootAlien[alien.index] = 0;
        }
        // fazer efeito ao receber tiro
        fadeShip(alien);
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
        if(statusData.earth.life <= statusData.earth.count){
          gameState = OVER;
        }
      }

      //confere se algum alien colidiu com a nave
      if(alien.spriteType !== 'explosion' && collide(alien,defender)){
        statusData.spaceship.count += statusData.spaceship.life;
        destroyAlien(alien);
        if (statusData.spaceship.life <= statusData.spaceship.count) {
          removeObjects(defender,sprites);
          gameState = OVER;
        }
      }
      
      //confere se algum alien foi destruido
      for(var j in missiles){
        var missile = missiles[j];
        if (alien.state !== alien.EXPLODED) {
          if(missile.origin === 'defender' && collide(missile,alien)) {
            var missilePower = isMobile ? missile.power * 3.1 : missile.power;
            alien.life = alien.life - missilePower;
            if (alien.life <= 0) {
              alienDestroyCount+=alien.originalLife/3;
              if (alien.type === 'boss' && aliensCountToWin - alienDestroyCount <= 0) {
                BossFrequency = -2;
                gameState = OVER;
                gameStatus = 'win';
              }
              destroyAlien(alien);
            } else {
              alien.fade = true;
            }
            // contador de tiros
            hits++;
            //// Contador de tiros para acabar com o jogo foi RETIRADO
            //// Verificar função checkEndGame()
            removeObjects(missile,missiles);
            removeObjects(missile,sprites);
            j--;
          }
          
            if (missile.origin === 'alien' && collide(missile,defender)) {
              if (defender.status !== 'invulnerable') {
                statusData.spaceship.count += 1;
                defender.status = 'invulnerable';
                defender.fade = true;
                invencibleStatusCount = 1;
                updateScore();
              }
              removeObjects(missile,missiles);
              removeObjects(missile,sprites);
              j--;
            }

        }
      }
    }//fim da movimentação dos aliens
    
    // Adicionado modo invencível logo
    // apos ser atingido por um tiro (handicap)
    if (invencibleStatusCount) {
      invencibleStatusCount++;
      fadeShip(defender);
      if (invencibleStatusCount >= 300) {
        invencibleStatusCount = 0;
        defender.status = 'default';
      }
    }

    function checkEndGame() {
      // Verifica se a quantidade de aliens abatidos é igual
      // a quantidade de aliens necessária para vencer
      if (alienDestroyCount >= aliensCountToWin) {
        gameState = OVER;
        gameStatus = 'win';
        for(var k in aliens){
          var alienk = aliens[k];
          destroyAlien(alienk);
        }
      }
      if (statusData.earth.count >= statusData.earth.life || statusData.spaceship.count >= statusData.spaceship.life) {
        gameState = OVER;
        gameStatus = 'lose';
      }
      
    }
    checkEndGame();
    
    for (var i in powerUps) {
      var powerUp = powerUps[i];
      //confere se a nave pegou algum powerUp
      if(collide(powerUp,defender)){
        absorvPowerUp(powerUp);
      }

      if(powerUp.y > cnv.height + powerUp.height || powerUpFrequency > 120){
        removeObjects(powerUp,powerUps);
        removeObjects(powerUp,sprites);
      }
    }//fim da movimentação dos aliens
  }//fim do update


  //criação dos mísseis
  function fireMissile(shootType,ship){
    if (!enableFireMissile) return false;
    var ship = ship || defender;
    if (ship.spriteType === 'defender') {
      var shootType = shootType || 'default';
      if(shootType === 'default'){
        var missile = new Missile(150,0,8,25,defender.centerX() - 4,defender.y - 13);
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
    } else if (ship.spriteType === 'alien'){
      var missile = new Missile(150,25,8,25,ship.centerX() - 4,ship.y - 13);
      missile.vy = 8;
      missile.power = 1;
      missile.origin = 'alien';
      sprites.push(missile);
      missiles.push(missile);
      playSound(FIRE, toggleSound);
      shots++;
    }
  }
  
  //criação de aliens
  function makeAlien(alienType_){
    if (!enableAlienCreation) return false;
    var alienT = alienType_ || 'default';
    alienCount++;
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
      alien.originalLife = 9;
      alienType = 'default';
    } else if (alienT === 'boss') {
      var alienSourceX = alienTypesListIndexes[Math.floor(Math.random() * 4)]*50;
      alien.sourceX = alienSourceX;
      alien.sourceY = 50;
      alien.height = 50;
      alien.width = 50;
      alien.originalLife = menuType === 30;
      alien.realOpacity = .5;
      alienType = 'default';
      // if (alienDestroyCount >= 45) {
      //   enableAlienCreation = false;
      // }
    }
    alien.life = alien.originalLife;
    alien.opacity = alien.realOpacity;
    alien.type = alienT;
    alien.vy = 1;
    alien.index = alienCount;
    
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
    //calculo do aproveitamento
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
    var missingAliens = statusData.earth.life - statusData.earth.count;
    if (missingAliens < 0) missingAliens = 0;
    var shipLife = statusData.spaceship.life - statusData.spaceship.count;
    if (shipLife < 0) shipLife = 0;
    var alienHits = aliensCountToWin - alienDestroyCount;
    if (alienHits < 0) alienHits = 0;
    if (missingAliens === 3 && shipLife === 3) {
      scoreMessage.color = GREEN;
    } else if (missingAliens >= 2 && shipLife >= 2) {
      scoreMessage.color = YELLOW;
    } else {
      scoreMessage.color = RED;
    }
    scoreMessage.text = "VIDA: " + (shipLife).toString();
    scoreMessage.text+= "               ESCUDO: " + (missingAliens).toString();
    scoreMessageExtra.text = "- ALIENS: " + (alienHits).toString() + " - ";
  }
  
  //função de game over
  function endGame(){
    updateScore();
    if(gameStatus === 'win'){
      gameOverMessage.text = "TERRA SALVA!";
      gameOverMessage.color = BLUE;
      if (BossFrequency === -2) {
        gameOverMessage.text = "CHEFAO DESTRUIDO!";
        gameOverMessage.color = GREEN;
      }
    } else {
      if(statusData.earth.life <= statusData.earth.count) {
        gameOverMessage.text = "TERRA DESTRUIDA!";
      } else {
        gameOverMessage.text = "NAVE DESTRUIDA!";
      }
      // if (bossStatus === -1) {
      //   gameOverMessage.text = "CHEFAO DESTRUIU A TERRA!";  
      // }
    }
    gameOverMessage.visible = true;
    // recarrega a página inteira usando o comando: `location.reaload();`
    // utilizando a função `setTimeout()` que depois determinado tempo
    // executará a função, nesse caso 3000ms
    // variavel `refreshPage` adicionada
    // para evitar conflito com vários `setTimeout` sendo chamados
    if (!refreshPage) {
      setTimeout(function(){
        refreshPage = true;
        location.reload();
      },3000);  
    }
    
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
        document.getElementsByTagName("body")[0].insertAdjacentHTML('beforeend','<audio id="musicTheme" src="sound/music.ogg" type="audio/mpeg" loop autoplay></audio>');
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
    } else if (layoutType === 'about' || layoutType === 'ships' || layoutType === 'info' || layoutType === 'touch') {
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
      var aboutMessages = [
        {y:newMenuY+20, text:"COLABORADORES", color:"#EEE", align:false, x:0, font:"12px emulogic"},
        {y:newMenuY+65, text:"BRUNA LIMA", color:"#EEE", align:'left', x:newMenuX+25, font:"12px emulogic"},
        {y:newMenuY+105, text:"PAULO MELO", color:"#EEE", align:'left', x:newMenuX+25, font:"12px emulogic"},
        {y:newMenuY+145, text:"YAGO ALVES", color:"#EEE", align:'left', x:newMenuX+25, font:"12px emulogic"}
      ];
      pushTextObjToArray(aboutMessages,loopMessages);
    } else if (MenuType === 'info') {
      // adicionando conteúdo na janela
      var messageFont = "8px emulogic";
      var messageAlign = "left";
      var infoMessages = [
        {x:false,y:newMenuY+20,textAlign: false,
          text:"INFO",color: "#EEE",font: false},
        {x:newMenuX+25,y:newMenuY+50,textAlign: messageAlign,
          text:"- Mover: setas",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+60,textAlign: messageAlign,
          text:"  Atirar: Barra de espaco",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+70,textAlign: messageAlign,
          text:"  Menu: ESC ou ENTER",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+90,textAlign: messageAlign,
          text:"- ESCUDO: aliens que",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+100,textAlign: messageAlign,
          text:"  a terra suporta.",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+120,textAlign: messageAlign,
          text:"- VIDA: tiros que",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+130,textAlign: messageAlign,
          text:"  a nave suporta.",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+155,textAlign: messageAlign,
          text:"* (S) vermelho - ESPECIAL",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+165,textAlign: messageAlign,
          text:"  modifica o tiro.",color: "#EEE",font: messageFont}
      ];
      pushTextObjToArray(infoMessages,loopMessages);
    } else if (MenuType === 'touch') {
      // adicionando conteúdo na janela
      var messageFont = "8px emulogic";
      var messageAlign = "left";
      var infoMessages = [
        {x:false,y:newMenuY+20,textAlign: false,
          text:"TOUCH INFO",color: "#EEE",font: false},
        {x:newMenuX+25,y:newMenuY+50,textAlign: messageAlign,
          text:"- Mova a nave com toque",color: "#EEE",font: messageFont},
        // {x:newMenuX+25,y:newMenuY+60,textAlign: messageAlign,
        //   text:"- Aperte no MENU",color: "#EEE",font: messageFont},
        // {x:newMenuX+25,y:newMenuY+70,textAlign: messageAlign,
        //   text:"  para mutar ou desmutar",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+70,textAlign: messageAlign,
          text:"- ESCUDO: aliens que",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+80,textAlign: messageAlign,
          text:"  a terra suporta.",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+100,textAlign: messageAlign,
          text:"- VIDA: tiros que",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+110,textAlign: messageAlign,
          text:"  a nave suporta.",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+135,textAlign: messageAlign,
          text:"* (S) vermelho - ESPECIAL",color: "#EEE",font: messageFont},
        {x:newMenuX+25,y:newMenuY+145,textAlign: messageAlign,
          text:"  modifica o tiro.",color: "#EEE",font: messageFont}
      ];
      pushTextObjToArray(infoMessages,loopMessages);
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
          case 'info':
            menuType = 'info';
            break;
          case 'touch':
            menuType = 'touch';
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
        ctx.fillStyle = "#333";
        ctx.fillRect(spr.x,spr.y,spr.width,spr.height);
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
          // preencherTela(spr.img);
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

  // loop();
  startAnimating(fps);
}());
