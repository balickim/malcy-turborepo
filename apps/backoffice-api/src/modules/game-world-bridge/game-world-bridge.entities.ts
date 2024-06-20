// import {
//   HabitableZonesTypesEnum,
//   SharedSettlementTypesEnum,
//   UnitType,
// } from 'shared-types';
// import { Entity } from 'typeorm';

// export abstract class AuditableBaseEntity {
//   createdBy: string;
//   updatedBy: string;
//   deletedBy?: string;
//   createdAt: Date;
//   updatedAt: Date;
//   deletedAt?: Date;
// }

// export class ArmyEntity extends AuditableBaseEntity {
//   id: string;
//   [UnitType.SWORDSMAN]: number;
//   [UnitType.ARCHER]: number;
//   [UnitType.KNIGHT]: number;
//   [UnitType.LUCHADOR]: number;
//   [UnitType.ARCHMAGE]: number;
//   userId?: string;
//   settlementId?: string;
//   user: UsersEntity;
//   settlement: SettlementsEntity;
// }

// export class DiscoveredSettlementsEntity extends AuditableBaseEntity {
//   id: number;
//   discoveredByUserId: string;
//   userId: string;
//   settlementId: string;
//   type: SharedSettlementTypesEnum;
//   [UnitType.SWORDSMAN]: number;
//   [UnitType.ARCHER]: number;
//   [UnitType.KNIGHT]: number;
//   [UnitType.LUCHADOR]: number;
//   [UnitType.ARCHMAGE]: number;
//   user: UsersEntity;
//   settlement: SettlementsEntity;
// }

// @Entity({ name: 'settlements' })
// export class SettlementsEntity extends AuditableBaseEntity {
//   id: string;
//   name: string;
//   location: string;
//   type: SharedSettlementTypesEnum;
//   gold: number;
//   wood: number;
//   resourcesMultiplicator: number;
//   user: UsersEntity;
//   army: ArmyEntity;
//   discoveredByUsers: DiscoveredSettlementsEntity[];
// }

// export class ConversationsEntity extends AuditableBaseEntity {
//   id: number;
//   name: string;
//   messages: MessagesEntity[];
// }

// export class MessagesEntity extends AuditableBaseEntity {
//   id: number;
//   content: string;
//   user: UsersEntity;
//   conversation: ConversationsEntity;
// }

// export class GroupsEntity extends AuditableBaseEntity {
//   id: number;
//   name: string;
//   members: GroupsMembersEntity[];
// }

// export class GroupsMembersEntity extends AuditableBaseEntity {
//   id: number;
//   user: UsersEntity;
//   group: GroupsEntity;
// }

// export class UsersEntity extends AuditableBaseEntity {
//   id: string;
//   username: string;
//   email: string;
//   password: string;
//   gold: number;
//   wood: number;
//   settlements: SettlementsEntity[];
//   army: ArmyEntity;
//   sentMessages: MessagesEntity[];
//   groups: GroupsMembersEntity[];
//   discoveredSettlements: DiscoveredSettlementsEntity[];
// }

// export class DiscoveredAreaEntity extends AuditableBaseEntity {
//   id: string;
//   userId: string;
//   area: string;
// }

// export class VisibleAreaEntity extends AuditableBaseEntity {
//   id: string;
//   userId: string;
//   area: string;
// }

// export class HabitableZonesEntity extends AuditableBaseEntity {
//   id: string;
//   area: GeoJSON.Polygon;
//   type: HabitableZonesTypesEnum;
//   resourcesMultiplicator: number;
//   discoveredByUsers: DiscoveredHabitableZonesEntity[];
// }

// export class DiscoveredHabitableZonesEntity extends AuditableBaseEntity {
//   id: number;
//   habitableZoneId: string;
//   discoveredByUserId: string;
//   type: HabitableZonesTypesEnum;
//   habitableZone: HabitableZonesEntity;
// }
