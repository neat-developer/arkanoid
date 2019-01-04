const ARKANOID_IMAGE = 'arkanoid';
const timeoutBonusConst = 4000;


class GIFT {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.w = 54;
        this.h = 54;

        this.collisionW = 30;
        this.collisionH = 30;
    }

    draw(ctx, image) {
        ctx.drawImage(image, 226, 82, this.w, this.h, this.x, this.y, this.collisionW, this.collisionH);
    }

    move() {
        this.y += this.speed;
    }
}

class BRICK {
    constructor(x, y, type, w, h) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.w = 67;
        this.h = 32;

        this.collisionW = w;
        this.collisionH = h;
    }

    draw(ctx, image) {
        let brickImageByPosXByType = {0: 0, 1: 69, 2: 138, 3: 207};
        ctx.drawImage(image, brickImageByPosXByType[this.type], 0, this.w, this.h, this.x, this.y, this.collisionW, this.collisionH);
    }

    stack() {
        this.type--;
    }
}

class BALL {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.maxSpeed = 5;
        this.canStack = true;
        this.speedX = 0;
        this.speedY = 0;
        this.radius = 55;
        this.collisionSize = 32;
    }

    draw(ctx, image) {
        ctx.drawImage(image, 0, 32, this.radius, this.radius, this.x, this.y, this.collisionSize, this.collisionSize);
    }

    changeDirection(side) {
        this.canStack = false;
        this['speed' + side] = -this['speed' + side];
        setTimeout(() => {
            this.canStack = true;
        });
    }

    speedBonus() {
        let newSpeed = this.maxSpeed * 2;
        this.speedY = this.speedY > 0 ? newSpeed : -(newSpeed);
        setTimeout(() => {
            this.speedY = this.speedY > 0 ? this.maxSpeed : -this.maxSpeed;
        }, timeoutBonusConst)
    }

    stop() {
        this.speedX = 0;
        this.speedY = 0;
    }


    start() {
        this.speedX = 0;
        this.speedY = -this.maxSpeed;
    }

    setSpeedX(speed) {
        this.speedX = speed;
    }

    changePosition() {
        this.x += this.speedX;
        this.y += this.speedY;
    }


}

class PLATFORM {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.h = 5;
        this.w = 65;
        this.defaultCollisionW = this.w * 2;
        this.collisionW = this.defaultCollisionW;
        this.collisionH = this.h * 2;
        this.maxCollisionW = this.collisionW * 2;
    }

    draw(ctx, image) {
        ctx.drawImage(image, 0, 98, this.w, this.h, this.x, this.y, this.collisionW, this.collisionH);
    }

    bonusPlatformMax() {
        this.collisionW = this.maxCollisionW;
        setTimeout(() => {
            this.collisionW = this.defaultCollisionW
        }, timeoutBonusConst)
    }
}

class GAME {
    constructor(options) {
        this.options = options;
        this.images = [];
        this.score = 0;
        this.bricks = [];
        this.gifts = [];
        this.canvas = document.getElementById(this.options.id);
        this.ctx = this.canvas && this.canvas.getContext('2d');
        this.init();
    }

    // GAME METHODS
    init() {
        this.loadImages(this.options.images, () => {
            this.platform = new PLATFORM(0, 0);
            this.platform.x = (this.canvas.width / 2) - (this.platform.collisionW / 2);
            this.platform.y = this.canvas.height - 20;
            this.ball = new BALL(0, 0);
            this.ballToCenterOfPlatform();
            this.setBricks();
            this.events();
            this.loop();
        });
    }

    loop() {
        this.clearCanvas();

        if (!this.start) this.pressSpaceText();
        let ballPosX = Math.round(this.ball.x + this.ball.speedX);
        let ballPosY = Math.round(this.ball.y + this.ball.speedY);

        //BALL
        if (ballPosX + this.ball.collisionSize >= this.canvas.width || ballPosX <= 0) this.ball.changeDirection('X');
        if (ballPosY <= 0) this.ball.changeDirection('Y');


        if (ballPosY + this.ball.collisionSize >= this.platform.y && ballPosX + this.ball.collisionSize > this.platform.x && ballPosX <= this.platform.x + this.platform.collisionW && this.start) {
            let speedBallX = this.ball.maxSpeed * (this.ball.x - (this.platform.x + this.platform.collisionW / 2)) / this.platform.collisionW;
            this.ball.setSpeedX(speedBallX);
            this.ball.changeDirection('Y');
        }
        this.ball.changePosition();
        // BALL
        // bricks
        this.bricks.forEach((brick, idxBrick) => {
            if (brick.type >= 0) {
                if (
                    ballPosX >= brick.x && ballPosX <= (brick.x + brick.collisionW) && ballPosY <= (brick.y + brick.collisionH) && ballPosY >= brick.y ||
                    ballPosX + this.ball.collisionSize >= brick.x && ballPosX + this.ball.collisionSize <= (brick.x + brick.collisionW) && ballPosY <= (brick.y + brick.collisionH) && ballPosY >= brick.y
                ) {
                    if (this.ball.canStack) {
                        brick.stack();
                        let centerBrickX = (brick.x + brick.collisionW / 2);
                        let speedBallX = this.ball.maxSpeed * (this.ball.x - centerBrickX) / brick.collisionW;
                        this.ball.setSpeedX(speedBallX);
                        this.ball.changeDirection('Y');
                        this.score++;

                        if (getRandomInt(0, 3) === 3) {
                            let gift = new GIFT(centerBrickX, brick.y + brick.collisionH);
                            gift.x -= gift.collisionW / 2;
                            this.gifts.push(gift)
                        }
                    }
                }
                brick.draw(this.ctx, this.images[ARKANOID_IMAGE]);
            } else {
                delete this.bricks[idxBrick];
            }
        });
        // bricks


        // gift
        this.gifts.forEach((gift, giftIdx) => {
            gift.draw(this.ctx, this.images[ARKANOID_IMAGE]);
            gift.move();

            if (gift.y + gift.collisionH >= this.platform.y && this.start) {
                if (gift.x >= this.platform.x && gift.x <= this.platform.x + this.platform.collisionW && !gift.removed) {
                    let randomValue = getRandomInt(0, 1);
                    if (randomValue === 0) this.ball.speedBonus();
                    if (randomValue === 1) this.platform.bonusPlatformMax();
                    gift.removed = true;
                }
                delete this.gifts[giftIdx]
            }
        });
        // gift


        if (ballPosY + this.ball.collisionSize > this.platform.y + this.platform.collisionH) {
            // GAMEOVER
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
        this.platform.draw(this.ctx, this.images[ARKANOID_IMAGE]);
        window.requestAnimationFrame(() => {
            this.loop();
        });
    }


    setBricks() {
        let levels = 4;
        let countInLevel = 10;
        let margin = 1;
        let widthBrick = (this.canvas.width - (countInLevel - 1) * margin) / countInLevel;
        let heightBrick = 32;
        this.bricks = [];
        for (let i = 0; i < levels; i++) {
            let y = (i * heightBrick) + i * margin;
            for (let j = 0; j < countInLevel; j++) {
                let x = (j * widthBrick) + j * margin;
                this.bricks.push(new BRICK(x, y, i, widthBrick, heightBrick));
            }
        }
    }


    ballToCenterOfPlatform() {
        this.ball.x = this.platform.x + (this.platform.collisionW / 2) - this.ball.collisionSize / 2;
        this.ball.y = this.platform.y - this.ball.collisionSize;
    }

    //SERVICE METHODS
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    events() {
        document.addEventListener('mousemove', (e) => {
            let screenW = screen.width;
            let xPos = e.screenX;
            let percentPosX = xPos / screenW * 100;
            this.platform.x = percentPosX * (this.canvas.width - (this.platform.collisionW)) / 100;
            if (!this.start) this.ballToCenterOfPlatform();
        });

        document.addEventListener('keydown', (e) => {
            let keyCode = e.keyCode;
            if (keyCode === 32 && !this.start) {
                this.ball.start();
                this.start = true;
            }
        });


    }

    loadImages(images, callback) {
        let promises = [];
        Array.isArray(images) && images.forEach(image => {
            promises.push(new Promise(resolve => {
                let img = new Image();
                img.src = image.path;
                img.onload = () => {
                    this.images[image.name] = img;
                    resolve();
                }
            }));
        });

        Promise.all(promises).then(() => {
            callback()
        })
    }

    pressSpaceText() {
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Press Space to start game!", this.canvas.width / 2, (this.canvas.height / 2) + 20)
    }

    setScore() {
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = 'left';

        this.ctx.fillText("Score: " + this.score, 15, (this.canvas.height / 2))

    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


(function () {
    let game = new GAME({
        id: 'game',
        images: [{name: ARKANOID_IMAGE, path: 'images/arkanoid.png'}]
    })
})();