import {Entity} from "./Entity.ts";
import {WeaponComponent} from "../components/WeaponComponent.ts";
import {Movement} from "../components/Movement.ts";
import {Health} from "../components/Health.ts";

export class Player extends Entity {
    private playerShipData: PlayerShipData;
    private playerRateOfFire: number;
    private lastShotTime: number;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, bullets: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture);

        this.scene = scene;

        this.playerRateOfFire = 0.5;
        this.lastShotTime = 0;

        this.setScale(6, 6);
        this.setOrigin(0.5);
        this.setAngle(-90);

        this.addComponent(new WeaponComponent(bullets, scene.sound.add('sfx_laser1'), 4, 12, 1024));
        this.addComponent(new Movement());
        this.addComponent(new Health(10));
        this.selectPlayerShip(texture);

        if(this.scene.input.keyboard) {
            this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
        }
    }

    private selectPlayerShip (textureKey: string) {
        const playerShipsData = this.scene.cache.json.get("playerShips") as PlayerShipsData;
        this.playerShipData = playerShipsData[textureKey];

        this.setTexture(this.playerShipData.texture);
        this.arcadeBody.setCircle(this.playerShipData.body.radius, this.playerShipData.body.offsetX, this.playerShipData.body.offsetY);
        this.arcadeBody.updateCenter();

        this.getComponent(Movement)?.setSpeed(this.playerShipData.movementSpeed);
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

            if (this.cursorKeys.space.isDown && timeSinceLaunch - this.lastShotTime > this.playerRateOfFire * 1000) {
                this.getComponent(WeaponComponent)?.shoot(this, this.rotation);
                this.lastShotTime = timeSinceLaunch;
            }

            this.scene.registry.set('player', this);
        }

        this.x = Phaser.Math.Clamp(this.x, this.displayWidth/2, this.scene.cameras.main.width - this.displayWidth/2);
        this.y = Phaser.Math.Clamp(this.y, this.displayHeight/2, this.scene.cameras.main.height - this.displayHeight/2);
    }

    public canShoot(): boolean {
        return this.scene.time.now - this.lastShotTime > this.playerRateOfFire * 1000;
    }
}