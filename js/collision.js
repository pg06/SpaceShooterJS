function collide(s1, s2){
  var hit = false;

  // Impede de existir colisão quando o sprite for de explosão
  if (s1.spriteType === 'explosion' || s2.spriteType === 'explosion')
    return false;

  //calcula a distância entre o centro dos sprites
  var vetX = s1.centerX() - s2.centerX();
  var vetY = s1.centerY() - s2.centerY();

  //armazenar as somas das metades dos sprites na largura e altura
  var sumHalfWidth = s1.halfWidth() + s2.halfWidth();
  var sumHalfHeight = s1.halfHeight() + s2.halfHeight();

  //verifica se houve colisão
  if(Math.abs(vetX) < sumHalfWidth && Math.abs(vetY) < sumHalfHeight){
    hit = true;
  }

  return hit;
}
