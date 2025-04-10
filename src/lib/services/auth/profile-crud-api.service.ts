import { Injectable } from '@angular/core';
import { CrudApiService } from 'projects/design-lib/src/lib/services/crud-api.service';
import { Profile } from 'projects/security-lib/src/lib/models/profile.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileCrudApiService extends CrudApiService<Profile> {
  override getAdressAPI(masterId: string = null): string {
    return environment.apiURLGateway + '/authorization-server/profiles';
    return "http://localhost:32000/profiles"

  }
}
