import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true }) // 🔹 Ensure it's explicitly a string
  firebaseUid?: string | null;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true }) // 🔹 Ensure it's explicitly a string
  profilePicture?: string | null;

  @Column()
  provider: string;
}
