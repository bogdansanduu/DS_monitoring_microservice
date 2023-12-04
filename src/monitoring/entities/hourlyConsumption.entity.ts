import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HourlyConsumption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceId: number;

  @Column()
  hourStart: Date;

  @Column('decimal', {
    precision: 16,
    scale: 8,
    default: 0.0,
  })
  totalConsumption: string;
}
