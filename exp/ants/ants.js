class Ant {
    constructor() {
        this.speed = 3;
        this.baseSpeed = 3;
        //this.spriteSheet = 'ant-sprite.png';
        this.spriteSheet = 'https://i.postimg.cc/rptpPhSP/ant-sprite.png';
        this.frameWidth = 100;
        this.frameHeight = 100;
        this.currentFrame = 0;
        this.totalFrames = 20;

        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.angle = Math.random() * 2 * Math.PI;

        this.smashed = false;

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

        this.element.addEventListener('click', () => this.smash());

        this.updateSprite();
    }


    move(ants) {
        if (this.smashed) return;

        this.handleWallCollision();
        this.handleAntCollision(ants);

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

    smash() {
        if (!this.smashed) {
            this.smashed = true;
            this.speed = 0;
            this.element.style.pointerEvents = "none";
            this.element.style.zIndex = "-1";
    
            let normalizedAngle = (this.angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            const angleIndex = Math.round((normalizedAngle * 8) / (2 * Math.PI)) % 8;
            console.log(`Smash! angleIndex = ${angleIndex}, normalizedAngle = ${normalizedAngle}`); // Debug
    
            const smashFrame1 = angleIndex * 2;
            const smashFrame2 = smashFrame1 + 1;
            const offsetY = 8 * this.frameHeight;
    
            this.element.style.backgroundPosition = `-${smashFrame1 * this.frameWidth}px -${offsetY}px`;
            this.element.offsetHeight;
    
            setTimeout(() => {
                this.element.style.backgroundPosition = `-${smashFrame2 * this.frameWidth}px -${offsetY}px`;
            }, 1000/30);
    
            setTimeout(this.restart.bind(this), 10000);
        }
    }
    

    restart() {
        this.smashed = false;
        this.element.style.pointerEvents = "auto";
        this.element.style.zIndex = "auto"; // Revenir à la normale
        this.updateSprite();
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

    handleAntCollision(ants) {
        if (this.smashed) return;

        const collisionDistance = 30;
        const turnSpeed = 0.1;

        const antennaLeftX = this.x + Math.cos(this.angle + Math.PI / 4) * 15;
        const antennaLeftY = this.y + Math.sin(this.angle + Math.PI / 4) * 15;
        const antennaRightX = this.x + Math.cos(this.angle - Math.PI / 4) * 15;
        const antennaRightY = this.y + Math.sin(this.angle - Math.PI / 4) * 15;

        let collisionDetected = false;

        for (const otherAnt of ants) {
            if (otherAnt === this || otherAnt.smashed) continue;

            const dxLeft = antennaLeftX - otherAnt.x;
            const dyLeft = antennaLeftY - otherAnt.y;
            const distanceLeft = Math.sqrt(dxLeft * dxLeft + dyLeft * dyLeft);

            const dxRight = antennaRightX - otherAnt.x;
            const dyRight = antennaRightY - otherAnt.y;
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
}

const ants = [];
for (let i = 0; i < 30; i++) {
    ants.push(new Ant());
}

setInterval(() => {
    ants.forEach(ant => ant.move(ants));
}, 1000 / 60);
