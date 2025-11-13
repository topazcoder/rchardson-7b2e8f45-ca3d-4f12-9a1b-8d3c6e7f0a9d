import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTaskOwnerFk20251112 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Map tasks that currently reference user ids to the user's organization id,
    // then change the foreign key to reference organization(id).
    await queryRunner.query(`BEGIN`);

    // 1) Map task.ownerId values that point to users -> that user's organizationId
    await queryRunner.query(`
      UPDATE "task_management"."task" t
      SET "ownerId" = u."organizationId"
      FROM "task_management"."user" u
      WHERE t."ownerId" = u.id
        AND u."organizationId" IS NOT NULL
    `);

    // 2) Null out any ownerId that does not correspond to an existing organization
    await queryRunner.query(`
      UPDATE "task_management"."task" t
      SET "ownerId" = NULL
      WHERE t."ownerId" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "task_management"."organization" o WHERE o.id = t."ownerId"
        )
    `);

    // 3) Replace the FK constraint so ownerId references organization(id)
    await queryRunner.query(`ALTER TABLE "task_management"."task" DROP CONSTRAINT IF EXISTS "FK_task_owner"`);

    await queryRunner.query(`
      ALTER TABLE "task_management"."task"
      ADD CONSTRAINT "FK_task_owner"
      FOREIGN KEY ("ownerId")
      REFERENCES "task_management"."organization"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`COMMIT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse: change FK back to reference user(id). This does not attempt
    // to remap organization ids back to user ids (not generally possible).
    await queryRunner.query(`BEGIN`);

    await queryRunner.query(`ALTER TABLE "task_management"."task" DROP CONSTRAINT IF EXISTS "FK_task_owner"`);

    await queryRunner.query(`
      ALTER TABLE "task_management"."task"
      ADD CONSTRAINT "FK_task_owner"
      FOREIGN KEY ("ownerId")
      REFERENCES "task_management"."user"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`COMMIT`);
  }
}
