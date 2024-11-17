import { ProfileRole } from './profile-role.model';
import { Role } from './role.model';

export class Profile {
  id: string;
  name: string;
  detrasoftId: number;
  roles: Role[];
}
