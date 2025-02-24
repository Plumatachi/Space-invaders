import { Scene } from 'phaser';

export class MainMenuScene extends Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100,
            "Space Invaders",
            { fontSize: '120px', color: '#88D498', fontStyle: 'bold' }
        ).setOrigin(0.5);

        let playButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
            "Play",
            { fontSize: '56px', color: '#000', backgroundColor: '#FFFFFF' }
        ).setOrigin(0.5).setPadding(10).setInteractive();

        playButton.on('pointerdown', () => {
            this.scene.start('MainGameScene');
        });

        let quitButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 80,
            "Quit",
            { fontSize: '56px', color: '#000', backgroundColor: '#FFFFFF' }
        ).setOrigin(0.5).setPadding(10).setInteractive();

        quitButton.on('pointerdown', () => {
            window.close();
        });
    }
}
