import {Entity} from "./Entity.ts";
import {WeaponComponent} from "../components/WeaponComponent.ts";
import {Movement} from "../components/Movement.ts";
import {Health} from "../components/Health.ts";

export class Enemy extends Entity {

    public init(texture: string, bullets: Phaser.Physics.Arcade.Group, speed: number) {
        this.setAngle(-90);
        this.arcadeBody.allowGravity = false;
        this.arcadeBody.setFriction(0, 0);

        this.setTexture(texture);
        this.arcadeBody.setCircle(8, 0, 0);
        this.addComponent(new WeaponComponent(bullets, this.scene.sound.add('sfx_laser2'), 4, 12, 1024));
        this.addComponent(new Movement(speed));
        this.addComponent(new Health(1));
    }

    public enable() {
        this.enableBody(true, this.x, this.y, true, true);

        this.x = Phaser.Math.Between(32, this.scene.cameras.main.width - 32);
        this.y = -32/2;

        this.play(`${this.texture.key}_idle`);
        this.setScale(4, 4);
        this.setDepth(100);

        this.getComponent(Health)?.once('death', () => {
            this.disable();
        });

        this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
            this.enemyPreparesToShoot();
        }, [], this);
    }

    public disable() {
        this.disableBody(true, true);
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

    preUpdate(timeSinceLaunch: number, deltaTime: number) {
        super.preUpdate(timeSinceLaunch, deltaTime);

        this.getComponent(Movement)?.moveVertically(this, deltaTime);
    }
}