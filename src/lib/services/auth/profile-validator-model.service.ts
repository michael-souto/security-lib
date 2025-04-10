import { Injectable } from '@angular/core';
import { UtilsService } from 'projects/design-lib/src/lib/services/utils/utils.service';
import { FieldValidator, ValidatorModelService } from 'projects/design-lib/src/lib/services/validator-model.service';
import { Profile } from 'projects/security-lib/src/lib/models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileValidatorModelService extends ValidatorModelService<Profile> {
  protected override _fields = {
    name: new FieldValidator(),
    roles: new FieldValidator(),
  };

  override async loadTextMessages() {
    let fieldMessage = await this.utilsService.getTextTranslated(
      'PROFILES.NAME'
    );
    this._fields.name.invalidMessage =
      await this.utilsService.getTextTranslated('FIELD_REQUIRED', {
        field: fieldMessage,
      });

    fieldMessage = await this.utilsService.getTextTranslated('ROLES.ROLES');
    this._fields.roles.invalidMessage =
      await this.utilsService.getTextTranslated('FIELD_REQUIRED', {
        field: fieldMessage,
      });
  }

  protected override validate() {
    this.validateName();
    this.validateRoles();
    this._valid = this.areAllFieldsValid();
  }
  protected override validateForDelete() {}

  private validateName() {
    this._fields.name.isValid = !UtilsService.isEmpty(this.object.name);
  }
  private validateRoles() {
    this._fields.roles.isValid = this.object.roles?.length > 0;
  }
}
