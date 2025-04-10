import { GenericEntity } from "projects/design-lib/src/lib/models/generic-entity.model";

export class UserFavorite extends GenericEntity {
  userId: string;
  name: string;
  url: string;
  route: string;
  feature: string;
  entityId: string;
  icon: string;
  ordering: number;
  system: string;
}
