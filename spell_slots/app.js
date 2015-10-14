"use strict";

function SpellSlotsViewModel() {
	var self = this;
	
	self.slotColors = [
		'progress-bar-red',
		'progress-bar-purple',
		'progress-bar-teal',
		'progress-bar-indigo',
		'progress-bar-brown',
		'progress-bar-yellow',
		'progress-bar-forest',
		'progress-bar-sky',
		'progress-bar-orange',
		'progress-bar-magenta',
		'progress-bar-green',
		'progress-bar-blue'
	];
	
	self.slots = ko.observableArray([]);
	self.blankSlot = ko.observable(new Slot());
	self.selecteditem = ko.observable(null);
	
	self.maxSlotWidth = function() {
		return 100 / self.slots().length;
	};
	
    self.editSlot = function(slot) {
        self.selecteditem(slot);
    };
	
	self.addSlot = function() {
		self.blankSlot().color(self.slotColors.pop());
		self.slots.push(self.blankSlot());
		self.blankSlot(new Slot());
		self.blankSlot().level(self.slots().length + 1);
		self.blankSlot().maxSpellSlots('');
	};
	
	self.removeSlot = function(slot) {
		self.slotColors.push(slot.color());
		self.slots.remove(slot);
	};
	
	self.resetSlots = function() {
		$.map(self.slots(), function(slot, _) {
			slot.usedSpellSlots(0);
		});
	};
			
	self.exportValues = function() {
		var slots = [];
		for (var i in self.slots()) {
			var slot = self.slots()[i];
			slots.push(slot.exportValues());
		}
		return {
			slots: slots
		}
	};
	
	self.importValues = function(values) {
		var newSlots = []
		for (var i in values.slots) {
			var slot = values.slots[i];
			var newSlot = new Slot();
			newSlot.importValues(slot);
			self.slots.push(newSlot);
		}
	};
	
	self.clear = function() {
		self.slots([]);
	};
};