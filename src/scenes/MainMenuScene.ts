import {AssetManager} from "../services/AssetManager.ts";

export class MainMenuScene extends Phaser.Scene {
    private bg: Phaser.GameObjects.TileSprite;
    private playerShips: Phaser.GameObjects.Sprite[] = [];
    private selectedShipIndex: number = 0;
    private shipKeys: string[] = ['player', 'player_blue', 'player_yellow']

    constructor() {
        super('MainMenuScene');
    }

    preload() {
        AssetManager.loadAssets(this);
    }

    create() {
        this.playerShips.forEach(ship => ship.destroy());
        this.playerShips = [];

        this.bg = this.add.tileSprite(0, 0, this.cameras.main.width, this.cameras.main.height, 'bg').setOrigin(0).setTileScale(2);

        this.add.text(this.cameras.main.centerX, 250, 'Space Invaders', { fontFamily: 'font', fontSize: '90px', color: '#88D498' }).setOrigin(0.5);

        this.playerShips.forEach(ship => this.tweens.killTweensOf(ship));

        const positions = [-150, 0, 150];
        this.shipKeys.forEach((key, index) => {
            const ship = this.add.sprite(this.cameras.main.centerX + positions[index], this.cameras.main.centerY, key)
                .setScale(4)
                .setAngle(-90);
            this.tweens.add({
                targets: ship,
                y: ship.y + 20,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.playerShips.push(ship);
        });

        this.updateShipSelection();

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 350, 'Use Arrow keys to choose\nPress SPACE to start',
            { fontFamily: 'font', fontSize: '45px', color: '#88D498', align: 'center' })
            .setOrigin(0.5);

        this.input.keyboard?.on('keydown-LEFT', () => this.changeSelection(-1));
        this.input.keyboard?.on('keydown-RIGHT', () => this.changeSelection(1));
        this.input.keyboard?.once('keydown-SPACE', () => {
            this.registry.set('selectedShip', this.shipKeys[this.selectedShipIndex]);
            this.scene.start('MainGameScene');
        });
    }

    private changeSelection(direction: number) {
        this.selectedShipIndex = Phaser.Math.Wrap(this.selectedShipIndex + direction, 0, this.playerShips.length);
        this.updateShipSelection();
    }

    private updateShipSelection() {
        this.playerShips.forEach((ship, index) => {
            ship.setAlpha(index === this.selectedShipIndex ? 1 : 0.5);
        });
    }
}