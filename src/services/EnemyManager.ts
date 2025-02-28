import { Scene } from "phaser";
import { Enemy } from "../entities/Enemy.ts";
import { Boss } from "../entities/Boss.ts";
import { LevelManager } from "./LevelManager.ts";
import {Health} from "../components/Health.ts";
import {Bullet} from "../entities/Bullet.ts";
import {GroupUtils} from "../utils/GroupUtils.ts";

export class EnemyManager {
    private scene: Scene;
    private enemies: Phaser.Physics.Arcade.Group;
    private enemiesData: EnemiesData;
    private boss: Boss | null = null;
    private bossIsActive: boolean = false;
    private levelManager: LevelManager;
    private enemyBullets: Phaser.Physics.Arcade.Group;
    private bossBullets: Phaser.Physics.Arcade.Group;

    constructor(scene: Scene, levelManager: LevelManager) {
        this.scene = scene;
        this.levelManager = levelManager;

        this.enemyBullets = this.scene.physics.add.group({
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
        GroupUtils.preallocateGroup(this.enemyBullets, 5);

        this.bossBullets = this.scene.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
            maxSize: 20,
            createCallback: (bullet) => {
                (bullet as Bullet).init();
                (bullet as Bullet).play('boss_bullets_idle');
            }
        });

        this.enemies = this.scene.physics.add.group({
            classType: Enemy,
            createCallback: (enemy) => {
                (enemy as Enemy).init('alan', this.enemyBullets, 0.2);
            }
        });

        // this.addAnimations();
    }

    spawnEnemy() {
        if (this.bossIsActive || this.enemies.countActive(true) >= this.levelManager.getMaxEnemiesPerWave()) {
            return;
        }

        const enemyKeys = Object.keys(this.scene.cache.json.get('enemies'));
        const randomKey = Phaser.Utils.Array.GetRandom(enemyKeys);
        const enemyData = this.scene.cache.json.get('enemies')[randomKey];

        const enemy = this.enemies.get() as Enemy;
        enemy.init(enemyData.texture, this.enemyBullets, enemyData.movementSpeed + (this.levelManager.getLevel() * 0.1));
        enemy.enable();
    }

    spawnWave() {
        for (let i = 0; i < 10 + this.levelManager.getLevel() * 2; i++) {
            this.scene.time.delayedCall(i * 300, () => this.spawnEnemy());
        }
    }

    spawnBoss(player: Phaser.GameObjects.Sprite) {
        this.bossIsActive = true;
        this.scene.cameras.main.shake(300, 0.01);

        this.scene.time.delayedCall(2000, () => {
            this.boss = new Boss(this.scene, this.scene.cameras.main.centerX, -300, 'boss', this.bossBullets, player);
            this.scene.tweens.add({
                targets: this.boss,
                y: this.scene.cameras.main.centerY - 400,
                duration: 2000,
                ease: 'power2',
                onComplete: () => this.boss?.startMoving(),
            });

            this.boss.getComponent(Health)?.once('death', () => {
                this.bossIsActive = false;
            });
        });
    }

    private addAnimations() {
        Object.keys(this.enemiesData).forEach(enemyKey => {
            this.scene.anims.create({
                key: `${enemyKey}_idle`,
                frames: this.scene.anims.generateFrameNumbers(enemyKey, { start: 0, end: 4 }),
                frameRate: 8,
                repeat: -1
            });
        });

        this.scene.anims.create({
            key: 'enemies_bullet_idle',
            frames: this.scene.anims.generateFrameNumbers('enemies_bullet', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'boss_bullets_idle',
            frames: this.scene.anims.generateFrameNumbers('boss_bullets', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });
    }

    public update(timeSinceLaunch, deltaTime: number) {
        this.enemies.getChildren().forEach(enemy => {
            if ((enemy as Phaser.GameObjects.Arc).y >= this.scene.cameras.main.height + (enemy as Phaser.GameObjects.Arc).displayHeight) {
                (enemy as Enemy).disable();
            }
        });

        this.enemyBullets.getChildren().forEach(bullet => {
            if ((bullet as Phaser.GameObjects.Rectangle).y < -(bullet as Phaser.GameObjects.Rectangle).displayHeight) {
                (bullet as Bullet).disable();
            }
        });
    }
}

