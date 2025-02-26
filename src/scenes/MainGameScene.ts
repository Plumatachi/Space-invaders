import { Scene } from 'phaser';
import { Bullet } from '../entities/Bullet';
import {GroupUtils} from "../utils/GroupUtils.ts";
import {Player} from "../entities/Player.ts";
import {Enemy} from "../entities/Enemy.ts";
import {GameDataKeys} from "../GameDataKeys.ts";
import {Health} from "../components/Health.ts";

export class MainGameScene extends Scene
{
    private playerBullets: Phaser.Physics.Arcade.Group;
    private enemies: Phaser.Physics.Arcade.Group;
    private enemiesData: EnemiesData;
    private enemiesBullets: Phaser.Physics.Arcade.Group;

    private bg: Phaser.GameObjects.TileSprite;
    private planet: Phaser.GameObjects.Image;
    private player: Phaser.GameObjects.Sprite;
    private scoreText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('MainGameScene');
    }

    preload ()
    {
        const width: number = this.cameras.main.width;
        const y: number = this.cameras.main.centerY;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.centerX, this.cameras.main.centerY, width, 40);
        this.load.on('progress', function (value: number) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(0, y, value * width, 40);
        });
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
        });

        this.load.setPath('assets');

        this.load.image('bg', 'background/Space_BG.png');
        this.load.image('planet', 'background/planet.png');
        this.load.image('player', 'player/Player_ship.png');
        this.load.image('player_blue', 'player/Player_ship_blue.png');
        this.load.image('player_yellow', 'player/Player_ship_yellow.png');

        this.load.spritesheet('alan', 'enemies/Alan.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('bon_bon', 'enemies/Bon_Bon.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('lips', 'enemies/Lips.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('player_bullets', 'bullets/Player_charged_beam.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemies_bullets', 'bullets/Enemy_projectile.png', { frameWidth: 16, frameHeight: 16 });

        this.load.audio('sfx_laser1', 'Sounds/sfx_laser1.ogg');
        this.load.audio('sfx_laser2', 'Sounds/sfx_laser2.ogg');

        this.load.json('playerShips', 'Data/playerShips.json');
        this.load.json('enemies', 'Data/enemies.json');
    }

    create ()
    {
        // https://coolors.co/114b5f-1a936f-88d498-c6dabf-f3e9d2
        const colorPalette: string[] = ["#0ad6de", "#00f3a6", "#88D498",
            "#C6DABF", "#06e3a6"];

        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);
        this.planet = this.add.image(0, -512, 'planet').setOrigin(0);

        this.enemiesData = this.cache.json.get('enemies') as EnemiesData;

        this.input.keyboard?.addKey('R').once('down', () => {
            this.scene.restart();
        });

        this.playerBullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            defaultKey: 'player_bullets',
            defaultFrame: 'bullets/Player_charged_beam.png',
            createCallback: (bullet) => {
                (bullet as Bullet).init();
            },
            quantity: 8,
            maxSize: 256
        });

        const selectedShip = this.registry.get('selectedShip') || 'player';
        this.player = new Player(this, this.cameras.main.centerX, this.cameras.main.height - 128, selectedShip, this.playerBullets);
        (this.player as Player).getComponent(Health)?.once('death', () => {
            (this.player as Player).disableBody(true, true);
            this.scene.start('GameOverScene');
        });

        this.addAnimations();
        this.cameras.main.setBackgroundColor(0xF3E9D2);
        this.addGroupsInPhysics();
        this.initGroupCollision();

        this.registry.set<number>(GameDataKeys.PLAYER_SCORE, 0);
        this.registry.events.on('changedata-' + GameDataKeys.PLAYER_SCORE,
            (_: any, value: number) => {
                this.scoreText.setText(`Score: ${value}`);
            }
        );

        this.scoreText = this.add.text(15, 15, `Score: 0`, { fontFamily: 'font', fontSize: '35px' });

        this.time.addEvent({
            delay: 1500,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    private addAnimations() {
        Object.keys(this.enemiesData).forEach(enemyKey => {
            this.anims.create({
                key: `${enemyKey}_idle`,
                frames: this.anims.generateFrameNumbers(enemyKey, { start: 0, end: 4 }),
                frameRate: 8,
                repeat: -1
            });
        });

        this.anims.create({
            key: 'player_bullets_idle',
            frames: this.anims.generateFrameNumbers('player_bullets', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'enemies_bullet_idle',
            frames: this.anims.generateFrameNumbers('enemies_bullet', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });
    }

    private addGroupsInPhysics() {
        this.enemiesBullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            defaultKey: 'enemies_bullets',
            defaultFrame: 'bullets/Enemy_projectile.png',
            createCallback: (bullet) => {
                (bullet as Bullet).init();
            },
            quantity: 8,
            maxSize: 256
        });
        GroupUtils.preallocateGroup(this.enemiesBullets, 5);

        this.enemies = this.physics.add.group({
            classType: Enemy,
            createCallback: (enemy) => {
                (enemy as Enemy).init('alan', this.enemiesBullets, 0.2);
            }
        });

        this.physics.add.existing(this.player);
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setOffset(-1, -2);
    }

    private initGroupCollision() {
        this.physics.add.collider(this.playerBullets, this.enemies,
            (bullet, enemy) => {
                (bullet as Bullet).disable();
                (enemy as Enemy).disable();
                (enemy as Enemy).changeVelocity(0, 0);
                this.registry.inc(GameDataKeys.PLAYER_SCORE, 1);
            }
        );

        this.physics.add.collider(this.playerBullets, this.enemiesBullets,
            (bullet, enemyBullet) => {
                (bullet as Bullet).disable();
                (enemyBullet as Bullet).disable();
            }
        );

        this.physics.add.collider(this.player, this.enemiesBullets,
            (player, enemyBullet) => {
                (player as Player).getComponent(Health)?.inc(-1);
                (player as Player).changeVelocity(0, 0);
                (enemyBullet as Bullet).disable();
            }
        );

        this.physics.add.collider(this.player, this.enemies,
            (player, enemy) => {
                const enemyHealth = (enemy as Enemy).getComponent(Health);
                enemyHealth?.inc(-enemyHealth?.getMaxHealth());
                (player as Player).getComponent(Health)?.inc(-1);
                (player as Player).changeVelocity(0, 0);
            }
        );
    }

    update(timeSinceLaunch: number, deltaTime: number) {
        this.bg.tilePositionY -= 0.1 * deltaTime;
        this.planet.y += 1;

        this.playerBullets.getChildren().forEach(bullet => {
            if ((bullet as Phaser.GameObjects.Rectangle).y < -(bullet as Phaser.GameObjects.Rectangle).displayHeight) {
                (bullet as Bullet).disable();
            }
        });

        this.enemies.getChildren().forEach(enemy => {
            if ((enemy as Phaser.GameObjects.Arc).y >= this.cameras.main.height + (enemy as Phaser.GameObjects.Arc).displayHeight) {
                (enemy as Enemy).disable();
            }
        });

        this.enemiesBullets.getChildren().forEach(bullet => {
            if ((bullet as Phaser.GameObjects.Rectangle).y < -(bullet as Phaser.GameObjects.Rectangle).displayHeight) {
                (bullet as Bullet).disable();
            }
        });
    }

    private spawnEnemy() {
        if (this.enemies.countActive(true) >= 15) {
            return;
        }

        const enemyKeys = Object.keys(this.enemiesData);
        const randomKey = Phaser.Utils.Array.GetRandom(enemyKeys);
        const enemyData = this.enemiesData[randomKey];

        const enemy = this.enemies.get() as Enemy;
        enemy.init(enemyData.texture, this.enemiesBullets, enemyData.movementSpeed);
        enemy.enable();
    }
}
