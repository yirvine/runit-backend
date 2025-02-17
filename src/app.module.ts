import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Run } from './entities/run.entity';
import { Challenge } from './entities/challenge.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433, // Updated to match Docker setup
      username: 'runit_user',
      password: 'securepassword',
      database: 'runit',
      autoLoadEntities: true,
      synchronize: true, // ❗ Change to false in production!
    }),
    TypeOrmModule.forFeature([User, Run, Challenge]), // ✅ Register entities here
  ],
  controllers: [AppController], // ✅ Moved outside TypeOrmModule.forRoot()
  providers: [AppService], // ✅ Moved outside TypeOrmModule.forRoot()
})
export class AppModule {}
