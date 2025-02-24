import { Scene } from 'phaser';
import GameObject = Phaser.GameObjects.GameObject;

export class MainGameScene extends Scene
{
    private playerCenter: Phaser.GameObjects.Arc;
    private playerShipData: PlayerShipData;
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
        this.load.image('player_blue', 'player/Player_ship_blue.png');
        this.load.image('player_yellow', 'player/Player_ship_yellow.png');

        this.load.spritesheet('enemy', 'enemies/Alan.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('player_bullets', 'bullets/Player_charged_beam.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemies_bullets', 'bullets/Enemy_projectile.png', { frameWidth: 16, frameHeight: 16 });

        this.load.audio('sfx_laser1', 'Sounds/sfx_laser1.ogg');
        this.load.audio('sfx_laser2', 'Sounds/sfx_laser2.ogg');

        this.load.json('playerShips', 'Data/playerShips.json');
    }

    create ()
    {
        // https://coolors.co/114b5f-1a936f-88d498-c6dabf-f3e9d2
        const colorPalette: string[] = ["#0ad6de", "#00f3a6", "#88D498",
            "#C6DABF", "#FFCA00"];

        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);
        this.planet = this.add.image(0, -512, 'planet').setOrigin(0);
        const playerShipsData = this.cache.json.get('playerShips') as PlayerShipsData;
        this.playerShipData = playerShipsData[1];
        this.player = this.add.sprite(this.cameras.main.centerX, this.cameras.main.height - 128, this.playerShipData.texture).setScale(6, 6).setOrigin(0.5);
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

        this.anims.create({
            key: 'enemies_bullet_idle',
            frames: this.anims.generateFrameNumbers('enemies_bullet', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });

        this.score = 0;
        this.lastShotTime = 0;

        this.cameras.main.setBackgroundColor(0xF3E9D2);
        this.playerCenter = this.add.circle(this.cameras.main.centerX, this.cameras.main.centerY, 8, 0x1A936F);

        this.playerBullets = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.enemiesBullets = this.physics.add.group();
        this.physics.add.existing(this.player);
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        playerBody.setOffset(-1, -2);

        if(this.input.keyboard){
            this.cursorKeys = this.input.keyboard.createCursorKeys();

            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE).on('down', () => {
                this.selectPlayerShip(1);
            });
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO).on('down', () => {
                this.selectPlayerShip(2);
            });
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE).on('down', () => {
                this.selectPlayerShip(3);
            });
        }

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

        if (this.player && this.playerShipData) {
            if (this.cursorKeys.left.isDown) {
                this.player.x -= this.playerShipData.movementSpeed * deltaTime;
            }
            if (this.cursorKeys.right.isDown) {
                this.player.x += this.playerShipData.movementSpeed * deltaTime;
            }
            if (this.cursorKeys.down.isDown) {
                this.player.y += this.playerShipData.movementSpeed * deltaTime;
            }
            if (this.cursorKeys.up.isDown) {
                this.player.y -= this.playerShipData.movementSpeed * deltaTime;
            }

            if (this.cursorKeys.space.isDown && timeSinceLaunch - this.lastShotTime > this.playerRateOfFire * 1000) {
                let bullet = this.physics.add.sprite(this.player.x, this.player.y, 'player_bullets').setScale(5, 5);
                bullet.play("player_bullets_idle");
                this.playerBullets.add(bullet);
                let bulletBody: Phaser.Physics.Arcade.Body = bullet.body as Phaser.Physics.Arcade.Body;
                bulletBody.allowGravity = false;
                bulletBody.setFriction(0, 0);
                bulletBody.setVelocityY(-1024);

                this.sound.play('sfx_laser1');

                this.lastShotTime = timeSinceLaunch;
            }
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
        let enemy = this.physics.add.sprite(Phaser.Math.Between(enemySize, this.cameras.main.width - enemySize), -enemySize/2, 'enemy').setScale(4, 4).setDepth(100);
        enemy.play('enemy_idle');

        this.enemies.add(enemy);
        let enemyBody: Phaser.Physics.Arcade.Body = enemy.body as Phaser.Physics.Arcade.Body;
        enemyBody.allowGravity = false;
        enemyBody.setFriction(0, 0);
        enemyBody.setVelocityY(256);

        this.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
            this.enemyPreparesToShoot(enemy);
        }, [], this);
    }

    private enemyShoot(enemy: Phaser.GameObjects.Sprite) {
        let bullet = this.physics.add.sprite(enemy.x, enemy.y + enemy.displayHeight/2, 'enemies_bullets').setScale(5, 5);
        bullet.play("enemies_bullets_idle");
        this.enemiesBullets.add(bullet);
        let bulletBody: Phaser.Physics.Arcade.Body = bullet.body as Phaser.Physics.Arcade.Body;
        bulletBody.allowGravity = false;
        bulletBody.setFriction(0, 0);
        bulletBody.setVelocityY(526);

        this.sound.play('sfx_laser2');
    }

    private enemyPreparesToShoot(enemy: Phaser.Physics.Arcade.Sprite) {
        this.tweens.add({
            targets: enemy,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                if (enemy.active) {
                    this.enemyShoot(enemy);
                }
            }
        });
    }

    private selectPlayerShip (playerShipId: number) {
        const playerShipsData = this.cache.json.get("playerShips") as PlayerShipsData;
        this.playerShipData = playerShipsData[playerShipId];

        this.player.setTexture(this.playerShipData.texture);
    }
}
