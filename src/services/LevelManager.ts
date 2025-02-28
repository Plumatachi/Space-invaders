export class LevelManager {
    private scene: Phaser.Scene;
    private level: number;
    private enemiesKilled: number;
    private enemiesToKill: number;
    private maxEnemiesPerWave: number;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.level = 1;
        this.enemiesKilled = 0;
        this.enemiesToKill = 10;
        this.maxEnemiesPerWave = 30;
    }

    public getLevel(): number {
        return this.level;
    }

    public getEnemiesToKill(): number {
        return this.enemiesToKill;
    }

    public getMaxEnemiesPerWave(): number {
        return this.maxEnemiesPerWave;
    }

    public registerKill(): void {
        this.enemiesKilled++;
        if (this.enemiesKilled >= this.enemiesToKill) {
            this.nextLevel();
        }
    }

    public nextLevel(): void {
        this.level++;
        this.enemiesKilled = 0;
        this.enemiesToKill += 5;
        this.maxEnemiesPerWave += 2;

        this.scene.registry.set('level', this.level);

        // Si le niveau est un multiple de 5 (hors multiples de 10), c'est une vague spéciale
        if (this.level % 10 !== 0 && this.level % 5 === 0) {
            this.scene.spawnWave();
        }

        // Si le niveau est un multiple de 10, un boss apparaît
        if (this.level % 10 === 0) {
            this.scene.spawnBoss();
        }
    }


}
