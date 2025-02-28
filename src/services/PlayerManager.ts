import {Player} from "../entities/Player.ts";
import {Health} from "../components/Health.ts";
import {Bullet} from "../entities/Bullet.ts";

export class PlayerManager {
    private scene: Phaser.Scene;
    private player: Player;
    private playerBullets: Phaser.Physics.Arcade.Group;
    private heartsGroup: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        this.playerBullets = this.scene.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            createCallback: (bullet) => {
                (bullet as Bullet).init();
                (bullet as Bullet).play('player_bullets_idle');
            },
            quantity: 8,
            maxSize: 256
        });

        this.createPlayer();
        // this.addAnimation();
    }

    private createPlayer() {
        const selectedShip = this.scene.registry.get('selectedShip') || 'player';
        this.player = new Player(this.scene, this.scene.cameras.main.centerX, this.scene.cameras.main.height - 128, selectedShip, this.playerBullets);
        this.setupPlayerEvents();

        this.scene.physics.add.existing(this.player);
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setOffset(-1, -2);
    }

    private setupPlayerEvents() {
        this.player.getComponent(Health)?.once('death', () => {
            this.player.disableBody(true, true);
            this.scene.scene.start('GameOverScene');
        });
    }

    public updateHealthDisplay() {
        this.heartsGroup.clear(true, true);
        let health = this.player.getComponent(Health)?.getCurrentHealth();

        for (let i = 0; i < health; i++) {
            let heart = this.scene.add.image(20 + i * (32 + 5), 20, 'heart_full');
            heart.setScale(32/heart.width, 32/heart.height);

            this.heartsGroup.add(heart);
        }
    }

    private addAnimation() {
        this.scene.anims.create({
            key: 'player_bullets_idle',
            frames: this.scene.anims.generateFrameNumbers('player_bullets', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });
    }

    public getPlayer() {
        return this.player;
    }

    public update(timeSinceLaunch: number, delta: number) {
        this.playerBullets.getChildren().forEach(bullet => {
            if ((bullet as Phaser.GameObjects.Rectangle).y < -(bullet as Phaser.GameObjects.Rectangle).displayHeight) {
                (bullet as Bullet).disable();
            }
        });
    }
}