import { Injectable } from "@angular/core";
import { UserFavorite } from "../../models/user-favorite.model";
import { UserFavoriteCrudApiService } from "./user-favorite-crud-api.service";
import { AuthService } from "./auth.service";
import { EventBusService } from "projects/design-lib/src/lib/services/event-bus.service";
@Injectable({
  providedIn: "root",
})
export class FavoriteService {
  constructor(
    private userFavoriteCrudApiService: UserFavoriteCrudApiService,
    private authService: AuthService,
    private eventBus: EventBusService
  ) {
    this.eventBus.on(["user:logged", "menu:load"]).subscribe(() => {
      this.loadFavorites();
    });
  }

  myFavorites: UserFavorite[] = [];

  loadFavorites() {
    if (this.authService.isLogged()) {
      this.userFavoriteCrudApiService
        .findAll(this.authService.getUserId())
        .subscribe((response) => {
          this.myFavorites = response.content;
          this.eventBus.emit({ type: "favorite:updated" });
        });
    }
  }

  addFavorite(favorite: UserFavorite) {
    if (!this.existsFavorite(favorite.entityId)) {
      favorite.ordering = this.myFavorites.length;
      favorite.userId = this.authService.getUserId();
      this.userFavoriteCrudApiService
        .create(favorite, this.authService.getUserId())
        .subscribe((response) => {
          this.myFavorites.push(favorite);
          this.eventBus.emit({ type: "favorite:updated" });
        });
    }
  }

  removeFavorite(entityId: string) {
    this.userFavoriteCrudApiService
      .delete(entityId, this.authService.getUserId())
      .subscribe((response) => {
        this.myFavorites = this.myFavorites.filter(
          (f) => f.entityId !== entityId
        );
        this.eventBus.emit({ type: "favorite:updated" });
      });
  }

  existsFavorite(entityId: string) {
    return this.myFavorites.some((f) => f.entityId === entityId);
  }
}
