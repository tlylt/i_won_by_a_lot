var ctx = document.getElementById("ctx").getContext("2d");

ctx.font = "30px Arial";
var HEIGHT = 500;
var WIDTH = 500;
var enemyList = {};
var upgradeList = {};
var bulletList = {};

var frameCount = 0;

var score = 0;

var timeWhenGameStarted = Date.now();

var player = {
  name: "YL",
  x: 50,
  spdX: 30,
  y: 40,
  spdY: 50,
  hp: 100,
  width: 20,
  height: 20,
  color: "green",
  atkSpd: 5,
  atkCounter: 0,
  aimAngle: 0,
};

Enemy = function (id, x, y, spdX, spdY, width, height) {
  var enemy = {
    name: "E",
    x: x,
    spdX: spdX,
    y: y,
    spdY: spdY,
    id: id,
    width: width,
    height: height,
    color: "red",
    aimAngle: 0,
    atkSpd: 1,
    attackCounter: 0,
  };
  enemyList[id] = enemy;
};

Upgrade = function (id, x, y, spdX, spdY, width, height, category, color) {
  var asd = {
    name: "E",
    x: x,
    spdX: spdX,
    y: y,
    spdY: spdY,
    id: id,
    width: width,
    height: height,
    color: color,
    category: category,
  };
  upgradeList[id] = asd;
};

Bullet = function (id, x, y, spdX, spdY, width, height) {
  var asd = {
    name: "E",
    x: x,
    spdX: spdX,
    y: y,
    spdY: spdY,
    id: id,
    width: width,
    height: height,
    color: "black",
    timer: 0,
  };
  bulletList[id] = asd;
};

getDistanceBetweenEntity = function (entity1, entity2) {
  var vx = entity1.x - entity2.x;
  var vy = entity1.y - entity2.y;
  return Math.sqrt(vx * vx + vy * vy);
};

// testCollisionEntity = function (entity1, entity2) {
//   var distance = getDistanceBetweenEntity(entity1, entity2);
//   return distance < 30;
// };

testCollisionRectRect = function (rect1, rect2) {
  return (
    rect1.x <= rect2.x + rect2.width &&
    rect2.x <= rect1.x + rect1.width &&
    rect1.y <= rect2.y + rect2.height &&
    rect2.y <= rect1.y + rect1.height
  );
};

testCollisionEntity = function (entity1, entity2) {
  var rect1 = {
    x: entity1.x - entity1.width / 2,
    y: entity1.y - entity1.height / 2,
    width: entity1.width,
    height: entity1.height,
  };

  var rect2 = {
    x: entity2.x - entity2.width / 2,
    y: entity2.y - entity2.height / 2,
    width: entity2.width,
    height: entity2.height,
  };

  return testCollisionRectRect(rect1, rect2);
};

drawEntity = function (entity) {
  ctx.save();
  ctx.fillStyle = entity.color;
  ctx.fillRect(
    entity.x - entity.width / 2,
    entity.y - entity.height / 2,
    entity.width,
    entity.height
  );
  ctx.restore();
};

updateEntityPosition = function (entity) {
  entity.x += entity.spdX;
  entity.y += entity.spdY;

  if (entity.x > WIDTH || entity.x < 0) {
    entity.spdX = -entity.spdX;
  }

  if (entity.y > HEIGHT || entity.y < 0) {
    entity.spdY = -entity.spdY;
  }
};

updateEntity = function (entity) {
  updateEntityPosition(entity);
  drawEntity(entity);
};

updatePlayerPosition = function () {
  if (player.pressingRight) {
    player.x += 10;
  }
  if (player.pressingLeft) {
    player.x -= 10;
  }
  if (player.pressingDown) {
    player.y += 10;
  }
  if (player.pressingUp) {
    player.y -= 10;
  }

  //is position valid
  if (player.x < player.width / 2) {
    player.x = player.width / 2;
  }
  if (player.y < player.height / 2) {
    player.y = player.height / 2;
  }
  if (player.x > WIDTH - player.width / 2) {
    player.x = WIDTH - player.width / 2;
  }
  if (player.y > HEIGHT - player.height / 2) {
    player.y = HEIGHT - player.height / 2;
  }
};

update = function () {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  frameCount++;
  score++;
  player.atkCounter += player.atkSpd;
  if (frameCount % 100 == 0) {
    // add every 4 sec
    randomlyGenerateEnemy();
  }

  if (frameCount % 75 == 0) {
    // add every 3 sec
    randomlyGenerateUpgrade();
  }

  for (var key in upgradeList) {
    updateEntity(upgradeList[key]);

    var isColliding = testCollisionEntity(player, upgradeList[key]);

    if (isColliding) {
      if (upgradeList[key].category === "score") {
        score += 1000;
      }
      if (upgradeList[key].category === "atkSpd") {
        player.atkSpd += 3;
      }
      delete upgradeList[key];
    }
  }

  for (var key in bulletList) {
    updateEntity(bulletList[key]);
    bulletList[key].timer++;
    if (bulletList[key].timer > 100) {
      delete bulletList[key];
      continue;
    }
    for (var key2 in enemyList) {
      var isColliding = testCollisionEntity(bulletList[key], enemyList[key2]);
      if (isColliding) {
        delete bulletList[key];
        delete enemyList[key2];
        break;
      }
    }
  }

  for (var key in enemyList) {
    updateEntity(enemyList[key]);

    var isColliding = testCollisionEntity(player, enemyList[key]);

    if (isColliding) {
      player.hp -= 1;
    }
  }
  if (player.hp <= 0) {
    startNewGame();
  }

  updatePlayerPosition();
  drawEntity(player);
  ctx.fillText("HP: " + player.hp, 0, 30);
  timeSurvived = Date.now() - timeWhenGameStarted;
  ctx.fillText("Score: " + score, 200, 30);
};

startNewGame = function () {
  var timeSurvived = Date.now() - timeWhenGameStarted;
  timeWhenGameStarted = Date.now();
  player.hp = 10;
  frameCount = 0;
  score = 0;
  enemyList = {};
  upgradeList = {};
  bulletList = {};
  randomlyGenerateEnemy();
  randomlyGenerateEnemy();
};

document.onclick = function (mouse) {
  performAttack(player);
};

performAttack = function (actor) {
  if (actor.attackCounter > 25) {
    actor.attackCounter = 0;
    randomlyGenerateBullet(actor);
  }
}

performSpecialAttack = function (actor) {
  // right click
  if (actor.atkCounter > 50) {
    // add every 1 sec
    var angle = 0;
    while (angle < 360) {
      randomlyGenerateBullet(actor, angle);
      randomlyGenerateBullet(actor, angle);
      randomlyGenerateBullet(actor, angle);
      angle++;
    }
    actor.atkCounter = 0;
  }
  mouse.preventDefault();
}
document.oncontextmenu = function (mouse) {
  perf
};

document.onkeydown = function (event) {
  if (event.key === "d") {
    player.pressingRight = true;
  } else if (event.key === "s") {
    //s
    player.pressingDown = true;
  } else if (event.key === "a") {
    //a
    player.pressingLeft = true;
  } else if (event.key === "w") {
    player.pressingUp = true;
  }
};

document.onkeyup = function (event) {
  if (event.key === "d") {
    //d
    player.pressingRight = false;
  } else if (event.key === "s") {
    //s
    player.pressingDown = false;
  } else if (event.key === "a") {
    //a
    player.pressingLeft = false;
  } else if (event.key === "w") {
    player.pressingUp = false;
  }
};

// document.onmousemove = function (mouse) {
//   // -8 to fix issues with mouse not centering, due to margin of canva
//   var mouseX = mouse.clientX - 8; // document.getElementById('ctx').getBoundingClientRect().left;
//   var mouseY = mouse.clientY - 8; // document.getElementById('ctx').getBoundingClientRect().top;

//   if (mouseX < player.width / 2) {
//     mouseX = player.width / 2;
//   }
//   if (mouseY < player.height / 2) {
//     mouseY = player.height / 2;
//   }
//   if (mouseX > WIDTH - player.width / 2) {
//     mouseX = WIDTH - player.width / 2;
//   }
//   if (mouseY > HEIGHT - player.height / 2) {
//     mouseY = HEIGHT - player.height / 2;
//   }
//   player.x = mouseX;
//   player.y = mouseY;
// };

document.onmousemove = function (mouse) {
  var mouseX =
    mouse.clientX - document.getElementById("ctx").getBoundingClientRect().left;
  var mouseY =
    mouse.clientY - document.getElementById("ctx").getBoundingClientRect().top;

  mouseX -= player.x;
  mouseY -= player.y;
  player.aimAngle = (Math.atan2(mouseY, mouseX) / Math.PI) * 180;
};

randomlyGenerateEnemy = function () {
  var x = Math.random() * WIDTH;
  var y = Math.random() * HEIGHT;
  var height = 10 + Math.random() * 40;
  var width = 10 + Math.random() * 40;
  var id = Math.random();
  var spdX = 5 + Math.random() * 5;
  var spdY = 5 + Math.random() * 5;
  Enemy(id, x, y, spdX, spdY, width, height);
};

randomlyGenerateUpgrade = function () {
  var x = Math.random() * WIDTH;
  var y = Math.random() * HEIGHT;
  var height = 10;
  var width = 10;
  var id = Math.random();
  var spdX = 0;
  var spdY = 0;

  if (Math.random() < 0.5) {
    var category = "score";
    var color = "orange";
  } else {
    var category = "atkSpd";
    var color = "purple";
  }
  Upgrade(id, x, y, spdX, spdY, width, height, category, color);
};

randomlyGenerateBullet = function (actor, overwriteAngle) {
  var x = actor.x;
  var y = actor.y;
  var height = 10;
  var width = 10;
  var id = Math.random();

  var angle = actor.aimAngle;

  if (overwriteAngle !== undefined) {
    angle = overwriteAngle;
  }
  var spdX = Math.cos((angle / 180) * Math.PI) * 5;
  var spdY = Math.sin((angle / 180) * Math.PI) * 5;
  Bullet(id, x, y, spdX, spdY, width, height);
};

startNewGame();

setInterval(update, 40);
