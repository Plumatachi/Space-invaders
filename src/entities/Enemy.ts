import {Entity} from "./Entity.ts";
import {WeaponComponent} from "../components/WeaponComponent.ts";

export class Enemy extends Entity {
    /*public constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
    }*/

    public init(texture: string, bullets: Phaser.Physics.Arcade.Group) {
        this.setAngle(-90);
        this.arcadeBody.allowGravity = false;
        this.arcadeBody.setFriction(0, 0);

        this.setTexture(texture);
        this.arcadeBody.setCircle(8, 0, 0);
        this.addComponent(new WeaponComponent(bullets, this.scene.sound.add('sfx_laser2'), 4, 12, 1024));
    }

    public enable() {
        this.x = Phaser.Math.Between(32, this.scene.cameras.main.width - 32);
        this.y = -32/2;

        this.play('enemy_idle');
        this.arcadeBody.setVelocityY(256);
        this.setScale(4, 4);
        this.setDepth(100);

        this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
            this.enemyPreparesToShoot();
        }, [], this);
    }

    public disable() {
        this.setActive(false);
        this.setVisible(false);
        this.arcadeBody.setEnable(false);
    }

    public enemyPreparesToShoot() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                if (this.active) {
                    this.getComponent(WeaponComponent)?.shoot(this, 1.57);
                }
            }
        });
    }
}