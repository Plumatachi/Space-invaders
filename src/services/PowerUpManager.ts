import {PowerUp} from "../entities/PowerUp.ts";
import {Player} from "../entities/Player.ts";

export class PowerUpManager {
    private scene: Phaser.Scene;

    public constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    private spawnPowerUp(x: number, y: number) {
        if (Phaser.Math.Between(0, 10) > 7) {
            const powerUpsData = this.scene.cache.json.get('powerUps');
            const randomPowerUp = Phaser.Utils.Array.GetRandom(powerUpsData);

            const powerUp = new PowerUp(this.scene, x, y, randomPowerUp);
            this.scene.add.existing(powerUp);
            this.scene.physics.add.existing(powerUp);

            powerUp.setVelocity(0, 100);
        }
    }
}