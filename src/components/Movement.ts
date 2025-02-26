import {Entity} from "../entities/Entity.ts";

export class Movement implements IComponent {
    private speed: number = 0;

    public constructor(speed?: number) {
        if (speed) {
            this.speed = speed;
        }
    }

    public setSpeed(speed: number) {
        this.speed = speed;
    }

    public moveHorizontally(entity: Entity, deltaTime: number) {
        entity.x += this.speed * deltaTime;
    }

    public moveVertically(entity: Entity, deltaTime: number) {
        entity.y += this.speed * deltaTime;
    }
}