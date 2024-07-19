import { ConversationsEntity } from 'shared-nestjs';
import { DataSource } from 'typeorm';

export async function seed(dataSource: DataSource): Promise<void> {
  process.env.PROCESS_ENV = 'seeding'; // turn off "afterInsert" in EventSubscribers

  const conversationsEntityRepository =
    dataSource.getRepository(ConversationsEntity);

  await conversationsEntityRepository.insert({ name: 'default', id: 1 });
}
