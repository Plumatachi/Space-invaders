import {Bullet} from "../entities/Bullet.ts";
import {Entity} from "../entities/Entity.ts";

export class WeaponComponent implements IComponent {
    private bullets: Phaser.Physics.Arcade.Group;
    private shootSoundKey: Phaser.Sound.BaseSound;
    private bulletWidth: number;
    private bulletHeight: number;
    private bulletSpeed: number;

    public constructor(bulletsGroup: Phaser.Physics.Arcade.Group, shootSoundKey: Phaser.Sound.BaseSound, bulletWidth: number, bulletHeight: number, bulletSpeed: number) {
        this.bullets = bulletsGroup;
        this.shootSoundKey = shootSoundKey;
        this.bulletWidth = bulletWidth;
        this.bulletHeight = bulletHeight;
        this.bulletSpeed = bulletSpeed;
    }

    public shoot(entity: Entity, angle: number) {
        const bullet: Bullet = this.bullets.get() as Bullet;
        if (bullet) {
            // const angle = entity.rotation;
            const forwardX = Math.cos(angle);
            const forwardY = Math.sin(angle);
            const velocityX = forwardX * this.bulletSpeed;
            const velocityY = forwardY * this.bulletSpeed;

            bullet.enable(entity.x, entity.y, this.bulletWidth, this.bulletHeight, velocityX, velocityY);
        }
    }
}