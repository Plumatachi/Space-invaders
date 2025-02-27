import { Entity } from "./Entity";
import { Health } from "../components/Health";
import {WeaponComponent} from "../components/WeaponComponent.ts";

export class Boss extends Entity {
    private health: Health;
    private attackPatternIndex: number = 0;
    private attackPatterns: (() => void)[];

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, bossBullets: Phaser.Physics.Arcade.Group) {
        super(scene, x, y, texture);

        this.health = new Health(100);
        this.addComponent(this.health);
        this.addComponent(new WeaponComponent(bossBullets, 'sfx_laser2.ogg', 6, 15, 1024));

        this.attackPatterns = [
            this.shootStraight,
            this.shootSpread,
            this.shootWave
        ];

        this.initBoss();
    }

    private initBoss() {
        this.arcadeBody.setCollideWorldBounds(true);
        this.arcadeBody.setVelocity(0, 0);
        this.scene.time.addEvent({
            delay: 2000,
            callback: this.executeAttackPattern,
            callbackScope: this,
            loop: true
        });
    }

    private executeAttackPattern() {
        this.attackPatterns[this.attackPatternIndex].call(this);
        this.attackPatternIndex = (this.attackPatternIndex + 1) % this.attackPatterns.length;
    }

    private shootStraight() {
        this.shootBullet(0);
    }

    private shootSpread() {
        this.shootBullet(-30);
        this.shootBullet(0);
        this.shootBullet(30);
    }

    private shootWave() {
        for (let i = -2; i <= 2; i++) {
            this.scene.time.delayedCall(i * 100, () => this.shootBullet(i * 20));
        }
    }

    private shootBullet(angleOffset: number) {
        const bullet = this.getComponent(WeaponComponent);
        if (bullet) {
            bullet.shoot(this, angleOffset);
        }
    }

    public takeDamage(amount: number) {
        this.health.inc(-amount);
        if (this.health.getCurrentHealth() <= 0) {
            this.die();
        }
    }

    private die() {
        this.disableBody(true, true);
        this.scene.registry.inc("player_score", 50);
    }
}
