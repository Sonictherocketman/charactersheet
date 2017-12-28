import 'bin/knockout-bootstrap-collapse';
import ko from 'knockout';
import 'knockout-dragdrop';

import { NestedListComponentViewModel } from '../nested-list';

import template from './index.html';
import './style.css';

/**
    draggable-nested-list component

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
export class DraggableNestedListComponentViewModel extends NestedListComponentViewModel {

    constructor(params) {
        super(params)

        // Drag & Drop
        this.supportsDragAndDrop = params.supportsDragAndDrop || false;
        this.ondragstart = params.ondragstart;
        this.ondragstop = params.ondragstop;
        this.onreorder = params.onreorder;
    }

    /* Drag and Drop Methods */

    draggingForCell = (cell) => {
        this.ensureDragAndDropSupport(() => {
            if (cell.dragging) {
                return cell.dragging();
            }
            return false;
        });
    };

    reorder = (event, dragData, zoneData) => {
        this.ensureDragAndDropSupport(() => {
            if (dragData !== zoneData.item) {
                var zoneDataIndex = zoneData.items.indexOf(zoneData.item);
                zoneData.items.remove(dragData);
                zoneData.items.splice(zoneDataIndex, 0, dragData);
            }
            if (this.onreorder) {
                this.onreorder();
            }
        });
    };

    dragDidStart = (cell) => {
        this.ensureDragAndDropSupport(() => {
            if (cell.dragging) {
                cell.dragging(true);
            }

            if (this.ondragstart) {
                this.ondragstart(cell);
            }
        });
    };

    dragDidEnd = (cell) => {
        this.ensureDragAndDropSupport(() => {
            if (cell.dragging) {
                cell.dragging(false);
            }
            if (this.ondragstop) {
                this.ondragstop(cell);
            }
        });
    };

    /* Utility Methods */

    /**
     Only call the provided callback if drag and drop is supported.
    */
    ensureDragAndDropSupport(fn) {
        if (!this.supportsDragAndDrop) { return; }
        return fn();
    };
}

ko.components.register('draggable-nested-list', {
    viewModel: DraggableNestedListComponentViewModel,
    template: template
});
