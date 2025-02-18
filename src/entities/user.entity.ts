import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn() // ✅ Auto-generates a unique ID for each user
  id: number;

  @Column({ unique: true }) // ✅ Ensures no duplicate emails
  email: string;

  @Column({ nullable: true }) // ✅ Users can update their name later
  name?: string;

  @Column({ nullable: true }) // ✅ Stores Google profile picture
  profilePicture?: string;

  @Column({ default: 'google' }) // ✅ Auth provider (for now, only Google)
  provider: string;
}
