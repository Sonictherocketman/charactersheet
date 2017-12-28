import 'bin/knockout-bootstrap-collapse';
import ko from 'knockout';
import 'knockout-dragdrop';

import template from './index.html';

/**
    nested-list component

    This component uses the provided list of cells and displays them.
    Then handles when a given cell has been selected, added, or removed.

    @param cells {Array Encounter} A list of cells. Nested cells are children
    of the top level cells.
    @param selectedCell {Encounter} The observable used to store the selected cell.
    @param levels {Int} The maximum level of nested cells to display.
    the currently selected encounter. Default is 5.

    Events:
    @param onadd {Function} A callback that takes 1 parameter. This callback is
    invoked when a new cell has been added. The parameter is the parent
    of the new cell if it exists.
    @param ondelete {Function} A callback function that takes 1 parameter. The only
    parameter is the cell object that is to be removed.
    @param onselect {Function} A callback for what to do when a given cell is selected.

    Note: This binding recursively uses itthis to render it's children.
 */
export class NestedListComponentViewModel {

    constructor(params) {
        this.cells = ko.observableArray(ko.unwrap(params.cells) || []);
        this.selectedCell = params.selectedCell || ko.observable();

        // Callback Handlers
        this.onselect = params.onselect;
        this.ondelete = params.ondelete;
        this.onadd = params.onadd;

        if (params.levels !== null && params.levels !== undefined) {
            this.levels = params.levels;
        } else {
            this.levels = 4;
        }
    }

    selectCell = (cell) => {
        this.selectedCell(cell);
        if (this.onselect) {
            this.onselect(cell);
        }
    }

    /**
      Fires the `ondelete` callback to the responder.
     */
    deleteCell = (cell) => {
        if (this.ondelete) {
            this.ondelete(cell);
        }
    }

    /**
      Fires the `onadd` callback to the responder.
     */
    addCell = (parent) => {
        if (this.onadd) {
            this.onadd(parent);
        }
    }

    /* UI Methods */

    /**
      Returns the correct active css for a given encounter.
     */
    isActiveCSS = (cell) => {
        var selected = this.selectedCell();
        if (selected) {
            return cell.id() === selected.id() ? 'active' : '';
        }
    }

    isSelected = (cell) => {
        if (!this.selectedCell()) { return false; }
        return this.selectedCell().id() === cell.id() ? true : false;
    }

    shouldShowDelete = (cell) => {
        return cell.shouldShowDelete ? cell.shouldShowDelete() : false;
    }
}

ko.components.register('nested-list', {
    viewModel: NestedListComponentViewModel,
    template: template
});
