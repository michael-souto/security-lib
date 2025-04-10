import { Injectable } from '@angular/core';
import { CrudApiService } from 'projects/design-lib/src/lib/services/crud-api.service';
import { User } from 'projects/security-lib/src/lib/models/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserCrudApiService extends CrudApiService<User> {
  override getAdressAPI(masterId: string = null): string {
    return environment.apiURLGateway + '/authorization-server/users'
    //return "http://localhost:32000/users"
  }
}
