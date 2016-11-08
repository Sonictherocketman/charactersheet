'use strict';

/**
 * This view model contains the data explorer VMs.
 */
function ExplorerTabViewModel() {
    var self = this;

    self.spellExplorerViewModel = ko.observable(new SpellExplorerViewModel());

    self.init = function() {
        ViewModelUtilities.initSubViewModels(self);
    };

    self.load = function() {
        ViewModelUtilities.loadSubViewModels(self);
    };

    self.unload = function() {
        ViewModelUtilities.unloadSubViewModels(self);
    };

    self.clear = function() {
        ViewModelUtilities.clearSubViewModels(self);
    };
}

