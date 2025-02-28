type PlayerShipsData = {
    [key: string]: PlayerShipData
}

type PlayerShipData = {
    movementSpeed: number;
    rateOfFire: number;
    health: number;
    invincible: boolean;
    texture: string;
    body: ShipBodyData;
}