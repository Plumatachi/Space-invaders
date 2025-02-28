import {Player} from "../entities/Player.ts";
import {Enemy} from "../entities/Enemy.ts";
import {Health} from "../components/Health.ts";
import {LevelManager} from "./LevelManager.ts";
import {Bullet} from "../entities/Bullet.ts";
import {GameDataKeys} from "../GameDataKeys.ts";
import {PowerUpManager} from "./PowerUpManager.ts";
import {PowerUp} from "../entities/PowerUp.ts";
import {Boss} from "../entities/Boss.ts";

export class CollisionManager {
    private scene: Phaser.Scene;
    private levelManager: LevelManager;
    private powerUpManager: PowerUpManager;

    public constructor(scene: Phaser.Scene, levelManager: LevelManager, powerUpManager: PowerUpManager) {
        this.scene = scene;
        this.levelManager = levelManager;
        this.powerUpManager = powerUpManager;
    }

    checkCollisionsPlayerEnemies(player: Player, enemies: Phaser.Physics.Arcade.Group, playerBullets: Phaser.Physics.Arcade.Group, enemiesBullets: Phaser.Physics.Arcade.Group){
        this.scene.physics.add.collider(player, enemies,
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

        this.scene.physics.add.collider(playerBullets, enemies,
            (bullet, enemy) => {
                (bullet as Bullet).disable();
                const x = (enemy as Enemy).x;
                const y = (enemy as Enemy).y;
                (enemy as Enemy).disable();
                (enemy as Enemy).changeVelocity(0, 0);
                this.scene.registry.inc(GameDataKeys.PLAYER_SCORE, 1);
                this.levelManager.registerKill();

                this.powerUpManager.spawnPowerUp(x, y);
            }
        );

        this.scene.physics.add.collider(playerBullets, enemiesBullets,
            (bullet, enemyBullet) => {
                (bullet as Bullet).disable();
                (enemyBullet as Bullet).disable();
            }
        );

        this.scene.physics.add.collider(player, enemiesBullets,
            (player, enemyBullet) => {
                if (!(player as Player).isInvincible()) {
                    (player as Player).getComponent(Health)?.inc(-1);
                    (player as Player).changeVelocity(0, 0);
                }
                (enemyBullet as Bullet).disable();
            }
        );
    }

    checkCollisionsPlayerPowerUp(player: Player, powerUp: PowerUp) {
        this.scene.physics.add.collider(powerUp, player, (powerUp, player) => {
            (powerUp as PowerUp).applyEffect((player as Player), (powerUp as PowerUp));
            (powerUp as PowerUp).disable();
            (player as Player).setVelocity(0, 0);
        });
    }

    checkCollisionsPlayerBoss(player: Player, boss: Boss, playerBullets: Phaser.Physics.Arcade.Group, bossBullets:Phaser.Physics.Arcade.Group) {
        this.scene.physics.add.overlap(player, boss,
            (player, boss) => {
                (player as Player).getComponent(Health)?.inc(-2);
                (boss as Boss).takeDamage(-1);
            }
        );

        this.scene.physics.add.overlap(boss, playerBullets,
            (boss, bullet) => {
                (boss as Boss).takeDamage(-1);
                (bullet as Bullet).disable();

            }
        );

        this.scene.physics.add.overlap(player, bossBullets,
            (player, bossBullet) => {
                (player as Player).getComponent(Health)?.inc(-3);
                (bossBullet as Bullet).disable();
            }
        );

        this.scene.physics.add.collider(playerBullets, bossBullets,
            (bullet, bossBullet) => {
                (bullet as Bullet).disable();
                (bossBullet as Bullet).disable();
            }
        );
    }
}