import { Entity } from './Entity';
import {Player} from "./Player.ts";

export class PowerUp extends Entity {
    private effect: string;
    private duration: number;
    private effectValue: any;
    private timer: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, powerUpData: PowerUpData) {
        super(scene, x, y, powerUpData.texture);
        this.effect = powerUpData.effect;
        this.duration = powerUpData.duration;
        this.effectValue = powerUpData.effectValue;

        this.setScale(4, 4);
    }

    public applyEffect(player: Player, powerUp: PowerUp) {
        switch (this.effect) {
            case 'rapidfire':
                player.powerUpApplied(powerUp.effect, this.effectValue, this.duration);
                break;
            case 'bigbullets':
                player.powerUpApplied(powerUp.effect, this.effectValue, this.duration);
                break;
            case 'speed':
                player.powerUpApplied(powerUp.effect, this.effectValue, this.duration);
                break;
            case 'invincibility':
                player.powerUpApplied(powerUp.effect, this.effectValue, this.duration);
                break;
            default:
                break;
        }
    }

    update(time: number, delta: number) {
        this.timer += delta;
        if (this.timer > this.duration) {
            this.disable();
        }
    }

    public disable() {
        this.setVisible(false);
        this.setActive(false);
        this.disableBody(true, true);
    }
}
