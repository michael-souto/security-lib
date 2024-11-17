import { GenericEntity } from "projects/design-lib/src/lib/models/generic-entity.model";
import { Profile } from "./profile.model";
import { UserType } from "./user-type.model";

export class User extends GenericEntity {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    type: UserType;
    status: string;
    phone: string;
    detrasoftId: number;
    business: string;
    urlImage: string;
    urlHome: string;
    createdAt: Date;
    updatedAt: Date;
    userCreated: string;
    userUpdated: string;

    profiles: Profile[];
}
