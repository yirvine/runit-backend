import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Run } from './entities/run.entity';
import { Challenge } from './entities/challenge.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module'; // ✅ Import AuthModule

@Module({
  imports: [
    ConfigModule.forRoot(), // Enables .env support
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log('🛠️ TypeORM is connecting with:');
        console.log('   DB_HOST:', configService.get<string>('DB_HOST'));
        console.log('   DB_PORT:', configService.get<number>('DB_PORT'));
        console.log('   DB_USER:', configService.get<string>('DB_USER'));
        console.log(
          '   DB_PASS:',
          configService.get<string>('DB_PASS') ? '******' : 'NOT SET',
        );
        console.log('   DB_NAME:', configService.get<string>('DB_NAME'));

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true, // ❗ Change to false in production!
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Run, Challenge]), // ✅ Register entities here
    AuthModule, // ✅ Add AuthModule here
  ],
  controllers: [AppController], // ✅ Keep this as it is
  providers: [AppService], // ✅ Keep this as it is
})
export class AppModule {}
