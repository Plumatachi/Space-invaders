import {Entity} from "./Entity.ts";
import {WeaponComponent} from "../components/WeaponComponent.ts";

export class Player extends Entity {
    private playerShipData: PlayerShipData;
    private playerRateOfFire: number;
    private lastShotTime: number;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, bullets: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture);

        this.playerRateOfFire = 0.5;
        this.lastShotTime = 0;

        this.setScale(6, 6);
        this.setOrigin(0.5);
        this.setAngle(-90);

        this.addComponent(new WeaponComponent(bullets, scene.sound.add('sfx_laser1'), 4, 12, 1024));
        this.selectPlayerShip(1);

        if (this.scene.input.keyboard) {
            this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
        }

        if(this.scene.input.keyboard) {
            this.cursorKeys = this.scene.input.keyboard.createCursorKeys();

            this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE).on('down', () => {
                this.selectPlayerShip(1);
            });
            this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO).on('down', () => {
                this.selectPlayerShip(2);
            });
            this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE).on('down', () => {
                this.selectPlayerShip(3);
            });
        }
    }

    private selectPlayerShip (playerShipId: number) {
        const playerShipsData = this.scene.cache.json.get("playerShips") as PlayerShipsData;
        this.playerShipData = playerShipsData[playerShipId];

        this.setTexture(this.playerShipData.texture);
        this.arcadeBody.setCircle(9, 0, 26);
        this.arcadeBody.updateCenter();
    }

    public update(timeSinceLaunch: number, deltaTime: number) {
        let moveX = 0;
        let moveY = 0;

        if (this.playerShipData) {
            /*if (this.gamepad) {
                moveX = this.gamepad.axes[0].getValue();
                moveY = this.gamepad.axes[1].getValue();
            }*/

            if (this.cursorKeys.left.isDown) {
                this.x -= this.playerShipData.movementSpeed * deltaTime;
            }
            if (this.cursorKeys.right.isDown) {
                this.x += this.playerShipData.movementSpeed * deltaTime;
            }
            if (this.cursorKeys.down.isDown) {
                this.y += this.playerShipData.movementSpeed * deltaTime;
            }
            if (this.cursorKeys.up.isDown) {
                this.y -= this.playerShipData.movementSpeed * deltaTime;
            }

            if (this.cursorKeys.space.isDown && timeSinceLaunch - this.lastShotTime > this.playerRateOfFire * 1000) {
                this.getComponent(WeaponComponent)?.shoot(this, this.rotation);
                this.lastShotTime = timeSinceLaunch;
            }

            /*if ((this.cursorKeys.space.isDown || (this.gamepad && this.gamepad.buttons[0].pressed)) &&
                timeSinceLaunch - this.lastShotTime > this.playerRateOfFire * 1000) {
                this.shootBullet();
                this.lastShotTime = timeSinceLaunch;
            }*/
        }

        this.x = Phaser.Math.Clamp(this.x, this.displayWidth/2, this.scene.cameras.main.width - this.displayWidth/2);
        this.y = Phaser.Math.Clamp(this.y, this.displayHeight/2, this.scene.cameras.main.height - this.displayHeight/2);
    }
}