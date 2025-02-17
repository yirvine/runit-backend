import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity() // Marks this class as a database table
export class User {
  @PrimaryGeneratedColumn() // Auto-incremented ID
  id: number;

  @Column({ unique: true }) // Email must be unique
  email: string;

  @Column({ nullable: true }) // Name is optional
  name: string;

  @Column({ nullable: true }) // Profile picture URL is optional
  profilePicture: string;
}
