import { Scene } from 'phaser';
import GameObject = Phaser.GameObjects.GameObject;

export class MainGameScene extends Scene
{
    private playerCenter: Phaser.GameObjects.Arc;
    private playerMovementSpeed: number = 0.9;
    private playerRateOfFire: number = 0.5;
    private lastShotTime: number = 0;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private playerBullets: Phaser.Physics.Arcade.Group;
    private enemies: Phaser.Physics.Arcade.Group;
    private enemiesBullets: Phaser.Physics.Arcade.Group;
    private score: number;

    private bg: Phaser.GameObjects.TileSprite;
    private planet: Phaser.GameObjects.Image;
    private player: Phaser.GameObjects.Sprite;

    constructor ()
    {
        super('MainGameScene');
    }

    preload ()
    {
        this.load.setPath('assets');

        this.load.image('bg', 'background/Space_BG.png');
        this.load.image('planet', 'background/planet.png');
        this.load.image('player', 'player/Player_ship.png');
        this.load.spritesheet('enemy', 'enemies/Alan.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('player_bullets', 'bullets/Player_charged_beam.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemies_bullets', 'bullets/Enemy_projectile.png', { frameWidth: 16, frameHeight: 16 });
    }

    create ()
    {
        // https://coolors.co/114b5f-1a936f-88d498-c6dabf-f3e9d2
        const colorPalette: string[] = ["#0ad6de", "#00f3a6", "#88D498",
            "#C6DABF", "#FFCA00"];

        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);
        this.planet = this.add.image(0, -512, 'planet').setOrigin(0);
        this.player = this.add.sprite(this.cameras.main.centerX, this.cameras.main.height - 128, 'player').setScale(6, 6).setOrigin(0.5);
        this.anims.create({
            key: 'enemy_idle',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'player_bullets_idle',
            frames: this.anims.generateFrameNumbers('player_bullets', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });

        this.score = 0;
        this.lastShotTime = 0;

        this.cameras.main.setBackgroundColor(0xF3E9D2);
        // this.player = this.add.triangle(this.cameras.main.centerX, this.cameras.main.height - 128, -1, 1, 1, 1, 0, -2, 0x00f3a6).setScale(32, 32).setOrigin(0);
        this.playerCenter = this.add.circle(this.cameras.main.centerX, this.cameras.main.centerY, 8, 0x1A936F);

        if (this.input.keyboard) {
            this.cursorKeys = this.input.keyboard.createCursorKeys();
        }

        this.playerBullets = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.enemiesBullets = this.physics.add.group();
        this.physics.add.existing(this.player);
        this.physics.add.collider(this.playerBullets, this.enemies,
            (bullet, enemy) => {
                bullet.destroy();
                enemy.destroy();
                this.score++;
            }
        );

        this.physics.add.collider(this.playerBullets, this.enemiesBullets,
            (bullet, enemyBullet) => {
                bullet.destroy();
                enemyBullet.destroy();
            }
        );

        this.physics.add.collider(this.player, this.enemiesBullets,
            (player, enemyBullet) => {
                player.destroy();
                enemyBullet.destroy();
                this.scene.start('GameOverScene');
            }
        );

        this.physics.add.collider(this.player, this.enemies,
            (player, enemy) => {
                enemy.destroy();
                player.destroy();
                this.scene.start('GameOverScene');
            }
        );

        this.time.addEvent({
            delay: 1500,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    update(timeSinceLaunch: number, deltaTime: number) {
        this.bg.tilePositionY -= 0.1 * deltaTime;
        this.planet.y += 1;

        if (this.cursorKeys.left.isDown) {
            this.player.x -= this.playerMovementSpeed * deltaTime;
        }
        if (this.cursorKeys.right.isDown) {
            this.player.x += this.playerMovementSpeed * deltaTime;
        }
        if (this.cursorKeys.down.isDown) {
            this.player.y += this.playerMovementSpeed * deltaTime;
        }
        if (this.cursorKeys.up.isDown) {
            this.player.y -= this.playerMovementSpeed * deltaTime;
        }

        if (this.cursorKeys.space.isDown && timeSinceLaunch - this.lastShotTime > this.playerRateOfFire * 1000) {
            // let bullet: Phaser.GameObjects.Rectangle = this.add.rectangle(this.player.x, this.player.y - this.player.displayHeight/2, 4, 12, 0xFFCA00).setOrigin(0.5);
            let bullet = this.physics.add.sprite(this.player.x, this.player.y, 'player_bullets').setScale(5, 5);
            this.playerBullets.add(bullet);
            let bulletBody: Phaser.Physics.Arcade.Body = bullet.body as Phaser.Physics.Arcade.Body;
            bulletBody.allowGravity = false;
            bulletBody.setFriction(0, 0);
            bulletBody.setVelocityY(-1024);

            this.lastShotTime = timeSinceLaunch;
        }

        this.player.x = Phaser.Math.Clamp(this.player.x, this.player.displayWidth/2, this.cameras.main.width - this.player.displayWidth/2);
        this.player.y = Phaser.Math.Clamp(this.player.y, this.player.displayHeight/2, this.cameras.main.height - this.player.displayHeight/2);
        this.playerCenter.setPosition(this.player.x, this.player.y);

        this.playerBullets.getChildren().forEach(bullet => {
            if ((bullet as Phaser.GameObjects.Rectangle).y < -(bullet as Phaser.GameObjects.Rectangle).displayHeight) {
                bullet.destroy();
            }
        });

        this.enemies.getChildren().forEach(enemy => {
            if ((enemy as Phaser.GameObjects.Arc).y >= this.cameras.main.height + (enemy as Phaser.GameObjects.Arc).displayHeight) {
                enemy.destroy();
            }
        });

        this.enemiesBullets.getChildren().forEach(bullet => {
            if ((bullet as Phaser.GameObjects.Rectangle).y < -(bullet as Phaser.GameObjects.Rectangle).displayHeight) {
                bullet.destroy();
            }
        });
    }

    private spawnEnemy() {
        if (this.enemies.getLength() >= 5) {
            return;
        }

        const enemySize: number = 32;
        // let enemy: Phaser.GameObjects.Arc = this.add.circle(Phaser.Math.Between(enemySize, this.cameras.main.width - enemySize), -enemySize/2, enemySize, 0x0ad6de).setDepth(100);
        // let enemy = this.add.image(Phaser.Math.Between(enemySize, this.cameras.main.width - enemySize), -enemySize/2, 'enemy').setScale(6, 6);
        let enemy = this.physics.add.sprite(Phaser.Math.Between(enemySize, this.cameras.main.width - enemySize), -enemySize/2, 'enemy').setScale(4, 4).setDepth(100);

        enemy.play('enemy_idle');

        this.enemies.add(enemy);
        let enemyBody: Phaser.Physics.Arcade.Body = enemy.body as Phaser.Physics.Arcade.Body;
        enemyBody.allowGravity = false;
        enemyBody.setFriction(0, 0);
        enemyBody.setVelocityY(256);

        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (enemy.active) this.enemyShoot(enemy);
            },
            callbackScope: this,
            loop: true
        });

    }

    private enemyShoot(enemy: Phaser.GameObjects.Sprite) {
        // let bullet: Phaser.GameObjects.Rectangle = this.add.rectangle(enemy.x, enemy.y + enemy.displayHeight / 2, 4, 12, 0xFF0000).setOrigin(0.5);
        let bullet = this.add.image(enemy.x, enemy.y + enemy.displayHeight/2, 'enemies_bullet').setScale(5, 5);
        this.enemiesBullets.add(bullet);
        let bulletBody: Phaser.Physics.Arcade.Body = bullet.body as Phaser.Physics.Arcade.Body;
        bulletBody.allowGravity = false;
        bulletBody.setFriction(0, 0);
        bulletBody.setVelocityY(526);
    }
}
