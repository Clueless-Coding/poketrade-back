import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthUseCase } from 'src/core/use-cases/auth.use-case';
import { buildTestApp } from '../../build-test-app.helper';

const API_ENDPOINT = '/auth/register';

describe('Auth POST /register', () => {
  let app: INestApplication;

  // TODO: Consider using beforeEach
  beforeAll(async () => {
    app = await buildTestApp();
  }, 30000);

  test('Successful registration', async () => {
    const username = 'NAME1';
    const password = 'PASSWORD1';
    const response = await request(app.getHttpServer())
      .post(API_ENDPOINT)
      .send({ username, password, confirmPassword: password });

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(
      expect.objectContaining({
        user: expect.any(Object),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    );
  });

  test('Password does not match', async () => {
    const username = 'NAME2';
    const password = 'PASSWORD2';
    const response = await request(app.getHttpServer())
      .post(API_ENDPOINT)
      .send({ username, password, confirmPassword: `__${password}__` });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Passwords does not match",
        statusCode: HttpStatus.BAD_REQUEST,
      }),
    )
  });

  test('User with this name already exists', async () => {
    const authUseCase = app.get(AuthUseCase);

    const username = 'NAME3';
    const password = 'PASSWORD3';
    const { user } = await authUseCase.registerUser({
      username,
      password,
      confirmPassword: password,
    });

    const response = await request(app.getHttpServer())
      .post(API_ENDPOINT)
      .send({ username: user.name, password, confirmPassword: password });

    expect(response.status).toBe(HttpStatus.CONFLICT)
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'User with this name already exists',
        statusCode: HttpStatus.CONFLICT,
      }),
    );
  })

  afterAll(async () => {
    await app.close();
  });
})
