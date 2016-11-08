'use strict';

function SpellExplorerViewModel() {
    var self = this;

    self.sorts = {
        'spellName asc': { field: 'spellName', direction: 'asc'},
        'spellName desc': { field: 'spellName', direction: 'desc'},
        'spellType asc': { field: 'spellType', direction: 'asc'},
        'spellType desc': { field: 'spellType', direction: 'desc'},
        'spellDmg asc': { field: 'spellDmg', direction: 'asc'},
        'spellDmg desc': { field: 'spellDmg', direction: 'desc'},
        'spellLevel asc': { field: 'spellLevel', direction: 'asc', numeric: true},
        'spellLevel desc': { field: 'spellLevel', direction: 'desc', numeric: true},
        'spellCastingTime asc': { field: 'spellCastingTime', direction: 'asc'},
        'spellCastingTime desc': { field: 'spellCastingTime', direction: 'desc'},
        'spellRange asc': { field: 'spellRange', direction: 'asc'},
        'spellRange desc': { field: 'spellRange', direction: 'desc'}
    };

    self.sort = ko.observable(self.sorts['spellName asc']);

    self.spells = ko.observableArray([]);

    self.init = function() {
        Notifications.dataRepository.spells.changed.add(self._dataHasChanged);
    };

    self.load = function() {
    };

    self.unload = function() {
    };

    /* UI Methods */

    /**
     * Filters and sorts the spells for presentation in a table.
     * Boolean sort logic inspired by:
     * http://stackoverflow.com/
     * questions/17387435/javascript-sort-array-of-objects-by-a-boolean-property
     */
    self.filteredAndSortedSpells = ko.computed(function() {
        return SortService.sortAndFilter(self.spells(), self.sort(), null);
    });

    self.gridViewModel = new ko.simpleGrid.viewModel({
        data: self.filteredAndSortedSpells,
        columns: [
            { headerText: 'Spell', rowText: 'spellName' },
            { headerText: 'Level', rowText: 'spellLevel' },
            { headerText: 'Type', rowText: 'spellType' },
            { headerText: 'Damage', rowText: 'spellDmg' },
            { headerText: 'Casting Time', rowText: 'spellCastingTime' },
            { headerText: 'Damage', rowText: 'spellDmg' }
        ],
        pageSize: 30
    });

    /**
     * Determines whether a column should have an up/down/no arrow for sorting.
     */
    self.sortArrow = function(columnName) {
        return SortService.sortArrow(columnName, self.sort());
    };

    /**
     * Given a column name, determine the current sort type & order.
     */
    self.sortBy = function(columnName) {
        self.sort(SortService.sortForName(self.sort(),
            columnName, self.sorts));
    };

    /* Private Methods */

    self._dataHasChanged = function() {
        if (!DataRepository.spells) { return; }
        var spells = Object.keys(DataRepository.spells).map(function(name, idx, _) {
            return DataRepository.spells[name];
        });
        self.spells(spells);
    };
}
