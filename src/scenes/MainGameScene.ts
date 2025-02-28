import { Scene } from 'phaser';
import { Bullet } from '../entities/Bullet';
import {GroupUtils} from "../utils/GroupUtils.ts";
import {Player} from "../entities/Player.ts";
import {Enemy} from "../entities/Enemy.ts";
import {GameDataKeys} from "../GameDataKeys.ts";
import {Health} from "../components/Health.ts";
import {LevelManager} from "../components/LevelManager.ts";
import {Boss} from "../entities/Boss.ts";
import {PowerUp} from "../entities/PowerUp.ts";

export class MainGameScene extends Scene
{
    private playerBullets: Phaser.Physics.Arcade.Group;
    private enemies: Phaser.Physics.Arcade.Group;
    private enemiesData: EnemiesData;
    private enemiesBullets: Phaser.Physics.Arcade.Group;
    private levelManager: LevelManager;
    private bossBullets: Phaser.Physics.Arcade.Group;
    private heartsGroup: Phaser.GameObjects.Group;
    private boss: Boss;
    private bossIsActive: boolean = false;

    private bg: Phaser.GameObjects.TileSprite;
    private backgroundElements: Phaser.GameObjects.Group;
    private backgroundTimer: number;
    private player: Phaser.GameObjects.Sprite;
    private scoreText: Phaser.GameObjects.Text;
    private levelText: Phaser.GameObjects.Text;
    private shootIndicator: Phaser.GameObjects.Sprite;

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
        this.load.image('blue_planet', 'background/Blue_planet.png');
        this.load.image('green_planet', 'background/Green_planet.png');
        this.load.image('pink_planet', 'background/Pink_planet.png');
        this.load.image('sand_planet', 'background/Sand_planet.png');
        this.load.image('green_cloud', 'background/Green_cloud.png');
        this.load.image('black_void', 'background/Black_void.png');
        this.load.image('player', 'player/Player_ship.png');
        this.load.image('player_blue', 'player/Player_ship_blue.png');
        this.load.image('player_yellow', 'player/Player_ship_yellow.png');
        this.load.image('boss', 'enemies/Boss.png');
        this.load.image('heart_full', 'UI/heart_full.png');

        this.load.spritesheet('alan', 'enemies/Alan.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('bon_bon', 'enemies/Bon_Bon.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('lips', 'enemies/Lips.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('player_bullets', 'bullets/Player_charged_beam.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemies_bullets', 'bullets/Enemy_projectile.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('boss_bullets', 'bullets/Boss_bullets.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('shoot_indicator', 'UI/shoot_indicator.png', { frameWidth: 32, frameHeight: 16 });
        this.load.spritesheet('power_up', 'UI/power_up.png', { frameWidth: 16, frameHeight:16 });

        this.load.audio('sfx_laser1', 'Sounds/sfx_laser1.ogg');
        this.load.audio('sfx_laser2', 'Sounds/sfx_laser2.ogg');

        this.load.json('playerShips', 'Data/playerShips.json');
        this.load.json('enemies', 'Data/enemies.json');
        this.load.json('powerUps', 'Data/powerUps.json');
    }

    create () {
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);

        this.bossIsActive = false;
        this.backgroundElements = this.add.group();
        this.backgroundTimer = 0;

        this.enemiesData = this.cache.json.get('enemies') as EnemiesData;
        this.levelManager = new LevelManager(this);
        this.registry.set('level', this.levelManager.getLevel());

        if (this.levelManager.getLevel() % 10 === 0) {
            this.spawnBoss();
        } else {
            this.time.addEvent({
                delay: 1500,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }

        this.input.keyboard?.addKey('R').once('down', () => {
            this.scene.restart();
        });

        this.bossBullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            maxSize: 20,
            createCallback: (bullet) => {
                (bullet as Bullet).init();
                (bullet as Bullet).play('boss_bullets_idle');
            }
        });

        this.playerBullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            createCallback: (bullet) => {
                (bullet as Bullet).init();
                (bullet as Bullet).play('player_bullets_idle');
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

        this.heartsGroup = this.add.group();
        this.updateHeartsDisplay();
        this.addAnimations();
        this.cameras.main.setBackgroundColor(0xF3E9D2);
        this.addGroupsInPhysics();
        this.initGroupCollision();

        this.shootIndicator = this.add.sprite(20, 50, 'shoot_indicator').setOrigin(0, 0).setScale(6, 6);
        this.scoreText = this.add.text(this.cameras.main.width - 50, 15, `Score: 0`, { fontFamily: 'font', fontSize: '35px' }).setOrigin(1, 0);
        this.levelText = this.add.text(this.cameras.main.width - 50, 50, `Niveau: ${this.levelManager.getLevel()}`, {
            fontFamily: 'font',
            fontSize: '35px'
        }).setOrigin(1, 0);

        this.registry.set<number>(GameDataKeys.PLAYER_SCORE, 0);
        this.registry.events.on('changedata-' + GameDataKeys.PLAYER_SCORE,
            (_: any, value: number) => {
                this.scoreText.setText(`Score: ${value}`);
            }
        );
    }

    private updateHeartsDisplay() {
        this.heartsGroup.clear(true, true);
        let health = (this.player as Player).getComponent(Health)?.getCurrentHealth();

        for (let i = 0; i < health; i++) {
            let heart = this.add.image(20 + i * (32 + 5), 20, 'heart_full');
            heart.setScale(32/heart.width, 32/heart.height);

            this.heartsGroup.add(heart);
        }
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

        this.anims.create({
          key: 'boss_bullets_idle',
          frames: this.anims.generateFrameNumbers('boss_bullets', { start: 0, end: 4 }),
          frameRate: 8,
          repeat: -1
        });

        this.anims.create({
            key: 'power_up_idle',
            frames: this.anims.generateFrameNumbers('power_up', { start: 0, end: 3 }),
            frameRate: 4,
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
                const x = (enemy as Enemy).x;
                const y = (enemy as Enemy).y;
                (enemy as Enemy).disable();
                (enemy as Enemy).changeVelocity(0, 0);
                this.registry.inc(GameDataKeys.PLAYER_SCORE, 1);
                this.levelManager.registerKill();

                this.spawnPowerUp(x, y);
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
                if (!(player as Player).isInvincible()) {
                    (player as Player).getComponent(Health)?.inc(-1);
                    (player as Player).changeVelocity(0, 0);
                }
                (enemyBullet as Bullet).disable();
            }
        );

        this.physics.add.collider(this.player, this.enemies,
            (player, enemy) => {
                if (!(player as Player).isInvincible()) {
                    (player as Player).getComponent(Health)?.inc(-1);
                }
                const enemyHealth = (enemy as Enemy).getComponent(Health);
                enemyHealth?.inc(-enemyHealth?.getMaxHealth());
                (player as Player).changeVelocity(0, 0);
                this.levelManager.registerKill();
            }
        );
    }

    spawnBackgroundElement() {
        const backgroundTextures = [
            'blue_planet', 'green_planet', 'pink_planet', 'sand_planet',
            'green_cloud', 'black_void'
        ];

        const texture = Phaser.Utils.Array.GetRandom(backgroundTextures);

        const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
        const y = -500;

        const element = this.add.image(x, y, texture);
        element.setScale(Phaser.Math.FloatBetween(4, 7));
        element.setAlpha(Phaser.Math.FloatBetween(0.5, 1));

        this.backgroundElements.add(element);

        this.tweens.add({
            targets: element,
            y: this.cameras.main.height + 100,
            duration: Phaser.Math.Between(8000, 15000),
            onComplete: () => {
                element.destroy();
            }
        });
    }


    update(timeSinceLaunch: number, deltaTime: number) {
        this.bg.tilePositionY -= 0.1 * deltaTime;
        this.backgroundTimer += deltaTime;

        if (this.backgroundTimer > Phaser.Math.Between(5000, 10000)) {
            this.spawnBackgroundElement();
            this.backgroundTimer = 0;
        }

        this.levelText.setText(`Niveau: ${this.registry.get('level')}`);
        this.updateHeartsDisplay();

        if ((this.player as Player).canShoot()) {
            this.shootIndicator.setFrame(0);
        } else {
            this.shootIndicator.setFrame(1);
        }

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
        if (this.bossIsActive || this.enemies.countActive(true) >= this.levelManager.getMaxEnemiesPerWave()) {
            return;
        }

        const enemyKeys = Object.keys(this.enemiesData);
        const randomKey = Phaser.Utils.Array.GetRandom(enemyKeys);
        const enemyData = this.enemiesData[randomKey];

        const enemy = this.enemies.get() as Enemy;
        enemy.init(enemyData.texture, this.enemiesBullets, enemyData.movementSpeed + (this.levelManager.getLevel() * 0.1));
        enemy.enable();
    }

    public spawnWave(): void {
        const numEnemies = 10 + (this.levelManager.getLevel() * 2);

        for (let i = 0; i < numEnemies; i++) {
            this.showWarning("⚠️ Alien horde incoming !! ⚠️");
            this.time.delayedCall(i * 300, () => {
                this.spawnEnemy();
            });
        }
    }

    private spawnBoss() {
        this.bossIsActive = true;

        this.enemies.getChildren().forEach((enemy) => {
            (enemy as Enemy).disable();
        });

        this.cameras.main.shake(300, 0.01);
        this.showWarning("⚠️ Boss Incoming !! ⚠️");

        this.time.delayedCall(2000, () => {
            this.boss = new Boss(this, this.cameras.main.centerX, -300, 'boss', this.bossBullets, this.player);
            this.boss.setScale(8);

            this.tweens.add({
                targets: this.boss,
                y: this.cameras.main.centerY - 400,
                duration: 2000,
                ease: 'power2',
                onComplete: () => {
                    this.boss.startMoving();
                },
            });

            (this.boss as Boss).getComponent(Health)?.once('death', () => {
                this.bossIsActive = false;
            });

            this.physics.add.overlap(this.player, this.boss,
                (player, boss) => {
                    (player as Player).getComponent(Health)?.inc(-2);
                    (boss as Boss).takeDamage(-1);
                }
            );

            this.physics.add.overlap(this.boss, this.playerBullets,
                (boss, bullet) => {
                    (boss as Boss).takeDamage(-1);
                    (bullet as Bullet).disable();

                }
            );

            this.physics.add.overlap(this.player, this.bossBullets,
                (player, bossBullet) => {
                    (player as Player).getComponent(Health)?.inc(-3);
                    (bossBullet as Bullet).disable();
                }
            );

            this.physics.add.collider(this.playerBullets, this.bossBullets,
                (bullet, bossBullet) => {
                    (bullet as Bullet).disable();
                    (bossBullet as Bullet).disable();
                }
            );
        });
    }

    private spawnPowerUp(x: number, y: number) {
        if (Phaser.Math.Between(0, 10) > 7) {
            const powerUpsData = this.cache.json.get('powerUps');
            const randomPowerUp = Phaser.Utils.Array.GetRandom(powerUpsData);

            const powerUp = new PowerUp(this, x, y, randomPowerUp);
            this.add.existing(powerUp);
            this.physics.add.existing(powerUp);

            powerUp.setVelocity(0, 100);

            this.physics.add.collider(powerUp, this.player,
                (powerUp, player) => {
                    (powerUp as PowerUp).applyEffect((player as Player), (powerUp as PowerUp));
                    (powerUp as PowerUp).disable();
                    (player as Player).setVelocity(0, 0);
                });
        }
    }


    private showWarning(message: string): void {
        const warningText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, message, {
            fontFamily: 'font',
            fontSize: "48px",
            color: "#ff0000",
            fontStyle: "bold",
            align: "center"
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            warningText.destroy();
        });
    }
}
