import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial0001 implements MigrationInterface {
  name = 'Initial0001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension exists for uuid_generate_v4()
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "parentId" uuid, CONSTRAINT "UQ_organization_name" UNIQUE ("name"), CONSTRAINT "PK_organization" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" character varying NOT NULL, "organizationId" uuid, CONSTRAINT "UQ_user_username" UNIQUE ("username"), CONSTRAINT "PK_user" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "status" character varying NOT NULL, "category" character varying, "order" integer NOT NULL DEFAULT 0, "ownerId" uuid, CONSTRAINT "PK_task" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "audit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "meta" json, "actorId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_audit" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_user_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_task_owner" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "audit" ADD CONSTRAINT "FK_audit_actor" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "audit" DROP CONSTRAINT "FK_audit_actor"`);
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_task_owner"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_organization"`);
    await queryRunner.query(`DROP TABLE "audit"`);
    await queryRunner.query(`DROP TABLE "task"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "organization"`);
  }
}
