'use strict';

describe('Armor Class Service', function() {
    //Clean up after each test.
    afterEach(function() {
        simple.restore();
    });

    describe('Base armor class', function() {
        it('should return the base armor class', function() {
            simple.mock(CharacterManager, 'activeCharacter').callFn(MockCharacterManager.activeCharacter);

            var armors = new ArmorViewModel();
            var armor = new Armor();
            armor.armorName('Leather');
            armor.armorClass(17);
            armor.armorEquipped('equipped');
            armors.armors([armor]);

            var armorClassService = ArmorClassService.sharedService();
            armorClassService.init();
            var armorClass = armorClassService.baseArmorClass();
            armorClass.should.equal(17);
        });
    });
});