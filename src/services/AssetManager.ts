export class AssetManager {
    static loadAssets(scene: Phaser.Scene) {
        const width = scene.cameras.main.width;
        const y = scene.cameras.main.centerY;

        // Barre de chargement
        const progressBar = scene.add.graphics();
        const progressBox = scene.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(scene.cameras.main.centerX, y, width, 40);

        scene.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(0, y, value * width, 40);
        });

        scene.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });

        scene.load.setPath('assets');

        // Chargement de la police
        scene.load.font('font', 'font/kenvector_future.ttf');

        // Chargement des assets
        const images = {
            'bg': 'background/Space_BG.png',
            'blue_planet': 'background/Blue_planet.png',
            'green_planet': 'background/Green_planet.png',
            'pink_planet': 'background/Pink_planet.png',
            'sand_planet': 'background/Sand_planet.png',
            'green_cloud': 'background/Green_cloud.png',
            'black_void': 'background/Black_void.png',
            'player': 'player/Player_ship.png',
            'player_blue': 'player/Player_ship_blue.png',
            'player_yellow': 'player/Player_ship_yellow.png',
            'boss': 'enemies/Boss.png',
            'heart_full': 'UI/heart_full.png'
        };

        Object.entries(images).forEach(([key, path]) => scene.load.image(key, path));

        const spritesheets = {
            'alan': { path: 'enemies/Alan.png', frameWidth: 16, frameHeight: 16 },
            'bon_bon': { path: 'enemies/Bon_Bon.png', frameWidth: 16, frameHeight: 16 },
            'lips': { path: 'enemies/Lips.png', frameWidth: 16, frameHeight: 16 },
            'player_bullets': { path: 'bullets/Player_charged_beam.png', frameWidth: 16, frameHeight: 16 },
            'enemies_bullets': { path: 'bullets/Enemy_projectile.png', frameWidth: 16, frameHeight: 16 },
            'boss_bullets': { path: 'bullets/Boss_bullets.png', frameWidth: 16, frameHeight: 16 },
            'shoot_indicator': { path: 'UI/shoot_indicator.png', frameWidth: 32, frameHeight: 16 },
            'power_up': { path: 'UI/power_up.png', frameWidth: 16, frameHeight: 16 }
        };

        Object.entries(spritesheets).forEach(([key, { path, frameWidth, frameHeight }]) => {
            scene.load.spritesheet(key, path, { frameWidth, frameHeight });
        });

        const sounds = ['sfx_laser1', 'sfx_laser2'];
        sounds.forEach(sound => scene.load.audio(sound, `Sounds/${sound}.ogg`));

        const jsonFiles = ['playerShips', 'enemies', 'powerUps'];
        jsonFiles.forEach(file => scene.load.json(file, `Data/${file}.json`));
    }
}
