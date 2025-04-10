import { Injectable } from '@angular/core';
import { UtilsService } from 'projects/design-lib/src/lib/services/utils/utils.service';
import { FieldValidator, ValidatorModelService } from 'projects/design-lib/src/lib/services/validator-model.service';
import { User } from 'projects/security-lib/src/lib/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserValidatorModelService extends ValidatorModelService<User> {

  protected override _fields = {
    email: new FieldValidator(),
    firstName: new FieldValidator(),
    lastName: new FieldValidator(),
    type: new FieldValidator(),
    profiles: new FieldValidator()
  };

  private emailRequiredMessage: string;
  private emailInvalidMessage: string;

  override async loadTextMessages() {
    let fieldMessage = await this.utilsService.getTextTranslated('USERS.EMAIL');
    this.emailRequiredMessage = await this.utilsService.getTextTranslated(
      'FIELD_REQUIRED',
      { field: fieldMessage }
    );
    this.emailInvalidMessage = await this.utilsService.getTextTranslated(
      'INVALID_EMAIL'
    );

    fieldMessage = await this.utilsService.getTextTranslated(
      'USERS.FIRST_NAME'
    );
    this._fields.firstName.invalidMessage =
      await this.utilsService.getTextTranslated('FIELD_REQUIRED', {
        field: fieldMessage,
      });

    fieldMessage = await this.utilsService.getTextTranslated('USERS.LAST_NAME');
    this._fields.lastName.invalidMessage =
      await this.utilsService.getTextTranslated('FIELD_REQUIRED', {
        field: fieldMessage,
      });

    fieldMessage = await this.utilsService.getTextTranslated('USERS.TYPE');
    this._fields.type.invalidMessage =
      await this.utilsService.getTextTranslated('FIELD_REQUIRED', {
        field: fieldMessage,
      });

    fieldMessage = await this.utilsService.getTextTranslated('USERS.PROFILES');
    this._fields.profiles.invalidMessage =
      await this.utilsService.getTextTranslated('FIELD_REQUIRED', {
        field: fieldMessage,
      });
  }

  protected override validate() {
    this.validateEmail();
    this.validateFirstName();
    this.validateLastName();
    this.validateType();
    this.validateProfiles();
    this._valid = this.areAllFieldsValid();
  }
  protected override validateForDelete() {
  }

  private validateEmptyEmail() {
    this._fields.email.isValid = !UtilsService.isEmpty(this.object.email);
    this._fields.email.invalidMessage = this.emailRequiredMessage;
  }

  private validateEmail() {
    this.validateEmptyEmail();
    if (this._fields.email.isValid) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.object.email)) {
        this._fields.email.invalidMessage = this.emailInvalidMessage;
        this._fields.email.isValid = false;
      }
    } else {
      this._fields.email.invalidMessage = this.emailRequiredMessage;
      this._fields.email.isValid = false;
    }
  }

  private validateFirstName() {
    this._fields.firstName.isValid = !UtilsService.isEmpty(
      this.object.firstName
    );
  }

  private validateLastName() {
    this._fields.lastName.isValid = !UtilsService.isEmpty(this.object.lastName);
  }

  private validateType() {
    this._fields.type.isValid = !UtilsService.isEmpty(this.object.type);
  }

  private validateProfiles() {
    this._fields.profiles.isValid = false;
    if (this.object.profiles?.length > 0 && this.object.type == 'Default')
      this._fields.profiles.isValid = true;
    else {
      if (this.object.type == 'Admin') {
        this._fields.profiles.isValid = true;
      }
    }
  }
}
