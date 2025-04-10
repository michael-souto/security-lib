import { Injectable } from "@angular/core";
import { UserFavorite } from "../../models/user-favorite.model";
import { CrudApiService } from "projects/design-lib/src/lib/services/crud-api.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class UserFavoriteCrudApiService extends CrudApiService<UserFavorite> {
  override getAdressAPI(masterId: string = null): string {
    return environment.apiURLGateway + "/authorization-server/users/:masterId/favorites";
    //return "http://localhost:32000/users"
  }
}
