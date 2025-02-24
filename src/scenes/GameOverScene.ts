import { Scene } from 'phaser';

export class GameOverScene extends Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100,
            "GAME OVER!!!",
            { fontSize: '90px', color: '#FF0000', fontStyle: 'bold' }
        ).setOrigin(0.5);

        let replayButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
            "Restart",
            { fontSize: '56px', color: '#000', backgroundColor: '#FFFFFF' }
        ).setOrigin(0.5).setPadding(10).setInteractive();

        replayButton.on('pointerdown', () => {
            this.scene.start('MainGameScene');
        });

        let menuButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 80,
            "Menu",
            { fontSize: '56px', color: '#000', backgroundColor: '#FFFFFF' }
        ).setOrigin(0.5).setPadding(10).setInteractive();

        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
    }
}
