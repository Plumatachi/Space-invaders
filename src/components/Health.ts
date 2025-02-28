export class Health extends Phaser.Events.EventEmitter implements IComponent {
    private currentHealth: number;
    private maxHealth: number;

    public constructor(value: number) {
        super();

        this.currentHealth = value;
        this.maxHealth = value;

    }

    public getCurrentHealth(): number {
        return this.currentHealth;
    }

    public getMaxHealth(): number {
        return this.maxHealth;
    }

    public inc(amount: number): void {
        this.currentHealth += amount;
        this.emit('change', this.currentHealth);

        if (this.currentHealth <= 0) {
            this.emit('death');
        }
    }
}