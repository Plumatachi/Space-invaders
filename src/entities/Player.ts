import {Entity} from "./Entity.ts";
import {WeaponComponent} from "../components/WeaponComponent.ts";
import {Movement} from "../components/Movement.ts";
import {Health} from "../components/Health.ts";

export class Player extends Entity {
    public playerShipData: PlayerShipData;
    private lastShotTime: number;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, bullets: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture);

        this.scene = scene;
        const playerShipsData = this.scene.cache.json.get("playerShips") as PlayerShipsData;
        this.playerShipData = playerShipsData[texture];

        this.setTexture(this.playerShipData.texture);
        this.arcadeBody.setCircle(this.playerShipData.body.radius, this.playerShipData.body.offsetX, this.playerShipData.body.offsetY);
        this.arcadeBody.updateCenter();

        this.lastShotTime = 0;

        this.setScale(6, 6);
        this.setOrigin(0.5);
        this.setAngle(-90);

        this.addComponent(new WeaponComponent(bullets, scene.sound.add('sfx_laser1'), 4, 12, 1024));
        this.addComponent(new Movement());
        this.addComponent(new Health(this.playerShipData.health));
        this.getComponent(Movement)?.setSpeed(this.playerShipData.movementSpeed);

        if(this.scene.input.keyboard) {
            this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
        }
    }

    preUpdate(timeSinceLaunch: number, deltaTime: number) {
        if (this.playerShipData) {
            if (this.cursorKeys.left.isDown) {
                this.getComponent(Movement)?.moveHorizontally(this, -deltaTime);
            }
            if (this.cursorKeys.right.isDown) {
                this.getComponent(Movement)?.moveHorizontally(this, deltaTime);
            }
            if (this.cursorKeys.down.isDown) {
                this.getComponent(Movement)?.moveVertically(this, deltaTime);
            }
            if (this.cursorKeys.up.isDown) {
                this.getComponent(Movement)?.moveVertically(this, -deltaTime);
            }

            if (this.cursorKeys.space.isDown && timeSinceLaunch - this.lastShotTime > this.playerShipData.rateOfFire * 1000) {
                this.getComponent(WeaponComponent)?.shoot(this, this.rotation);
                this.lastShotTime = timeSinceLaunch;
            }

            this.scene.registry.set('player', this);
        }

        this.x = Phaser.Math.Clamp(this.x, this.displayWidth/2, this.scene.cameras.main.width - this.displayWidth/2);
        this.y = Phaser.Math.Clamp(this.y, this.displayHeight/2, this.scene.cameras.main.height - this.displayHeight/2);
    }

    public canShoot(): boolean {
        return this.scene.time.now - this.lastShotTime > this.playerShipData.rateOfFire * 1000;
    }

    public powerUpApplied(effect: string, effectValue: string, duration: number) {
        switch (effect) {
            case 'rapidfire':
                this.playerShipData.rateOfFire = JSON.parse(effectValue);
                setTimeout(() => {
                    this.playerShipData.rateOfFire = 1;
                }, duration);
                break;
            case 'bigbullets':
                this.getComponent(WeaponComponent)?.modifyBullet(JSON.parse(effectValue), false);
                setTimeout(() => {
                    this.getComponent(WeaponComponent)?.modifyBullet(4, false);
                }, duration);
                break;
            case 'speed':
                const originalSpeed = this.playerShipData.movementSpeed;
                this.playerShipData.movementSpeed += JSON.parse(effectValue);
                setTimeout(() => {
                    this.playerShipData.movementSpeed = originalSpeed;
                }, duration);
                break;
            case 'invincibility':
                this.playerShipData.invincible = true;
                setTimeout(() => {
                    this.playerShipData.invincible = false;
                }, duration);
                break;
            default:
                break;
        }
    }

    public isInvincible() {
        return this.playerShipData.invincible;
    }
}