export type ConfettiType = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  gravity: number;
  sx: number;
  sy: number;
  angle: number;
  rot: number;
  color: string;
};

export type ConfettiOptions = {
  gravity: number;
  maxParticles: number;
  minSize: number;
  maxSize: number;
  minSpeedX: number;
  maxSpeedX: number;
  minSpeedY: number;
  maxSpeedY: number;
  minRotation: number;
  maxRotation: number;
  colorRange: [number, number];
};

export class Confetti {
  public confetti: ConfettiType[] = [];
  public pressed: boolean = false;

  private defaultOptions: ConfettiOptions = {
    gravity: 0.2,
    maxParticles: 100,
    minSize: 5,
    maxSize: 15,
    minSpeedX: -3,
    maxSpeedX: 3,
    minSpeedY: -24,
    maxSpeedY: -18,
    minRotation: -10,
    maxRotation: 10,
    colorRange: [100, 230], // [min, max] for RGB values
  };

  private options: ConfettiOptions;

  constructor(
    public ctx: CanvasRenderingContext2D,
    options?: Partial<ConfettiOptions>
  ) {
    this.options = { ...this.defaultOptions, ...options };

    this.draw = this.draw.bind(this);
    this.runConfetti = this.runConfetti.bind(this);
    this.addConfetti = this.addConfetti.bind(this);
    this.random = this.random.bind(this);
    this.radians = this.radians.bind(this);

    this.draw();
  }

  addConfetti(mouseX: number, duration: number) {
    // Add confetti with given duration
    for (let i = 0; i < duration; i++) {
      const {
        minSize,
        maxSize,
        minSpeedX,
        maxSpeedX,
        minSpeedY,
        maxSpeedY,
        minRotation,
        maxRotation,
        colorRange,
      } = this.options;
      this.confetti.push({
        x: mouseX,
        y: window.innerHeight,
        w: this.random(minSize, maxSize),
        h: this.random(minSize, maxSize),
        vx: this.random(minSpeedX, maxSpeedX),
        vy: this.random(minSpeedY, maxSpeedY),
        gravity: this.options.gravity,
        sx: this.radians(this.random(360)) | 0,
        sy: this.radians(this.random(360)) | 0,
        angle: 0,
        rot: this.random(minRotation, maxRotation),
        color: `rgb(${this.random(colorRange[0], colorRange[1])}, ${this.random(
          colorRange[0],
          colorRange[1]
        )}, ${this.random(colorRange[0], colorRange[1])})`,
      });
    }

    // Limit the number of particles to prevent excessive confetti
    if (this.confetti.length > this.options.maxParticles) {
      this.confetti.splice(0, this.confetti.length - this.options.maxParticles);
    }
  }

  runConfetti(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();

    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const confetto = this.confetti[i];

      const w = Math.cos(confetto.sx) * confetto.w;
      const h = Math.sin(confetto.sy) * confetto.h;

      ctx.translate(confetto.x + confetto.w / 2, confetto.y + confetto.h / 2);
      ctx.rotate(this.radians(confetto.angle));

      ctx.fillStyle = confetto.color;
      ctx.fillRect(-w / 2, -h / 2, w, h);

      ctx.rotate(-this.radians(confetto.angle));
      ctx.translate(-confetto.x - confetto.w / 2, -confetto.y - confetto.h / 2);

      confetto.sx += this.radians(5);
      confetto.sy += this.radians(5);

      confetto.x += confetto.vx;
      confetto.vy += confetto.gravity;
      confetto.y += confetto.vy;

      confetto.angle += confetto.rot;

      if (confetto.y - confetto.h > ctx.canvas.height) {
        this.confetti.splice(i, 1);
      }
    }

    ctx.restore();
  }

  private random(max: number, min: number = 0): number {
    return Math.random() * (max - min) + min;
  }

  private radians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  public draw() {
    this.runConfetti(this.ctx);
    requestAnimationFrame(this.draw);
  }
}
