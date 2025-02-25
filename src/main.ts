import { MainGameScene } from './scenes/MainGameScene';
import { AUTO, Game, Scale,Types } from 'phaser';
import {MainMenuScene} from "./scenes/MainMenuScene.ts";
import {GameOverScene} from "./scenes/GameOverScene.ts";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1080,
    height: 1920,
    parent: 'game-container',
    backgroundColor: '#C6DABF',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    fps: { forceSetTimeOut: true, target: 120 },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        }
    },
    audio: {
        noAudio: true,
    },
    scene: [
        MainMenuScene,
        MainGameScene,
        GameOverScene
    ]
};

export default new Game(config);
