type PowerUpsData = {
    [key: string]: PowerUpData
}

type PowerUpData = {
    texture: string;
    effect: string;
    duration: number;
    effectValue: number;
}