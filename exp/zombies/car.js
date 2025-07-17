class Car {
    constructor(container, spriteSheet, frameWidth, frameHeight) {
        this.container = container;
        this.spriteSheet = spriteSheet;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.totalFrames = 72;
        
        this.vr = 0;
        this.speed = 7;
        this.maxSpeed = 7;
        this.velocity = 0;
        this.rot = 0;
        this.noRepeatA = false;
        this.noRepeatR = false;
        
        this.init();
    }
    
    init() {
        document.addEventListener("keydown", (e) => this.onKeyDown(e));
        document.addEventListener("keyup", (e) => this.onKeyUp(e));
        
        this.container.style.left = (window.innerWidth / 2 - this.frameWidth / 2) + "px";
        this.container.style.top = (window.innerHeight / 2 - this.frameHeight / 2) + "px";

        requestAnimationFrame(() => this.loop());

        
    }
    
    onKeyDown(event) {
        switch(event.key) {
            case "ArrowLeft":
                this.vr = -8;
                break;
            case "ArrowRight":
                this.vr = 8;
                break;
            case "ArrowUp":
                if (!this.noRepeatA) {
                    this.noRepeatA = true;
                    this.velocity = 1;
                }
                break;
            case "ArrowDown":
                if (!this.noRepeatR) {
                    this.noRepeatR = true;
                    this.velocity = -1;
                }
                break;
            case " ": // Space key
                this.velocity = 0;
                this.speed /= 2;
                break;
        }
    }
    
    onKeyUp(event) {
        this.vr = 0;
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            this.velocity = 0;
            this.noRepeatA = false;
            this.noRepeatR = false;
        }
    }
    
    loop() {
        this.rot += this.vr * this.speed / 10;
        
        if (this.velocity != 0 ) {
            if ( Math.abs( this.speed ) < this.maxSpeed ) {
                this.speed +=this.velocity;
            }else {
                this.speed = this.maxSpeed *this.velocity;
            }
        }else {
            this.speed *= 0.9;
        }
        if (Math.abs(this.speed ) < 0.2) this.speed = 0;

        let angle = (this.rot  ) * Math.PI / 180;


        this.rot = ( 360 + this.rot ) % 360;
		let frameIndex = Math.round( this.rot*72/360 );
			
        let ax = Math.cos(angle) * this.speed;
        let ay = Math.sin(angle) * this.speed;
    
        let x = parseFloat(this.container.style.left || 0) + ax;
        let y = parseFloat(this.container.style.top || 0) + ay;
    
        // **Gestion des bords de l'écran**
        if (x > window.innerWidth) x = -this.frameWidth;
        if (x < -this.frameWidth) x = window.innerWidth;
        if (y > window.innerHeight) y = -this.frameHeight;
        if (y < -this.frameHeight) y = window.innerHeight;
    
        this.container.style.left = `${x}px`;
        this.container.style.top = `${y}px`;
        
        let frameX = (frameIndex % 8) * this.frameWidth;
        let frameY = Math.floor(frameIndex / 8) * this.frameHeight;
        this.container.style.backgroundPosition = `-${frameX}px -${frameY}px`;
    
        requestAnimationFrame(() => this.loop());
    }
}
class Zombi {
    constructor(car) {
        this.speed = 1;
        this.baseSpeed = 1;
        this.spriteSheet = 'zombi_sheet.png';


      //  this.spriteSheet = 'https://i.postimg.cc/rptpPhSP/ant-sprite.png';
        this.frameWidth = 80;
        this.frameHeight = 80;
        this.currentFrame = 0;
        this.totalFrames = 28;

        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.angle = Math.random() * 2 * Math.PI;

        this.smashed = false;
        this.car = car;

        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.width = `${this.frameWidth}px`;
        this.element.style.height = `${this.frameHeight}px`;
        this.element.style.backgroundImage = `url('${this.spriteSheet}')`;
        this.element.style.backgroundSize = `${this.frameWidth * this.totalFrames}px ${this.frameHeight * 9}px`;
        this.element.style.cursor = "pointer";

        document.body.appendChild(this.element);

        this.updateSprite();
    }


    move(zombies) {
        if (this.smashed) return;

        this.handleWallCollision();
        this.handleZombiCollision(zombies);

        this.handleCarCollision();

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;

        this.updateSprite();
    }

    updateSprite() {
        let normalizedAngle = (this.angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const angleIndex = Math.round((normalizedAngle * 8) / (2 * Math.PI)) % 8;
        const offsetX = this.currentFrame * this.frameWidth;
        const offsetY = angleIndex * this.frameHeight;

        this.element.style.backgroundPosition = `-${offsetX}px -${offsetY}px`;

        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
    }

   
    handleWallCollision() {
        
        const turnSpeed = 1;

        if (this.x < 0) {
            this.angle += turnSpeed;
            this.x = 0;
        }
        if (this.x > window.innerWidth - this.frameWidth) {
            this.angle -= turnSpeed;
            this.x = window.innerWidth - this.frameWidth;
        }
        if (this.y < 0) {
            this.angle += turnSpeed;
            this.y = 0;
        }
        if (this.y > window.innerHeight) {
            this.angle -= turnSpeed;
            this.y = window.innerHeight ;
        }
    }

    handleZombiCollision(zombies) {
        if (this.smashed) return;

        const collisionDistance = 30;
        const turnSpeed = 0.1;

        const armLeftX = this.x + Math.cos(this.angle + Math.PI / 4) * 15;
        const armLeftY = this.y + Math.sin(this.angle + Math.PI / 4) * 15;
        const armRightX = this.x + Math.cos(this.angle - Math.PI / 4) * 15;
        const armRightY = this.y + Math.sin(this.angle - Math.PI / 4) * 15;

        let collisionDetected = false;

        for (const otherZombi of zombies) {
            if (otherZombi === this || otherZombi.smashed) continue;

            const dxLeft = armLeftX - otherZombi.x;
            const dyLeft = armLeftY - otherZombi.y;
            const distanceLeft = Math.sqrt(dxLeft * dxLeft + dyLeft * dyLeft);

            const dxRight = armRightX - otherZombi.x;
            const dyRight = armRightY - otherZombi.y;
            const distanceRight = Math.sqrt(dxRight * dxRight + dyRight * dyRight);

            if (distanceLeft < collisionDistance || distanceRight < collisionDistance) {
                collisionDetected = true;

                if (distanceLeft < collisionDistance) {
                    this.angle -= turnSpeed;
                } else {
                    this.angle += turnSpeed;
                }
            }
        }

        if (!collisionDetected && this.speed < this.baseSpeed) {
            this.speed += 0.05;
        } else if (collisionDetected) {
            this.speed = 0.5;
        }
    }


    handleCarCollision(){
            const carRect = this.car.container.getBoundingClientRect();
            const zombieRect = this.element.getBoundingClientRect();
            const margin = 20;
            if (!this.smashed &&
                carRect.right > zombieRect.left +margin &&
                carRect.left < zombieRect.right -margin &&
                carRect.bottom > zombieRect.top +margin &&
                carRect.top < zombieRect.bottom -margin &&
                this.car.speed != 0
            ) {
                this.smashed = true;
                this.speed = 0;
                
               this.smashAnimation();
            }
       
    }

    smashAnimation(count = 0){
        
        if(count>=5) return;

        const offsetY = 8 * this.frameHeight;
    
        this.element.style.backgroundPosition = `-${count * this.frameWidth}px -${offsetY}px`;

        this.element.offsetHeight;

        setTimeout(() => this.smashAnimation(count + 1), 1000/30);
    }
    

    
}



document.addEventListener("DOMContentLoaded", () => {

    const car = new Car(document.getElementById("car"), "sprite_sheet.png", 120, 120);

    const zombies = [];
    for (let i = 0; i < 30; i++) {
        zombies.push(new Zombi(car));
    }
    
    setInterval(() => {
        zombies.forEach(zombi => zombi.move(zombies));
    }, 1000 / 24);
    
    
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

   
   
});


