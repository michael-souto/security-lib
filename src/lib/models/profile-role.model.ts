import { GenericEntity } from 'projects/design-lib/src/lib/models/generic-entity.model';
import { Role } from './role.model';

export interface ProfileRole extends GenericEntity {
  role: Role;
}
