import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EnergyReading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: null })
  deviceId: number;

  @Column()
  timestamp: Date;

  @Column('decimal', {
    precision: 16,
    scale: 8,
  })
  measurementValue: string;
}
