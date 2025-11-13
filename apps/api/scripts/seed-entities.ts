import 'dotenv/config';
import { AppDataSource } from '../src/data-source';
import { Organization } from '../src/app/entities/organization.entity';
import { User, Role } from '../src/app/entities/user.entity';
import { Task } from '../src/app/entities/task.entity';
import { Audit } from '../src/app/entities/audit.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();
  console.log('DataSource initialized for entity seeding');

  const orgRepo = AppDataSource.getRepository(Organization);
  const userRepo = AppDataSource.getRepository(User);
  const taskRepo = AppDataSource.getRepository(Task);
  const auditRepo = AppDataSource.getRepository(Audit);

  const orgName = process.env.SEED_ORG_NAME ?? 'Demo Organization';
  let org: any = await orgRepo.findOne({ where: { name: orgName } });
  if (!org) {
    org = orgRepo.create({ name: orgName } as any) as any;
    org = await orgRepo.save(org as any);
    console.log('Created organization', org.id);
  }

  const username = process.env.SEED_OWNER_USERNAME ?? 'owner';
  const plain = process.env.SEED_OWNER_PASSWORD ?? 'owner123';
  const email = process.env.SEED_OWNER_EMAIL ?? 'owner@example.com';
  const passwordHash = await bcrypt.hash(plain, 10);

  let user: any = await userRepo.findOne({ where: { username } });
  if (!user) {
    user = userRepo.create({ username, email, passwordHash, role: Role.OWNER, organization: org } as any) as any;
    user = await userRepo.save(user as any);
    console.log('Created owner user', user.id);
  } else {
    user.passwordHash = passwordHash;
    user.email = email;
    user.organization = org;
    user = await userRepo.save(user as any);
    console.log('Updated owner user', user.id);
  }

  const tasksSeed = [
    { title: 'Welcome task', description: 'This is your first task', status: 0 },
    { title: 'Second task', description: 'Another sample task', status: 1 },
  ];

  for (let i = 0; i < tasksSeed.length; i++) {
    const t = tasksSeed[i];
    const existing = await taskRepo.findOne({ where: { title: t.title } }) as any;
    if (!existing) {
      const task: any = taskRepo.create({ title: t.title, description: t.description, status: t.status, owner: org } as any);
      const saved = await taskRepo.save(task as any);
      console.log('Inserted task', saved.id);
    }
  }

  const audit = auditRepo.create({ action: 'seed.init', meta: { note: 'initial seed' }, actor: user, orgId: org } as any) as any;
  const savedAudit = await auditRepo.save(audit as any);
  console.log('Saved audit record', savedAudit.id);

  await AppDataSource.destroy();
  console.log('Entity seed complete');
}

seed().catch((e) => {
  console.error('Entity seed failed', e);
  process.exit(1);
});
