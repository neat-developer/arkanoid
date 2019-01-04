"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ARKANOID_IMAGE = 'arkanoid';
var timeoutBonus = 4000;

var GIFT =
/*#__PURE__*/
function () {
  function GIFT(x, y) {
    _classCallCheck(this, GIFT);

    this.x = x;
    this.y = y;
    this.speed = 2;
    this.w = 54;
    this.h = 54;
    this.collisionW = 30;
    this.collisionH = 30;
  }

  _createClass(GIFT, [{
    key: "draw",
    value: function draw(ctx, image) {
      ctx.drawImage(image, 226, 82, this.w, this.h, this.x, this.y, this.collisionW, this.collisionH);
    }
  }, {
    key: "move",
    value: function move() {
      this.y += this.speed;
    }
  }]);

  return GIFT;
}();

var BRICK =
/*#__PURE__*/
function () {
  /**
   * type - 3,2,1,0
   */
  function BRICK(x, y, type, w, h) {
    _classCallCheck(this, BRICK);

    this.x = x;
    this.y = y;
    this.type = type;
    this.w = 67;
    this.h = 32;
    this.collisionW = w;
    this.collisionH = h;
    this.init();
  }

  _createClass(BRICK, [{
    key: "init",
    value: function init() {}
  }, {
    key: "draw",
    value: function draw(ctx, image) {
      var brickImagePosXByType = {
        0: 0,
        1: 69,
        2: 138,
        3: 207
      };
      ctx.drawImage(image, brickImagePosXByType[this.type], 0, this.w, this.h, this.x, this.y, this.collisionW, this.collisionH);
    }
  }, {
    key: "stack",
    value: function stack() {
      this.type--;
    }
  }]);

  return BRICK;
}();

var PLATFORM =
/*#__PURE__*/
function () {
  function PLATFORM(x, y) {
    _classCallCheck(this, PLATFORM);

    this.x = x;
    this.y = y;
    this.h = 5;
    this.w = 65;
    this.defaultCollisionW = this.w * 2;
    this.collisionW = this.defaultCollisionW;
    this.collisionH = this.h * 2;
    this.maxCollisionW = this.collisionW * 2;
    this.minCollisionW = this.collisionW / 2;
  }

  _createClass(PLATFORM, [{
    key: "draw",
    value: function draw(ctx, image) {
      ctx.drawImage(image, 0, 98, this.w, this.h, this.x, this.y, this.collisionW, this.collisionH);
    }
  }, {
    key: "bonusPlatformMax",
    value: function bonusPlatformMax() {
      var _this = this;

      this.collisionW = this.maxCollisionW;
      setTimeout(function () {
        _this.collisionW = _this.defaultCollisionW;
      }, timeoutBonus);
    }
  }, {
    key: "bonusPlatformMin",
    value: function bonusPlatformMin() {
      var _this2 = this;

      this.collisionW = this.minCollisionW;
      setTimeout(function () {
        _this2.collisionW = _this2.defaultCollisionW;
      }, timeoutBonus);
    }
  }]);

  return PLATFORM;
}();

var BALL =
/*#__PURE__*/
function () {
  function BALL(x, y) {
    _classCallCheck(this, BALL);

    this.x = x;
    this.y = y;
    this.maxSpeed = 5;
    this.canStack = true;
    this.speedX = 0;
    this.speedY = 0;
    this.size = 55;
    this.collisionSize = 32;
  }

  _createClass(BALL, [{
    key: "draw",
    value: function draw(ctx, image) {
      ctx.drawImage(image, 0, 32, this.size, this.size, this.x, this.y, this.collisionSize, this.collisionSize);
    }
  }, {
    key: "changeDirection",
    value: function changeDirection(side) {
      var _this3 = this;

      this.canStack = false;
      this['speed' + side] = -this['speed' + side];
      setTimeout(function () {
        _this3.canStack = true;
      });
    }
  }, {
    key: "speedBonus",
    value: function speedBonus() {
      var _this4 = this;

      this.speedY = this.speedY > 0 ? this.maxSpeed * 2 : -(this.maxSpeed * 2);
      setTimeout(function () {
        _this4.speedY = _this4.speedY > 0 ? _this4.maxSpeed : -_this4.maxSpeed;
      }, timeoutBonus);
    }
  }, {
    key: "start",
    value: function start() {
      this.speedX = 0;
      this.speedY = -this.maxSpeed;
    }
  }, {
    key: "stop",
    value: function stop() {
      this.speedX = 0;
      this.speedY = 0;
    }
  }, {
    key: "setSpeedX",
    value: function setSpeedX(speed) {
      this['speedX'] = speed;
    }
  }, {
    key: "changePosition",
    value: function changePosition() {
      this.x += this['speedX'];
      this.y += this['speedY'];
    }
  }]);

  return BALL;
}();

var GAME =
/*#__PURE__*/
function () {
  function GAME(options) {
    _classCallCheck(this, GAME);

    this.options = options;
    this.start = false;
    this.score = 0;
    this.images = [];
    this.bricks = [];
    this.gifts = [];
    this.canvas = document.getElementById(this.options.id);
    this.ctx = this.canvas && this.canvas.getContext('2d');
    this.init();
  }

  _createClass(GAME, [{
    key: "init",
    value: function init() {
      var _this5 = this;

      this.loadImages(this.options.images, function () {
        _this5.platform = new PLATFORM(0, 0);
        _this5.platform.x = _this5.canvas.width / 2 - _this5.platform.collisionW / 2;
        _this5.platform.y = _this5.canvas.height - 20;
        _this5.ball = new BALL(0, 0);

        _this5.ballToCenterOfPlatform();

        _this5.platformEvents();

        _this5.setBricks();

        _this5.loop();
      });
    } // Service methods

  }, {
    key: "loop",
    value: function loop() {
      var _this6 = this;

      this.clearCanvas();
      if (!this.start) this.pressSpaceText(); // BALL

      var ballPosX = Math.round(this.ball.x + this.ball.speedX);
      var ballPosY = Math.round(this.ball.y + this.ball.speedY);
      if (ballPosX + this.ball.collisionSize >= this.canvas.width || ballPosX <= 0) this.ball.changeDirection('X');
      if (ballPosY <= 0) this.ball.changeDirection('Y');

      if (ballPosY + this.ball.collisionSize >= this.platform.y && ballPosX + this.ball.collisionSize > this.platform.x && ballPosX <= this.platform.x + this.platform.collisionW && this.start) {
        var speedBalX = this.ball.maxSpeed * (this.ball.x - (this.platform.x + this.platform.collisionW / 2)) / this.platform.collisionW;
        this.ball.setSpeedX(speedBalX);
        this.ball.changeDirection('Y');
      } // BALL
      // Platform


      this.platform.draw(this.ctx, this.images[ARKANOID_IMAGE]); // Platform
      //BRICK

      this.bricks.forEach(function (brick, brickIdx) {
        if (brick.type >= 0) {
          if (ballPosX >= brick.x && ballPosX <= brick.x + brick.collisionW && ballPosY <= brick.y + brick.collisionH && ballPosY >= brick.y || ballPosX + _this6.ball.collisionSize >= brick.x && ballPosX + _this6.ball.collisionSize <= brick.x + brick.collisionW && ballPosY <= brick.y + brick.collisionH && ballPosY >= brick.y) {
            if (_this6.ball.canStack) {
              brick.stack();
              var centerBrickX = brick.x + brick.collisionW / 2;

              var _speedBalX = _this6.ball.maxSpeed * (_this6.ball.x - centerBrickX) / brick.collisionW;

              _this6.ball.setSpeedX(_speedBalX);

              _this6.ball.changeDirection('Y');

              _this6.score++;

              if (getRandomInt(0, 3) === 3) {
                var gift = new GIFT(centerBrickX, brick.y + brick.collisionH);
                gift.x -= gift.collisionW / 2;

                _this6.gifts.push(gift);
              }
            }
          }

          brick.draw(_this6.ctx, _this6.images[ARKANOID_IMAGE]);
        } else {
          delete _this6.bricks[brickIdx];
        }
      }); //BRICK
      //GIFTS

      this.gifts.forEach(function (gift, giftIdx) {
        gift.draw(_this6.ctx, _this6.images[ARKANOID_IMAGE]);
        gift.move();

        if (gift.y + gift.collisionH >= _this6.platform.y && _this6.start) {
          if (gift.x >= _this6.platform.x && gift.x <= _this6.platform.x + _this6.platform.collisionW) {
            var randomValue = getRandomInt(0, 1);
            if (randomValue === 0) _this6.ball.speedBonus();
            if (randomValue === 1) _this6.platform.bonusPlatformMax(); // if (randomValue === 2) this.platform.bonusPlatformMin();
          }

          delete _this6.gifts[giftIdx];
        }
      });

      if (ballPosY + this.ball.collisionSize > this.platform.y + this.platform.collisionH) {
        debugger;
        this.start = false;
        this.ball.stop();
        this.ballToCenterOfPlatform();
        this.score -= 10;
      } else {
        this.ball.x = ballPosX;
        this.ball.y = ballPosY;
      }

      this.setScore();
      this.ball.draw(this.ctx, this.images[ARKANOID_IMAGE]);
      window.requestAnimationFrame(function () {
        _this6.loop();
      });
    }
  }, {
    key: "setBricks",
    value: function setBricks() {
      var levels = 4;
      var countInLevel = 10;
      var margin = 1;
      var widthBrick = (this.canvas.width - (countInLevel - 1) * margin) / countInLevel;
      var heightBrick = 32;
      this.bricks = [];

      for (var i = 0; i < levels; i++) {
        var y = i * heightBrick + i * margin;

        for (var j = 0; j < countInLevel; j++) {
          var x = j * widthBrick + j * margin;
          this.bricks.push(new BRICK(x, y, i, widthBrick, heightBrick));
        }
      }
    }
    /**
     *
     * @param images - array
     * @param callback - callback function
     */

  }, {
    key: "loadImages",
    value: function loadImages(images, callback) {
      var _this7 = this;

      var promises = [];
      Array.isArray(images) && images.forEach(function (image) {
        promises.push(new Promise(function (resolve) {
          var img = new Image();
          img.src = image.path;

          img.onload = function () {
            _this7.images[image.name] = img;
            resolve();
          };
        }));
      });
      Promise.all(promises).then(function () {
        callback();
      });
    }
  }, {
    key: "ballToCenterOfPlatform",
    value: function ballToCenterOfPlatform() {
      this.ball.x = this.platform.x + this.platform.collisionW / 2 - this.ball.collisionSize / 2;
      this.ball.y = this.platform.y - this.ball.collisionSize;
    }
  }, {
    key: "clearCanvas",
    value: function clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } //     EVENTS METHOD

  }, {
    key: "platformEvents",
    value: function platformEvents() {
      var _this8 = this;

      document.addEventListener('mousemove', function (e) {
        var screenW = screen.width;
        var xPos = e.screenX;
        var percentPosX = xPos / screenW * 100;
        _this8.platform.x = percentPosX * (_this8.canvas.width - _this8.platform.collisionW) / 100;
        if (!_this8.start) _this8.ballToCenterOfPlatform();
      });
      document.addEventListener('keydown', function (e) {
        var keycode = e.keyCode;

        if (keycode === 32 && !_this8.start) {
          _this8.ball.start();

          _this8.start = true;
        }
      });
    }
  }, {
    key: "pressSpaceText",
    value: function pressSpaceText() {
      this.ctx.font = "20px Arial";
      this.ctx.textAlign = 'center';
      this.ctx.fillText("Press Space to start game!", this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }, {
    key: "setScore",
    value: function setScore() {
      this.ctx.font = "20px Arial";
      this.ctx.textAlign = 'left';
      this.ctx.fillText("Score: " + this.score, 15, this.canvas.height / 2);
    }
  }]);

  return GAME;
}();

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

(function () {
  var game = new GAME({
    id: 'game',
    images: [{
      name: ARKANOID_IMAGE,
      path: '/images/arkanoid.png'
    }]
  });
})();