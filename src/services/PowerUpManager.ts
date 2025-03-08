import {PowerUp} from "../entities/PowerUp.ts";

export class PowerUpManager {
    private scene: Phaser.Scene;
    private powerUps: Phaser.Physics.Arcade.Group;

    public constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.powerUps = this.scene.physics.add.group();
        this.addAnimations();
    }

    public spawnPowerUp(x: number, y: number) {
        if (Phaser.Math.Between(0, 10) > 7) {
            const powerUpsData = this.scene.cache.json.get('powerUps');
            const randomPowerUp = Phaser.Utils.Array.GetRandom(powerUpsData);

            const powerUp = new PowerUp(this.scene, x, y, randomPowerUp);
            this.scene.add.existing(powerUp);
            this.scene.physics.add.existing(powerUp);
            this.powerUps.add(powerUp);

            powerUp.setVelocity(0, 100);
        }
    }

    public getPowerUps() {
        return this.powerUps;
    }

    private addAnimations() {
        this.scene.anims.create({
            key: 'power_up_idle',
            frames: this.scene.anims.generateFrameNumbers('power_up', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });
    }
}