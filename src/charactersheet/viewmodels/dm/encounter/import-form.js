import { Notifications, uploadFormData, Fixtures } from 'charactersheet/utilities';
import { AbstractChildFormModel } from 'charactersheet/viewmodels/abstract';
import { Encounter, EncounterSection } from 'charactersheet/models/dm';

import autoBind from 'auto-bind';
import ko from 'knockout';
import template from './import-form.html';


export class EncounterImportFormViewModel extends AbstractChildFormModel {

    constructor(params) {
        super(params);
        autoBind(this);

        this.forceCardResize = params.forceCardResize;
    }

    barColor = ko.observable(Fixtures.general.colorHexList[0]);
    progress = ko.observable(0);

    modelClass() {
        return Encounter;
    }

    async save() {
        let success = true, error = null;

        let formData = new FormData();
        formData.append('dataFile', null);
        formData.append('mapImageFile', null);

        try {
            const encounter = await uploadFormData(
                formData,
                // Use the Hypnos schema to get the import API URL.
                schema.content.core.encounters.fromDonjon.url,
                this.progress
            );
        } catch(e) {
            success = false, error = e;
        }

        if (success) {
            Notifications.encounter.added.dispatch(encounter);
        }

        this.didSave(success, error);
    }

    didSave(success, error) {
        super.didSave(success, error);

        if (this.forceCardResize) {
            this.forceCardResize();
        }
    }
}


ko.components.register('encounter-import-form', {
    viewModel: EncounterImportFormViewModel,
    template: template
});
