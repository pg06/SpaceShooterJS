var winW = Math.max(window.screen.width, window.innerWidth, window.outerWidth) || 360;
var winH = Math.max(window.screen.height, window.innerHeight, window.outerHeight) || 640;
var resetBtn = document.querySelector("a.reset");
var pauseBtn = document.querySelector("a.pause");
var initGame = false;
var game = new Phaser.Game(winW, winH, Phaser.CANVAS, 'phaser', { 
    preload: preload,
    create: create,
    update: update,
    render: render
});

window.mobileAndTabletcheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

function preload() {
    game.load.bitmapFont('emulogic', '../font/emulogic.png', '../font/emulogic.xml');
    // game preloading
    game.load.image('space', 'img/background.png');
    game.load.spritesheet('bullet', 'img/missiles.png', 8, 26);
    game.load.spritesheet('alienbullet', 'img/missiles2.png', 9, 31);
    game.load.spritesheet('explosion', 'img/explosion.png', 39, 38);
    game.load.atlas('defender', 'img/defender1.png', 'img/defender1.json');
    game.load.atlas('alien', 'img/alien_minions.png', 'img/alien_minions.json');
    game.load.atlas('alienbosses', 'img/alien_bosses.png', 'img/alien_bosses.json');
    // game.load.image('pauseicon', 'img/pause_icon.png');

}

var sprite;
var weapon;
var cursors;
var fireButton;
var pauseButton;

var aliens;
var alienBosses;
var bullets;
var bulletTime = 0;
var explosions;
var score = 0;
var maxScore = 0;
var scoreString = '';
var liveString = '';
var scoreText;
var liveText;
var lives;
var checkEndGame = false;

var enemyBullets;
var firingTimer = 0;
var firingRate = 1000;
var firingRateInc = 1;
var stateText;
var livingEnemies = [];

var pauseText, pauseString;
var menuHeight = game.height/2;
var menuWidth = game.width/2;
var menuX = (game.width-menuWidth)/2;
var menuY = (game.height-menuHeight)/2;
var optionX, optionY;
var touchCache;
var crazyAlien = {};

var goingDown = {};
var pauseStop = false;
var screenMovementSpeed = 1;
var touchCache = {x: -1, y: -1};

var isMobile = false;



var debug = false;
// FUNCOES DO JOGO
var inGame = {
    pause: function() {
        if (!pauseString || pauseString === 'continue') {
            var newMenuY = (game.height/2);
            var newMenuX = pauseString ? game.world.width/2-65 : (!isMobile ? game.world.width/2-135 : game.world.width/2-155);
            pauseString = pauseString ? 'PAUSADO' : 'PRESSIONE ' +  (!isMobile ? 'ENTER' : 'NA TELA');
            pauseText = game.add.text(newMenuX, newMenuY, pauseString, { font: '18px emulogic', fill: '#f00' });
            scoreText.text = scoreString + score.toString();
            scoreText.visible = true;
            // pauseText = game.add.bitmapText(newMenuX,newMenuY, 'emulogic', pauseString, 18);
            // pauseText.tint = 0xFF0000;
            // renderMenuLayout('touch');
        }
        game.paused = true;
        pauseBtn.style.display = 'none';
        if (debug) console.log( 'GAME IS PAUSED!' );
        return;
    },
    unpause: function() {
        pauseString = 'continue';
        pauseText.destroy();

        game.paused = false;
        pauseBtn.style.display = 'block';
        if (debug) console.log( 'GAME IS UNPAUSED!' );
        return;
    },
    initgame: function () {
        if (initGame) return;
        initGame = true;
        this.pause();
        pauseString = '';
        checkEndGame = false;
        stateText.visible = true;
        pauseBtn.style.display = 'block';
        if (debug) console.log( 'GAME INITIALIZED!' );
        return;
    },
    startgame: function () {
        this.unpause();
        stateText.visible = false;
        checkEndGame = false;
        if (debug) console.log( 'GAME STARTED!' );
        return;
    },
    endgame: function () {
        this.pause();
        checkEndGame = true;
        stateText.visible = true;
        if (debug) console.log( 'GAME STARTED!' );
        return;
    },
    reset: function () {
        this.resetScore();
        this.resetPlayer();
        
        this.pause();
        checkEndGame = false;
        stateText.visible = false;
        resetBtn.style.display = resetBtn.style.display === 'none' ? 'block' : 'none';
        this.resetEnemy();
        this.unpause();
        if (debug) console.log( 'GAME RESETED!' );
        return;
    },
    resetScore: function () {
        if (score && scoreString && scoreText) {
            score = 0;
            scoreText.text = scoreString + score; // Zerar placar
        }
        if (debug) console.log( 'SCORE RESETED!' );
        return;
    },
    resetLives: function () {
        if (lives && liveString && liveText) {
            lives.callAll('kill');
            lives.callAll('revive');
            liveText.text = liveString + lives.countLiving(); // Zerar vidas
        }
        if (debug) console.log( 'LIVES RESTORED!' );
        return;
    },
    resetEnemyFireRate: function() {
        firingRate = 500;
        firingRateInc = 1;
        if (debug) console.log( 'ENEMY FIRE RATE RESETED!' );
        return;
    },
    resetPlayerPosition: function() {
        defender.x = game.world.width/2;
        defender.y = game.world.height - defender.height;
        if (debug) console.log( 'PLAYER POSITION RESETED!' );
        return;
    },
    resetPlayer: function() {
        weapon.callAll('kill');
        this.resetLives();
        this.resetPlayerPosition();
        defender.revive();
        if (debug) console.log( 'PLAYER RESETED!' );
        return;
    },
    resetEnemy: function() {
        enemyBullets.callAll('kill');
        aliens.removeAll(true);
        this.resetEnemyFireRate();
        this.makeAliens();
        if (debug) console.log( 'ENEMY REVIVED!' );
        return;
    },
    makeAliens: function() {
        var vx = 0, vy = 0;
        for (var y = 0; y < 16; y++)
        {
            if (y && !(y % 4)) {
                vy += 50;
                vx = 0;
            }
            
            var alien = aliens.create(vx, vy, 'alien', 'alien0000');
            alien.frameName = 'alien000'+(Math.floor(Math.random() * 4)).toString();
            alien.anchor.setTo(0.5, 0.5);
            // alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            // alien.play('fly');
            alien.body.moves = true;

            vx += 50;
        }
        
        // var i = 0;
        // for (var y = 0; y < 3; y++)
        // {
        //     for (var x = 0; x < 5; x++)
        //     {
        //         var alien = aliens.create(x * 50, y * 50, 'alien', 'alien0000');
        //         // var alienPosition = (Math.floor(Math.random() * 8)) * 50;
        //         // var alien = aliens.create(alienPosition, -75, 'alien', 'alien0000');
        //         // crazyAlien[i] = {vx: 1, vy: 1, state: false};
        //         // if(Math.floor(Math.random() * 11) > 7){
        //         //     crazyAlien[i].state = true;
        //         //     crazyAlien[i].vx = 2;
        //         // }
                
        //         // if(Math.floor(Math.random() * 11) > 5){
        //         //     crazyAlien[i].vy = 2;
        //         // }
        //         // mudar o sprite dos aliens
        //         alien.frameName = 'alien000'+(Math.floor(Math.random() * 4)).toString();
        //         alien.anchor.setTo(0.5, 0.5);
        //         // alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
        //         // alien.play('fly');
        //         alien.body.moves = true;
        //         i++;
        //     }
        // }

        aliens.x = 50;
        aliens.y = 50;

        //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
        var tween = game.add.tween(aliens).to( { x: game.world.width - aliens.width }, 2000, Phaser.Easing.Linear.None, true, 0, 10, true);

        //  When the tween loops it calls descend
        tween.onLoop.add(descend, this);
    }
};



function create() {
    if (mobileAndTabletcheck()) {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        isMobile = true;
    }
    game.physics.startSystem(Phaser.Physics.ARCADE);

    spacefield = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'space');
    // pauseIcon = game.add.tileSprite(game.world.width - 50, 10, 32, 32, 'pauseicon');

    resetBtn.style.top = game.world.centerY+125+"px";
    resetBtn.style.left = game.world.centerX-85+"px";

    //  Create game poointer
    game.input.addPointer();

    //  Criar minions
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    //  Criar Bosses
    // alienBosses = game.add.group();
    // alienBosses.enableBody = true;
    // alienBosses.physicsBodyType = Phaser.Physics.ARCADE;

    inGame.makeAliens();

    //  Criar jogador
    defender = this.add.sprite(game.width/2, game.world.height, 'defender', 'defender0000');
    defender.y -= defender.height;
    defender.anchor.setTo(0.5, 0.5);
    defender.checkWorldBounds = true;

    //  ---- Placar ----
    // shield = 3;
    // shieldString = 'Escudo: ';
    // shieldText = game.add.text(game.world.width - 120, 10, shieldString + shield, { font: '12px emulogic', fill: '#0f0' });
    // life = 3;
    // shieldString = 'Vida: ';
    // shieldText = game.add.text(10, 10, shieldString + shield, { font: '12px emulogic', fill: '#0f0' });

    //  The score
    scoreString = 'Score: ';
    scoreText = game.add.text(10, 10,  ' ',{ font: '12px emulogic', fill: '#0F0'});
    // scoreText = game.add.bitmapText(10, 10, 'emulogic', scoreString + score.toString(), 12);
    // scoreText.tint = 0x00FF00;
    scoreText.visible = false;

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY, ' ',{ font: '20px emulogic', fill: '#FFF'});
    // stateText = game.add.bitmapText(game.world.centerX,game.world.centerY, 'emulogic', ' ', 20);
    // stateText.tint = 0xFFFFFF;
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    lives = game.add.group();
    for (var i = 0; i < 1; i++) 
    {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'defender');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 90;
        ship.alpha = 0; // 0.4
    }
    
    //  Lives
    liveString = 'Vidas: ';
    liveText = game.add.text(170, 10, liveString + lives.countLiving(), { font: '12px emulogic', fill: '#0f0' });
    liveText.visible = false;


    game.physics.arcade.enable(defender);

    // defender.animations.add('fly', [ 0, 1, 2 ], 20, true);

    //  Creates 30 bullets, using the 'bullet' graphic
    // weapon = game.add.weapon(30, 'bullet');
    //  The bullet will be automatically killed when it leaves the world bounds
    // weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    //  Because our bullet is drawn facing up, we need to offset its rotation:
    // weapon.bulletAngleOffset = 90;
    //  The speed at which the bullet is fired
    // weapon.bulletSpeed = 400;
    //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
    // weapon.fireRate = 120;
    //  Tell the Weapon to track the 'player' Sprite, offset by 0 horizontally, 0 vertically
    // weapon.trackSprite(defender, 0, -3*defender.height/4);

    weapon = game.add.group();
    weapon.enableBody = true;
    weapon.physicsBodyType = Phaser.Physics.ARCADE;
    weapon.createMultiple(30, 'bullet');
    weapon.setAll('anchor.x', 0.5);
    weapon.setAll('anchor.y', 1);
    weapon.setAll('outOfBoundsKill', true);
    weapon.setAll('checkWorldBounds', true);

    
    cursors = this.input.keyboard.createCursorKeys();
    fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    pauseButton = {
        ESC: this.input.keyboard.addKey(Phaser.KeyCode.ESC),
        ENTER: this.input.keyboard.addKey(Phaser.KeyCode.ENTER)
    }
    game.paused = true;

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'alienbullet');
    enemyBullets.setAll('anchor.x', 0);
    enemyBullets.setAll('anchor.y', 0);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'explosion');
    explosions.forEach(setupInvader, this);
    optionX = game.world.width - 50;
    optionY = 50;
}



function setupInvader (invader) {

    // invader.anchor.x = 0.5;
    // invader.anchor.y = 0.5;
    invader.animations.add('explosion');

}

function checkInputOption() {
    var newX = game.input.pointer1.x;
    var newY = game.input.pointer1.y;
    return newX > optionX && newY < optionY;
}


function update() {
    if (defender.alive)
    {
        // moveAliens();
        // mover o fundo da tela

        // parar a nave a cada update
        defender.body.velocity.setTo(0, 0);

        if (!game.input.pointer1.isDown.active || game.input.pointer1.isUp) {
            defender.frameName = 'defender0000';
        }

        var inputPointerIsDown = false;
        spacefield.tilePosition.y += screenMovementSpeed;
        keyboardMovement();

        // mover a nave no toque da tela
        // console.log('X: '+touchCache.x+' newX:'+game.input.activePointer.x);
        var touchLimit = game.input.pointer1.y > 100;
        var optionCoord = checkInputOption();
        if (game.input.pointer1.isDown && !optionCoord && touchLimit)
        {
            var newX = game.input.pointer1.x;
            var newY = game.input.pointer1.y;
            if (game.input.pointer1.x + defender.body.width/2 >= game.width) {
                newX = game.width;
            } else if (game.input.pointer1.x - defender.body.width/2 <= 0) {
                newX = 0;
            }
            if (game.input.pointer1.y + defender.body.height/2 >= game.height) {
                newY = game.heigth;
            } else if (game.input.pointer1.y - defender.body.height/2 <= 0) {
                newY = 0;
            }

            defender.x = newX;
            defender.y = newY;

            if (touchCache.x > -1 && touchCache.y > -1) {
                if (false && touchCache.x <= game.input.activePointer.x+1 && touchCache.x >= game.input.activePointer.x-1) {
                } else if (touchCache.x > game.input.activePointer.x) {
                    // move left
                    spacefield.tilePosition.x += screenMovementSpeed + 1;
                    defender.frameName = 'defender0001';
                } else if (touchCache.x < game.input.activePointer.x) {
                    // move right
                    spacefield.tilePosition.x -= screenMovementSpeed + 1;
                    defender.frameName = 'defender0002';
                } else {
                    // defender.frameName = 'defender0000';
                }

                if (false && touchCache.y <= game.input.activePointer.y+1 && touchCache.y >= game.input.activePointer.y-1) {
                } else if (touchCache.y > game.input.activePointer.y) {
                    // move up
                    spacefield.tilePosition.y += screenMovementSpeed + 1;
                } else if (touchCache.y < game.input.activePointer.y) {
                    // move down
                    spacefield.tilePosition.y -= screenMovementSpeed + 1;
                }
            }
            inputPointerIsDown = true;
        }
        if (!defender.y) defender.y = game.world.height - defender.height/2;
        else if (defender.y >= game.world.height) defender.y = game.world.height;
        else if (defender.y <= 0) defender.y = 0;
        // atirar quando a barra for pressionada ou a tela for pressionada
        if (fireButton.isDown || inputPointerIsDown) fireBullet();
        if (game.time.now > firingTimer)
        {
            if ((game.world.width >= defender.x && defender.x >= 0) && (game.world.height >= defender.y && defender.x >= 0)) {
                enemyFires();
            }
        }
        game.physics.arcade.overlap(weapon, aliens, collisionHandler, null, this);
        game.physics.arcade.overlap(enemyBullets, defender, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(aliens, defender, enemyHitsPlayer, null, this);
    }
    touchCache.x = game.input.activePointer.x;
    touchCache.y = game.input.activePointer.y;
}


function render() {
    inGame.initgame();
}

function descend() {
    aliens.y += 50;
}


// FUNCOES NAO FINALIZADAS 
function keyboardMovement() {
    // mover horizontalmente
    if (cursors.left.isDown) {
        defender.frameName = 'defender0001';
        spacefield.tilePosition.x += screenMovementSpeed + 1;
        defender.body.velocity.x = -200;
    }
    else if (cursors.right.isDown) {
        defender.frameName = 'defender0002';
        spacefield.tilePosition.x -= screenMovementSpeed + 1;
        defender.body.velocity.x = 200;
    }

    // mover verticalmente
    if (cursors.up.isDown) {
        defender.body.velocity.y = -200;
        spacefield.tilePosition.y += screenMovementSpeed + 1;
    } else if (cursors.down.isDown) {
        defender.body.velocity.y = 200;
        // spacefield.tilePosition.y -= screenMovementSpeed - 1;
    }
}


function collisionHandler (bullet, alien) {

    //  Matar o alien e o 'tiro'
    bullet.kill();
    alien.kill();

    //  Atualizar o placar
    score += 1;
    scoreText.text = scoreString + score;

    //  Renderizar a explosao
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('explosion', 30, false, true);

    if (aliens.countLiving() === 0)
    {
        explosions.callAll('kill');
        // score += 1 * firingRate; // score especial
        firingRate -= 20;
        firingRateInc += 1;
        scoreText.text = scoreString + score;

        enemyBullets.callAll('kill',this);
        stateText.visible = false;
        weapon.callAll('kill');
        // next level
        inGame.resetEnemy();

        //the "click to restart" handler
        // game.input.onTap.addOnce(restart,this);
    }

}


function enemyHitsPlayer (player,bullet) {
    bullet.kill();

    // Matar o jogador ao bater no alien
    if (bullet.key === 'alien') lives.callAll('kill')
    
    live = lives.getFirstAlive();

    if (live) live.kill(); // Tirar 1 vida

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('explosion', 30, false, true);

    liveText.text = "Vida: " + lives.countLiving(); // atualizar placar de vidas
    // When the player dies
    if (lives.countLiving() < 1)
    {
        explosions.callAll('kill');
        player.kill();
        enemyBullets.callAll('kill');
        weapon.callAll('kill');
        game.paused = true;
        checkEndGame = true;

        maxScore = score > maxScore ? score : maxScore;
        stateText.text = "NAVE DESTRUIDA!\n\n\n\nSCORE: "+score+"\nMAX SCORE: "+maxScore;
        stateText.visible = true;
        pauseBtn.style.display = 'none';
        resetBtn.style.display = 'block';
    }

}


function enemyFires () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

        // put every living enemy in an array
        livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);
        
        game.physics.arcade.moveToObject(enemyBullet,defender,120);
        firingTimer = game.time.now + (firingRate/firingRateInc);
    }
}


function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = weapon.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.reset(defender.x, defender.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }

}








// FUNCOES NAO USADAS
function moveAliens() {
    for (var i in aliens.children)
    {
        if (!(i in goingDown)) {goingDown[i] = true;}
        var alien = aliens.children[i];
        var alienStatus = crazyAlien[i];
        if (alienStatus.state) {
            if (alien.x > game.world.width - alien.width || alien.x < 0){
                alienStatus.vx *= -1;
            }
            alien.x += alienStatus.vx;
        }

        if (alien.y > 200 || !goingDown[i]) {
            goingDown[i] = false;
            alienStatus.vy = -Math.abs(alienStatus.vy);
        } else if (alien.y < 20) {
            goingDown[i] = true;
            alienStatus.vy = Math.abs(alienStatus.vy);
        }
        alien.y += alienStatus.vy;
    }
}


function checkTapPause() {
    checkTouchOption = game.paused ? true : checkInputOption();
    pauseStop = checkTouchOption || (pauseString && pauseString.indexOf('PRESSIONE') >-1);
}


function handlePause() {
    if (checkEndGame) return;
    if (pauseButton.ESC.isDown || pauseButton.ENTER.isDown || pauseStop) {
        pauseStop = false;
        game.input.pointer1.onTap = false;
        pauseButton.ESC.isDown = false;
        pauseButton.ENTER.isDown = false;
        game.paused = !game.paused;
    }

    if (game.paused && (!pauseString || pauseString === 'continue')) {
        var newMenuY = (game.height/2);
        var newMenuX = pauseString ? game.world.width/2-65 : (!isMobile ? game.world.width/2-135 : game.world.width/2-155);
        pauseString = pauseString ? 'PAUSADO' : 'PRESSIONE ' +  (!isMobile ? 'ENTER' : 'NA TELA');
        pauseText = game.add.text(newMenuX, newMenuY, pauseString, { font: '18px emulogic', fill: '#f00' });
        scoreText.text = scoreString + score.toString();
        scoreText.visible = true;
        // pauseText = game.add.bitmapText(newMenuX,newMenuY, 'emulogic', pauseString, 18);
        // pauseText.tint = 0xFF0000;
        // renderMenuLayout('touch');
    } else if (!game.paused) {
        pauseString = 'continue';
        pauseText.destroy();
        if (ctxMenu && ctxMenu.visible) ctxMenu.destroy();
        for (var i in menuTextList) {menuTextList[i].destroy();}
    }
}


var ctxMenu, menuText, menuString, menuTextList;
function renderMenuLayout(layoutType) {
    if (ctxMenu && ctxMenu.visible) return;

    var newMenuWidth, newMenuHeight, newMenuX, newMenuY;
    function fillMenuCoord(_width,_height) {
        newMenuWidth = _width;
        newMenuHeight = _height;
        newMenuX = (game.width-newMenuWidth)/2;
        newMenuY = (game.height-newMenuHeight)/2;
    }

    ctxMenu = game.add.graphics(0, 0);
    if (layoutType === 'default') {
        fillMenuCoord(66*menuWidth/100, 66*menuHeight/100);
        ctxMenu.beginFill(0x151515);
        ctxMenu.drawRect(newMenuX,newMenuY,newMenuWidth,newMenuHeight);
        fillMenuCoord(60*menuWidth/100, 60*menuHeight/100);
        ctxMenu.beginFill(0xffffff);
        ctxMenu.drawRect(newMenuX,newMenuY,newMenuWidth,newMenuHeight);
        fillMenuCoord(58*menuWidth/100, 58*menuHeight/100);
        ctxMenu.beginFill(0x131313);
        ctxMenu.drawRect(newMenuX,newMenuY,newMenuWidth,newMenuHeight);
    } else if (layoutType === 'about' || layoutType === 'ships' || layoutType === 'info' || layoutType === 'touch') {
        fillMenuCoord(66*menuWidth/100, 66*menuHeight/100);
        ctxMenu.beginFill(0x151515);
        // ctxMenu.lineStyle(2, 0xffffff, 1);
        ctxMenu.drawRect(newMenuX,newMenuY,newMenuWidth,newMenuHeight);
        fillMenuCoord(60*menuWidth/100, 60*menuHeight/100);
        ctxMenu.beginFill(0xffffff);
        ctxMenu.drawRect(newMenuX,newMenuY,newMenuWidth,newMenuHeight);
        fillMenuCoord(58*menuWidth/100, 58*menuHeight/100);
        ctxMenu.beginFill(0x131313);
        ctxMenu.drawRect(newMenuX,newMenuY,newMenuWidth,newMenuHeight);
    }
    menuTextList = [];
    if (layoutType === 'touch') {
        menuString = 'TOUCH INFO';
        menuText = game.add.text(newMenuX + 54, newMenuY + 10, menuString, { font: '12px emulogic', fill: '#FFF' });
        menuTextList.push(menuText);
        menuString = '- Mova a nave com toque';
        menuText = game.add.text(newMenuX + 10, newMenuY + 40, menuString, { font: '8px emulogic', fill: '#FFF' });
        menuTextList.push(menuText);
        menuString = '- ESCUDO: aliens que';
        menuText = game.add.text(newMenuX + 10, newMenuY + 60, menuString, { font: '8px emulogic', fill: '#FFF' });
        menuTextList.push(menuText);
        menuString = '  a terra suporta.';
        menuText = game.add.text(newMenuX + 10, newMenuY + 75, menuString, { font: '8px emulogic', fill: '#FFF' });
        menuTextList.push(menuText);
        menuString = '- VIDA: tiros que';
        menuText = game.add.text(newMenuX + 10, newMenuY + 95, menuString, { font: '8px emulogic', fill: '#FFF' });
        menuTextList.push(menuText);
        menuString = '  a nave suporta.';
        menuText = game.add.text(newMenuX + 10, newMenuY + 110, menuString, { font: '8px emulogic', fill: '#FFF' });
        menuTextList.push(menuText);
        menuString = '* (S) vermelho - ESPECIAL';
        menuText = game.add.text(newMenuX + 10, newMenuY + 135, menuString, { font: '8px emulogic', fill: '#FFF' });
        menuTextList.push(menuText);
        menuString = '  modifica o tiro.';
        menuText = game.add.text(newMenuX + 10, newMenuY + 150, menuString, { font: '8px emulogic', fill: '#FFF' });
        menuTextList.push(menuText);
    }
}


function makeAliens() {
    // if (true) return;
    // if (weapon) weapon.callAll('kill');
    if (enemyBullets) enemyBullets.callAll('revive');
    var i = 0;
    for (var y = 0; y < 3; y++)
    {
        for (var x = 0; x < 5; x++)
        {
            var alien = aliens.create(x * 50, y * 50, 'alien', 'alien0000');
            // var alienPosition = (Math.floor(Math.random() * 8)) * 50;
            // var alien = aliens.create(alienPosition, -75, 'alien', 'alien0000');
            // crazyAlien[i] = {vx: 1, vy: 1, state: false};
            // if(Math.floor(Math.random() * 11) > 7){
            //     crazyAlien[i].state = true;
            //     crazyAlien[i].vx = 2;
            // }
            
            // if(Math.floor(Math.random() * 11) > 5){
            //     crazyAlien[i].vy = 2;
            // }
            // mudar o sprite dos aliens
            alien.frameName = 'alien000'+(Math.floor(Math.random() * 4)).toString();
            alien.anchor.setTo(0.5, 0.5);
            // alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            // alien.play('fly');
            alien.body.moves = true;
            i++;
        }
    }

    aliens.x = 50;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: game.world.width - aliens.width }, 2000, Phaser.Easing.Linear.None, true, 0, 10, true);

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
}