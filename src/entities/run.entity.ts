import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity() // Marks this class as a database table
export class Run {
  @PrimaryGeneratedColumn() // Auto-incremented ID
  id: number;

  @ManyToOne(() => User) // Many runs belong to one user
  user: User;

  @Column() // Distance in kilometers or miles
  distance: number;

  @Column() // Duration in seconds
  duration: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Auto-set timestamp
  createdAt: Date;
}
