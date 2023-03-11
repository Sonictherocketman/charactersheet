import { CoreManager, Notifications, uploadFormData, Fixtures } from 'charactersheet/utilities';
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

    mapImageFile = ko.observable();
    dataFile = ko.observable();

    modelClass() {
        return Encounter;
    }

    async save() {
        let success = true, error = null;

        // The auto-camel-caser doesn't work on multi-part files. We need
        // to use the actual snake-case for this.
        let formData = new FormData();
        formData.append('data_file', this.dataFile());
        formData.append('map_image_file', this.mapImageFile());

        // Use the Hypnos schema to get the import API URL.
        const coreUuid = CoreManager.activeCore().uuid();
        const url = schema.content.core.encounters.fromDonjon.url.replace(
            '{coreUuid}',
            coreUuid,
        );

        try {
            const encounter = await uploadFormData(
                formData,
                url,
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
