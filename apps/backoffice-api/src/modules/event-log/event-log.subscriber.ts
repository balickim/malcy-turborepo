import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class EventLogSubscriber implements EntitySubscriberInterface {
  beforeInsert(event: InsertEvent<any>) {
    event.entity.createdBy = event.entity?.user?.id;
    event.entity.updatedBy = event.entity?.user?.id;
  }
  beforeUpdate(event: UpdateEvent<any>) {
    event.entity.updatedBy = event.entity?.user?.id;
  }
}
