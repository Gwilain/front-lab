class ChainLink {
    constructor(width) {
        this.width = width;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
    }

    getPin() {
        const angle = this.rotation * Math.PI / 180;
        const x = this.x + Math.cos(angle) * this.width;
        const y = this.y + Math.sin(angle) * this.width;
        return { x, y };
    }

    getMidle() {
        const angle = this.rotation * Math.PI / 180;
        const x = this.x + Math.cos(angle) * (this.width / 2);
        const y = this.y + Math.sin(angle) * (this.width / 2);
        return { x, y };
    }

    setWidth(width) {
        this.width = width;
    }
}

class Chain {
    constructor(anchor, targetElement, offSet = { x: 0, y: 0 }) {
        this.anchor = anchor;
        this.targetElement = targetElement;
        this.offSet = offSet;
        this.segments = [];
        this.numSegments = 20;

        this.init();
    }

    init() {
        for (let i = 0; i < this.numSegments; i++) {
            const segment = new ChainLink(25);
            this.segments.push(segment);
        }

        const lastSegment = this.segments[this.numSegments - 1];
        lastSegment.x = this.anchor.x;
        lastSegment.y = this.anchor.y;
    }

    updateAnchor(newAnchor) {
        this.anchor = newAnchor;

        const lastSegment = this.segments[this.numSegments - 1];
        lastSegment.x = this.anchor.x;
        lastSegment.y = this.anchor.y;
    }

    draw(ctx) {
      
        const rect = this.targetElement.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';

        const angle = 0;
        const X = targetX + Math.cos(angle) * (-this.offSet.y);
        const Y = targetY + Math.sin(angle) * (-this.offSet.y);

        const xA = targetX + Math.cos(angle) * (-this.offSet.y + 10);
        const yA = targetY + Math.sin(angle) * (-this.offSet.y + 10);

        let target = this.reach(this.segments[0], xA, yA);

        for (let i = 1; i < this.numSegments; i++) {
            const segment = this.segments[i];
            target = this.reach(segment, target.x, target.y);
        }

        ctx.moveTo(this.segments[this.numSegments - 1].x, this.segments[this.numSegments - 1].y);

        for (let i = this.numSegments - 1; i > 0; i--) {
            const segmentA = this.segments[i];
            const segmentB = this.segments[i - 1];
            this.position(segmentB, segmentA);

            const p = segmentB.getMidle();
            ctx.quadraticCurveTo(segmentB.x, segmentB.y, p.x, p.y);
        }

        ctx.quadraticCurveTo(xA, yA, X, Y);
        ctx.stroke();
    }

    reach(segment, xpos, ypos) {
        const dx = xpos - segment.x;
        const dy = ypos - segment.y;
        const angle = Math.atan2(dy, dx);
        segment.rotation = angle * 180 / Math.PI;
        const w = segment.getPin().x - segment.x;
        const h = segment.getPin().y - segment.y;
        const tx = xpos - w;
        const ty = ypos - h;
        return { x: tx, y: ty };
    }

    position(segmentA, segmentB) {
        segmentA.x = segmentB.getPin().x;
        segmentA.y = segmentB.getPin().y;
    }
}


class ChainManager {
    constructor(chains, canvas) {
        this.canvas = canvas;
        this.chains = chains;
        this.ctx = canvas.getContext('2d');
    }

    start() {
        const animate = () => {
           
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.chains.forEach(chain => chain.draw(this.ctx));
            requestAnimationFrame(animate);
        };
        animate();
    }

}


function resizeCanvasAndUpdateAnchor(chains) {
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const newAnchor = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };

    chains.forEach(chain => chain.updateAnchor(newAnchor));
}   



function setupDragAndDrop(element, chain) {
    let isDragging = false;
    let zIndexCounter = 1;
    let offsetX, offsetY;
    let velocityX = 0, velocityY = 0;
    let lastX = 0, lastY = 0;
    let animationFrame;

    function startDrag(e) {
        isDragging = true;
        velocityX = 0;
        velocityY = 0;

        let clientX, clientY;

        if (e.type.startsWith('touch')) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        offsetX = clientX - element.getBoundingClientRect().left;
        offsetY = clientY - element.getBoundingClientRect().top;

        lastX = clientX;
        lastY = clientY;

        element.style.cursor = 'grabbing';
        cancelAnimationFrame(animationFrame);
        e.preventDefault();
    }

    function onDrag(e) {
        if (!isDragging) return;

        let clientX, clientY;

        if (e.type.startsWith('touch')) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const parent = element.offsetParent || document.body;
        const parentRect = parent.getBoundingClientRect();
        const elemRect = element.getBoundingClientRect();

        let x = clientX - offsetX;
        let y = clientY - offsetY;

        // Empêcher l'élément de sortir des limites du parent
        x = Math.max(0, Math.min(x, parentRect.width - elemRect.width));
        y = Math.max(0, Math.min(y, parentRect.height - elemRect.height));

        velocityX = clientX - lastX;
        velocityY = clientY - lastY;

        lastX = clientX;
        lastY = clientY;

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        e.preventDefault();

        zIndexCounter++;
        element.style.zIndex = zIndexCounter;
    }

    function stopDrag() {
        isDragging = false;
        element.style.cursor = 'grab';

        function applyInertia() {
            if (Math.abs(velocityX) > 0.5 || Math.abs(velocityY) > 0.5) {
                let rect = element.getBoundingClientRect();
                let parent = element.offsetParent || document.body;
                let parentRect = parent.getBoundingClientRect();

                let newLeft = rect.left + velocityX;
                let newTop = rect.top + velocityY;

                // Empêcher l'élément de sortir des limites après l'inertie
                newLeft = Math.max(0, Math.min(newLeft, parentRect.width - rect.width));
                newTop = Math.max(0, Math.min(newTop, parentRect.height - rect.height));

                element.style.left = `${newLeft}px`;
                element.style.top = `${newTop}px`;

                velocityX *= 0.92;
                velocityY *= 0.92;

                requestAnimationFrame(applyInertia);
            } else {
                let parent = element.offsetParent || document.body;
                element.style.left = `${(element.offsetLeft / parent.clientWidth) * 100}%`;
                element.style.top = `${(element.offsetTop / parent.clientHeight) * 100}%`;
                element.style.zIndex = '';
            }
        }

        applyInertia();
    }

    element.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mouseleave', stopDrag);

    element.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);
    document.addEventListener('touchcancel', stopDrag);
}


const chains = [];  

window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const anchor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    const draggableElements = document.querySelectorAll('.draggable-content');

    draggableElements.forEach((element) => {
        const chain = new Chain(anchor, element);
        chains.push(chain);
        setupDragAndDrop(element, chain);
    });

    const chainManager = new ChainManager(chains, canvas); 
    console.log("ctx = "+ctx)
    chainManager.start();

    resizeCanvasAndUpdateAnchor(chains);
});

window.addEventListener('resize', () => {
    const draggableElements = document.querySelectorAll('.draggable-content');
    resizeCanvasAndUpdateAnchor(chains);
    
});