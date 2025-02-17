import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Challenge {
  @PrimaryGeneratedColumn() // Auto-incremented ID
  id: number;

  @ManyToOne(() => User) // The user who created the challenge
  creator: User;

  @Column() // Challenge name (e.g., "Run 50km in 30 days")
  title: string;

  @Column() // Description of the challenge
  description: string;

  @Column({ type: 'int' }) // Number of days the challenge lasts
  durationInDays: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // Challenge start date
  startDate: Date;
}
