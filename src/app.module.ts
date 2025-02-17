import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Run } from './entities/run.entity';
import { Challenge } from './entities/challenge.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // ❗ Change to false in production!
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Run, Challenge]), // ✅ Register entities here
  ],
  controllers: [AppController], // ✅ Moved outside TypeOrmModule.forRoot()
  providers: [AppService], // ✅ Moved outside TypeOrmModule.forRoot()
})
export class AppModule {}
