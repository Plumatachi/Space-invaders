export class GroupUtils {
    public static preallocateGroup(group: Phaser.GameObjects.Group, size: number) {
        if (group.getLength() > size) {
            return;
        }

        const canBeDisable = group.classType && typeof group.classType.prototype.disable === 'function';

        for (let i = 0; i < size; i++) {
            const groupItem = group.create();
            if (canBeDisable) {
                groupItem.disable();
            }
        }
    }
}