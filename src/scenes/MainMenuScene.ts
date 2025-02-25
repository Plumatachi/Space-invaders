export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Space Invaders', {fontSize: '120px', color: '#88D498'}).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 10, 'Press space to start', {fontSize: '56px', color: '#88D498'}).setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('MainGameScene');
        });
    }
}