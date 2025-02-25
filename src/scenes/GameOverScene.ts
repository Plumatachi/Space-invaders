import {GameDataKeys} from "../GameDataKeys.ts";

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 300, 'GAME OVER', {fontSize: '120px', color: '#88D498'}).setOrigin(0.5);
        const score = this.registry.get(GameDataKeys.PLAYER_SCORE);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, `Your score: ${score}`, {fontSize: '56px', color: '#88D498'}).setOrigin(0.5);
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 30, 'Press space to play again', {fontSize: '56px', color: '#88D498'}).setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('MainGameScene');
        });
    }
}