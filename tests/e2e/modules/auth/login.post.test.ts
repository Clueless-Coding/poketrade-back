import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AuthService } from 'src/core/services/auth.service';
import { UserEntity } from 'src/core/entities/user.entity';
import { buildTestApp } from '../../build-test-app.helper';

const API_ENDPOINT = '/auth/login';

describe('Auth POST /login', () => {
  let app: INestApplication;
  let user: UserEntity;
  let userPassword: string;

  // TODO: Consider using beforeEach
  beforeAll(async () => {
    app = await buildTestApp();

    const authService = app.get(AuthService);

    userPassword = 'PASSWORD';
    const { user: registredUser } = await authService.registerUser({
      username: 'NAME',
      password: userPassword,
      confirmPassword: userPassword,
    });
    user = registredUser;
  }, 30000);

  test('Successful login', async () => {
    const response = await request(app.getHttpServer())
      .post(API_ENDPOINT)
      .send({ username: user.name, password: userPassword });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        user: expect.any(Object),
        accessToken: expect.any(String),
        refreshToken: expect.any(String)
      }),
    );
  });

  test('Wrong username', async () => {
    const response = await request(app.getHttpServer())
      .post(API_ENDPOINT)
      .send({ username: `__${user.name}__`, password: userPassword });

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Wrong username',
        statusCode: 401,
      }),
    )
  });

  test('Wrong password', async () => {
    const response = await request(app.getHttpServer())
      .post(API_ENDPOINT)
      .send({ username: user.name, password: `__${userPassword}__`});

    expect(response.status).toBe(401);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Wrong password',
        statusCode: 401,
      }),
    )
  });

  afterAll(async () => {
    await app.close();
  });
})
