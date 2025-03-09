import { EnemyManager } from "../services/EnemyManager.ts";
import { AssetManager } from "../services/AssetManager.ts";
import {LevelManager} from "../services/LevelManager.ts";
import {PlayerManager} from "../services/PlayerManager.ts";

export class TutoScene extends Phaser.Scene {
    private bg: Phaser.GameObjects.TileSprite;
    private playerManager!: PlayerManager;
    private enemyManager!: EnemyManager;
    private levelManager!: LevelManager;
    private hasMoved = false;
    private hasShot = false;
    private instructionsText!: Phaser.GameObjects.Text;

    constructor() {
        super("TutoScene");
    }

    preload() {
        AssetManager.loadAssets(this);
    }

    create() {
        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);

        this.instructionsText = this.add.text(this.cameras.main.centerX, 100, "Use Arrow keys to move", {
            fontFamily: "font",
            fontSize: "40px",
            color: "#88D498",
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.centerX, this.cameras.main.height - 50, "Press S to skip the tuto",
            {
                fontFamily: "font",
                fontSize: "30px",
                color: "#88D498",
            }
        ).setOrigin(0.5);

        this.playerManager = new PlayerManager(this);
        this.levelManager = new LevelManager(this);
        this.enemyManager = new EnemyManager(this, this.levelManager);

        this.input.keyboard?.on("keydown", this.checkPlayerMovement, this);

        this.input.keyboard?.once("keydown-S", () => {
            this.scene.start("MainGameScene");
        });

        this.physics.add.overlap(this.playerManager.getPlayerBullets(), this.enemyManager.getEnemies(), this.onEnemyHit, undefined, this);
    }

    private checkPlayerMovement() {
        if (!this.hasMoved) {
            this.hasMoved = true;

            this.tweens.add({
                targets: this.instructionsText,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.instructionsText.setText("Appuie sur ESPACE pour tirer");
                    this.instructionsText.setAlpha(1);
                }
            });

            this.time.delayedCall(500, () => this.spawnEnemy());
        }
    }


    private spawnEnemy() {
        this.enemyManager.spawnEnemy();
    }

    private onEnemyHit(bullet: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
        if (!this.hasShot) {
            this.hasShot = true;
            bullet.destroy();
            enemy.destroy();
            this.instructionsText.setText("Well done! Now... Let the game begin!");
            this.time.delayedCall(1000, () => this.scene.start("MainGameScene"));
        }
    }
}
