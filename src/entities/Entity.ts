export class Entity extends Phaser.Physics.Arcade.Sprite {
    public arcadeBody: Phaser.Physics.Arcade.Body;
    private components: IComponent[] = []

    public constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.arcadeBody = this.body as Phaser.Physics.Arcade.Body;
    }

    public addComponent(component: IComponent) {
        this.components.push(component);
    }

    public getComponent<T extends IComponent>(type: new (...args: any[]) => T): T | undefined {
        return this.components.find((component) => component instanceof type) as T;
    }

    public getComponents<T extends IComponent>(type: new (...args: any[]) => T): T[] {
        return this.components.filter((component) => component instanceof type) as T[];
    }

    public removeComponent(component: IComponent) {
        const index = this.components.indexOf(component);
        if (index >= 0) {
            this.components.splice(index, 1);
        }
    }

    public removeComponents<T extends IComponent>(type: new (...args: any[]) => T) {
        this.components = this.components.filter((component) => !(component instanceof type));
    }

    public changeVelocity(x: number, y: number) {
        this.arcadeBody.setVelocity(x, y);
    }
}