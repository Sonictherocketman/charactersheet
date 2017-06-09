'use strict';

/**
 * plus-minus component
 * A useful 2 button component for incrementing/decrementing a value.
 * @param value {observable} an observable in which to save the value
 * @param min {int: Optional} the minimum value. Default: 100000
 * @param max {int: Optional} the maximum value. Default: 0
 * Usage:
 * <plus-minus params="value: myValue, min: 0, max: 10"></plus-minus>
 *
 * Note: This template adapts the button size based on the device size.
 */
function PlusMinusComponentViewModel(params) {
    var self = this;

    self.value = params.value;
    self.max = params.max || ko.observable(1000000);
    self.min = params.min || ko.observable(0);

    self.allowsBulkEditing = params.allowsBulkEditing || false;
    self.bulkValue = params.bulkValue || ko.observable(1);

    self.increase = function() {
        if (!ko.utils.unwrapObservable(self.allowsBulkEditing)) {
            if (parseInt(self.value()) < parseInt(self.max())) {
                self.value(parseInt(self.value()) + 1);
            }
        } else {
            var bulkValue = self._intValue(self.bulkValue);
            var value = self._intValue(self.value);
            var max = self._intValue(self.max);

            if (value + bulkValue < max) {
                self.value(value + bulkValue);
            } else {
                self.value(max);
            }

            self.bulkValue(1);
        }
    };

    self.decrease = function() {
        if (!ko.utils.unwrapObservable(self.allowsBulkEditing)) {
            if (parseInt(self.value()) > parseInt(self.min())) {
                self.value(parseInt(self.value()) - 1);
            }
        } else {
            var bulkValue = self._intValue(self.bulkValue);
            var value = self._intValue(self.value);
            var min = self._intValue(self.min);

            if (value - bulkValue > min) {
                self.value(value - bulkValue);
            } else {
                self.value(min);
            }

            self.bulkValue(1);
        }
    };

    // Private Methods

    self._intValue = function(value) {
        return parseInt(ko.utils.unwrapObservable(value));
    };
}

ko.components.register('plus-minus', {
    viewModel: PlusMinusComponentViewModel,
    template: '\
    <div class="visible-lg-inline-block input-group ac-plus-minus">\
      <div class="input-group" style="width: 170px;">\
        <span class="input-group-btn">\
            <button type="button" class="btn btn-default" \
                data-bind="click: increase">\
                    <i class="fa fa-plus fa-color"> </i>\
            </button>\
        </span>\
        <!-- ko if: allowsBulkEditing -->\
            <input type="number" data-bind="value: bulkValue" \
                class="form-control"></span>\
        <!-- /ko -->\
        <!-- ko ifnot: allowsBulkEditing -->\
            <span data-bind="text: value" class="used-slot-span"></span>\
        <!-- /ko -->\
        <span class="input-group-btn">\
            <button type="button" class="btn btn-default" \
            data-bind="click: decrease">\
                <i class="fa fa-minus fa-color"> </i>\
            </button>\
        </span>\
      </div>\
    </div> \
    <div class="hidden-lg input-group ac-plus-minus">\
      <div class="input-group">\
        <span class="input-group-btn">\
            <button type="button" class="btn btn-default btn" \
                data-bind="click: increase">\
                    <i class="fa fa-plus fa-color"> </i>\
            </button>\
        </span>\
        <!-- ko if: allowsBulkEditing -->\
            <input type="number" data-bind="value: bulkValue" \
                class="form-control"></span>\
        <!-- /ko -->\
        <!-- ko ifnot: allowsBulkEditing -->\
            <span data-bind="text: value" class="used-slot-span"></span>\
        <!-- /ko -->\
        <span class="input-group-btn">\
            <button type="button" class="btn btn-default btn" \
            data-bind="click: decrease">\
                <i class="fa fa-minus fa-color"> </i>\
            </button>\
        </span>\
      </div>\
    </div>'
});
