import { Entity } from "./Entity";
import { Health } from "../components/Health";
import {WeaponComponent} from "../components/WeaponComponent.ts";

export class Boss extends Entity {
    private health: Health;
    private attackPatternIndex: number = 0;
    private attackPatterns: (() => void)[];
    private timer: Phaser.Time.TimerEvent;
    private attackInterval: number;
    private numBullets: number;
    private player: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, bossBullets: Phaser.Physics.Arcade.Group, player: Phaser.GameObjects.Sprite) {
        super(scene, x, y, texture);
        this.player = player;

        this.health = new Health(100);
        this.addComponent(this.health);
        this.addComponent(new WeaponComponent(bossBullets, 'sfx_laser2.ogg', 6, 15, 1024));

        this.attackPatterns = [
            this.shootStraight,
            this.shootSpread,
            this.shootWave
        ];
        this.attackInterval = 1000;
        this.numBullets = 10;

        this.init();
    }

    private init() {
        this.arcadeBody.setVelocity(0, 0);
        this.timer = this.scene.time.addEvent({
            delay: 2000,
            callback: this.executeAttackPattern,
            callbackScope: this,
            loop: true
        });
    }

    public startMoving() {
        const screenWidth = this.scene.cameras.main.width;
        const margin = 50;

        const minX = margin;
        const maxX = screenWidth - margin;

        this.scene.tweens.add({
            targets: this,
            x: { from: this.x, to: minX },
            duration: 3000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this,
                    x: { from: minX, to: maxX },
                    duration: 3000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }

    private executeAttackPattern() {
        this.attackPatterns[this.attackPatternIndex].call(this);
        this.attackPatternIndex = (this.attackPatternIndex + 1) % this.attackPatterns.length;
    }

    private getPlayerAngle(): number {
        if (!this.player) return Math.PI / 2;
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        return Math.atan2(dy, dx);
    }

    private shootStraight() {
        this.shootBullet(this.getPlayerAngle());
    }

    private shootSpread() {
        const numBullets = 5;
        const angleStep = 0.2;
        const baseAngle = this.getPlayerAngle();
        for (let i = 0; i < numBullets; i++) {
            const angle = baseAngle + (i - Math.floor(numBullets / 2)) * angleStep;
            this.shootBullet(angle);
        }
    }

    private shootWave() {
        const numBullets = 10;
        const angleStep = 0.1;
        const baseAngle = this.getPlayerAngle();
        const delay = 50;
        for (let i = 0; i < numBullets; i++) {
            this.scene.time.delayedCall(i * delay, () => {
                const angle = baseAngle + (i - Math.floor(numBullets / 2)) * angleStep;
                this.shootBullet(angle);
            });
        }
    }

    private shootBullet(angleOffset: number) {
        const bullet = this.getComponent(WeaponComponent);
        if (bullet) {
            bullet.shoot(this, angleOffset);
        }
    }

    public takeDamage(amount: number) {
        this.health.inc(amount);
        if (this.health.getCurrentHealth() <= 0) {
            this.die();
        }
    }

    private die() {
        this.disableBody(true, true);
        this.timer.remove();
        this.scene.registry.inc("player_score", 50);
    }
}
