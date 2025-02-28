export class Bullet extends Phaser.Physics.Arcade.Sprite {
    public arcadeBody: Phaser.Physics.Arcade.Body;
    public isPiercing: boolean = false;

    public init() {
        this.arcadeBody = this.body as Phaser.Physics.Arcade.Body;
        this.arcadeBody.allowGravity = false;
        this.arcadeBody.setFriction(0, 0);
    }

    public enable(x: number, y: number, width: number, height: number, velocityX: number, velocityY: number) {
        this.setPosition(x, y);
        this.setSize(width, height);
        this.setOrigin(0.5);
        this.setScale(5, 5);

        this.arcadeBody.setVelocity(velocityX, velocityY);
        this.arcadeBody.setCircle(8, 0, 0);

        this.scene.physics.world.add(this.arcadeBody);
        this.setActive(true);
        this.setVisible(true);
    }

    public disable() {
        this.scene.physics.world.remove(this.arcadeBody);
        this.setActive(false);
        this.setVisible(false);
        this.arcadeBody.setEnable(false);
    }

    update(timeSinceLaunch: number, deltaTime: number) {
        super.update(timeSinceLaunch, deltaTime);

        if (this.y > this.scene.cameras.main.height + this.displayHeight
            || this.y < -this.displayHeight
            || this.x > this.scene.cameras.main.width + this.displayWidth
            || this.x < -this.displayWidth) {
            this.disable();
        }
    }

    public setBulletSize(size: number) {
        this.setScale(size, size);
    }

    public enablePiercing(bool: boolean) {
        this.isPiercing = bool;
    }
}