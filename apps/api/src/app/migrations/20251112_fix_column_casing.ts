import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixColumnCasing20251112 implements MigrationInterface {
  name = 'FixColumnCasing20251112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename organization.parentid -> "parentId" when present
    await queryRunner.query(`DO $$\nBEGIN\n  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organization' AND column_name='parentid') THEN\n    EXECUTE 'ALTER TABLE "organization" RENAME COLUMN parentid TO "parentId"';\n  END IF;\nEND$$;`);

    // Rename user.passwordhash -> "passwordHash"
    await queryRunner.query(`DO $$\nBEGIN\n  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='passwordhash') THEN\n    EXECUTE 'ALTER TABLE "user" RENAME COLUMN passwordhash TO "passwordHash"';\n  END IF;\nEND$$;`);

    // Rename user.organizationid -> "organizationId"
    await queryRunner.query(`DO $$\nBEGIN\n  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='organizationid') THEN\n    EXECUTE 'ALTER TABLE "user" RENAME COLUMN organizationid TO "organizationId"';\n  END IF;\nEND$$;`);

    // Rename task.ownerid -> "ownerId"
    await queryRunner.query(`DO $$\nBEGIN\n  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='task' AND column_name='ownerid') THEN\n    EXECUTE 'ALTER TABLE "task" RENAME COLUMN ownerid TO "ownerId"';\n  END IF;\nEND$$;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse renames if the camelCase columns exist
    await queryRunner.query(`DO $$\nBEGIN\n  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organization' AND column_name='parentId') THEN\n    EXECUTE 'ALTER TABLE "organization" RENAME COLUMN "parentId" TO parentid';\n  END IF;\nEND$$;`);

    await queryRunner.query(`DO $$\nBEGIN\n  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='passwordHash') THEN\n    EXECUTE 'ALTER TABLE "user" RENAME COLUMN "passwordHash" TO passwordhash';\n  END IF;\nEND$$;`);

    await queryRunner.query(`DO $$\nBEGIN\n  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user' AND column_name='organizationId') THEN\n    EXECUTE 'ALTER TABLE "user" RENAME COLUMN "organizationId" TO organizationid';\n  END IF;\nEND$$;`);

    await queryRunner.query(`DO $$\nBEGIN\n  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='task' AND column_name='ownerId') THEN\n    EXECUTE 'ALTER TABLE "task" RENAME COLUMN "ownerId" TO ownerid';\n  END IF;\nEND$$;`);
  }
}
