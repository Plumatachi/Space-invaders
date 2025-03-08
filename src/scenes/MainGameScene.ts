import { Scene } from 'phaser';
import {GameDataKeys} from "../GameDataKeys.ts";
import {LevelManager} from "../services/LevelManager.ts";
import {EnemyManager} from "../services/EnemyManager.ts";
import {PlayerManager} from "../services/PlayerManager.ts";
import {CollisionManager} from "../services/CollisionManager.ts";
import {PowerUpManager} from "../services/PowerUpManager.ts";
import {Boss} from "../entities/Boss.ts";
import {AssetManager} from "../services/AssetManager.ts";

export class MainGameScene extends Scene
{
    private levelManager: LevelManager;
    private enemyManager: EnemyManager;
    private playerManager: PlayerManager;
    private collisionManager: CollisionManager;
    private powerUpManager: PowerUpManager;

    private bg: Phaser.GameObjects.TileSprite;
    private backgroundElements: Phaser.GameObjects.Group;
    private backgroundTimer: number;
    private scoreText: Phaser.GameObjects.Text;
    private levelText: Phaser.GameObjects.Text;
    private shootIndicator: Phaser.GameObjects.Sprite;

    constructor ()
    {
        super('MainGameScene');
    }

    preload ()
    {
        AssetManager.loadAssets(this);
    }

    create () {
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);

        this.backgroundElements = this.add.group();
        this.backgroundTimer = 0;
        this.input.keyboard?.addKey('R').once('down', () => {
            this.scene.restart();
        });

        this.levelManager = new LevelManager(this);
        this.enemyManager = new EnemyManager(this, this.levelManager);
        this.levelManager.setEnemyManager(this.enemyManager);
        this.playerManager = new PlayerManager(this);
        this.powerUpManager = new PowerUpManager(this);
        this.collisionManager = new CollisionManager(this, this.levelManager, this.powerUpManager);
        this.registry.set('level', this.levelManager.getLevel());

        this.events.once('bossSpawned', () => {
            this.collisionManager.checkCollisionsPlayerBoss(
                this.playerManager.getPlayer(),
                this.enemyManager.getBoss(),
                this.playerManager.getPlayerBullets(),
                this.enemyManager.getBossBullets()
            );
        });

        if (this.levelManager.getLevel() % 10 === 0) {
            this.enemyManager.spawnBoss(this.playerManager.getPlayer());
        } else {
            this.time.addEvent({
                delay: 1500,
                callback: () => this.enemyManager.spawnEnemy(),
                loop: true
            });
            this.collisionManager.checkCollisionsPlayerEnemies(this.playerManager.getPlayer(), this.enemyManager.getEnemies(), this.playerManager.getPlayerBullets(), this.enemyManager.getEnemyBullets());
            this.collisionManager.checkCollisionsPlayerPowerUp(this.playerManager.getPlayer(), this.powerUpManager.getPowerUps());
        }

        this.cameras.main.setBackgroundColor(0xF3E9D2);

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
        this.playerManager.updateHealthDisplay();

        if (this.playerManager.getPlayer().canShoot()) {
            this.shootIndicator.setFrame(0);
        } else {
            this.shootIndicator.setFrame(1);
        }
    }

    spawnWave() {
        this.enemyManager.spawnWave();
    }

    spawnBoss() {
        this.enemyManager.spawnBoss(this.playerManager.getPlayer());
    }
}
