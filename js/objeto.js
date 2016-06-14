// Lidar com as imagens da seguinte maneira :
// sourceX  => pixel inicial da imagem mais a esquerda
// sourceY  => pixel inicial da imagem mais perto do topo
// width    => largura da imagem desejada
// height   => altura da imagem desejada
// x        => posição mais a esquerda onde será colocada a imagem na tela do jogo "canvas"
// y        => posição mais perto do topo onde será colocada a imagem na tela do jogo "canvas"
var Sprite = function(sourceX,sourceY,width,height,x,y){
  this.sourceX = sourceX;
  this.sourceY = sourceY;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 0;
  // Aumentar a imagem proporcionalmente
  this.ratioX = 1;
  this.ratioY = 1;
  // Opacidade da imagem
  this.opacity = 1;
  // Opacidade conforme o tempo passa
  this.fade = false;
  // Configurar uma imagem
  this.img = '';
  this.spriteType = 'default';
  this.count = 0;
  // Configurar outline
  this.outline = '';
  // Configurar outline
  this.sourceXRight = 0;
  this.sourceYRight = 0;
  this.sourceXLeft = 0;
  this.sourceYLeft = 0;
}

Sprite.prototype.centerX = function(){
  return this.x + (this.width/2);
}

Sprite.prototype.centerY = function(){
  return this.y + (this.height/2);
}

Sprite.prototype.halfWidth = function(){
  return this.width/2;
}

Sprite.prototype.halfHeight = function(){
  return this.height/2;
}

var Alien = function(sourceX,sourceY,width,height,x,y){
  //dispara o construtor do Sprite
  Sprite.call(this,sourceX,sourceY,width,height,x,y);
  this.NORMAL = 1;
  this.EXPLODED = 2;
  this.CRAZY = 3;
  this.type = 'minion';
  this.spriteType = 'alien';
  this.life = 3;
  this.state = this.NORMAL;
  this.mvStyle = this.NORMAL;
}

var PowerUp = function(sourceX,sourceY,width,height,x,y){
  //dispara o construtor do Sprite
  Sprite.call(this,sourceX,sourceY,width,height,x,y);
  this.type = 'default';
}

var Missile = function(sourceX,sourceY,width,height,x,y){
  //dispara o construtor do Sprite
  Sprite.call(this,sourceX,sourceY,width,height,x,y);
  this.power = 1;
}

// garante que os "Objetos" criados tenham as mesmas propriedades do objeto "Sprite"
Alien.prototype = Object.create(Sprite.prototype);
PowerUp.prototype = Object.create(Sprite.prototype);
Missile.prototype = Object.create(Sprite.prototype);

Alien.prototype.explode = function(){
  this.spriteType = 'explosion';
  this.sourceY = 50;
}

var ObjectMessage = function(y,text,color){
  this.x = 0;
  this.y = y;
  this.text = text;
  this.visible = true;
  this.font = "normal bold 20px emulogic";
  this.color = color;
  this.baseline = "top";
  this.textAlign = "center";
  this.action = false;
  this.actionType = 'text';
}








