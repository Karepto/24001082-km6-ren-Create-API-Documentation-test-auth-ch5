const request = require('supertest');
const app = require('../../app');

describe('User API', () => {
  describe('POST /v1/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/v1/register')
        .send({
          name: 'tate6',
          email: 'tate6@mail.com',
          password: 'tate123',
          profileData: {
            identityType: 'KTP',
            identityNumber: '22315463566643',
            address: 'Surakarta',
          },
        });
      expect(response.status).toBe(201);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('user created');
      expect(response.body.data).toHaveProperty('id');
    });

    it('should return 400 if email already exists', async () => {
      await request(app).post('/v1/register').send({
        name: 'nanang',
        email: 'nanang@mail.com',
        password: 'nanang123',
        profileData: {
          identityType: 'KTP',
          identityNumber: '9384756473',
          address: 'Jakarta',
        },
      });

      // Try to register user with existing email
      const response = await request(app)
        .post('/v1/register')
        .send({
          name: 'anotherUser',
          email: 'nanang@mail.com',
          password: 'password123',
          profileData: {
            identityType: 'KTP',
            identityNumber: '1234567890',
            address: 'Surabaya',
          },
        });
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe('email already exist');
      expect(response.body.data).toBeNull();
    });
  });

    describe('POST /v1/login', () => {
      it('should login with correct credentials', async () => {
        const response = await request(app)
          .post('/v1/login')
          .send({
            email: 'tate3@mail.com',
            password: 'tate123',
          });
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe('User logged in successfully');
        expect(response.body.data).toHaveProperty('token');
      });
  
      it('should return 400 for invalid credentials', async () => {
        const response = await request(app)
          .post('/v1/login')
          .send({
            email: 'nonexistentuser@mail.com',
            password: 'invalidpassword',
          });
        expect(response.status).toBe(400);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe('email or password are wrong');
        expect(response.body.data).toBeNull();
      });
  
      it('should return 400 if email or password is missing', async () => {
        const response = await request(app)
          .post('/v1/login')
          .send({
            // Missing email
            password: 'nanang123',
          });
        expect(response.status).toBe(400);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe('email and password are required');
        expect(response.body.data).toBeNull();
      });
    });
  
    describe('GET /v1/check-auth', () => {
      it('should return user data if authenticated', async () => {
        // Perform login to get authentication token
        const loginResponse = await request(app)
          .post('/v1/login')
          .send({
            email: 'tate2@mail.com',
            password: 'tate123',
          });
        const authToken = loginResponse.body.data.token;
  
        // Send authenticated request to check-auth endpoint
        const response = await request(app)
          .get('/v1/check-auth')
          .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe('This User is already authorized');
        expect(response.body.data.user).toHaveProperty('id');
        expect(response.body.data.user).toHaveProperty('name');
        expect(response.body.data.user).toHaveProperty('email');
      });
  
      it('should return 401 if not authenticated', async () => {
        const response = await request(app)
          .get('/v1/check-auth');
        expect(response.status).toBe(401);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe('token not provided!');
        expect(response.body.data).toBeNull();
      });
    });

  describe('GET /v1/users', () => {
    it('should return list of users', async () => {
      const response = await request(app).get('/v1/users');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('OK');
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /v1/users/:id', () => {
    it('should return user by ID', async () => {
      const userId = 1;
      const response = await request(app).get(`/v1/users/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe('OK');
      expect(response.body.data).toHaveProperty('id', userId);
    });

    it('should return 404 if user not found', async () => {
      const userId = 999;
      const response = await request(app).get(`/v1/users/${userId}`);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Account API', () => {
    describe('POST /v1/make-accounts', () => {
      it('should create a new account', async () => {
        const response = await request(app)
          .post('/v1/make-accounts')
          .send({
            userId: 1,
            bankName: 'Mandiri',
            bankAccountNumber: '948239219',
            balance: 1000000.00,
          });
        expect(response.status).toBe(201);
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe('OK');
        expect(response.body.data).toHaveProperty('id');
      });
    });

    describe('GET /v1/accounts', () => {
      it('should return list of accounts', async () => {
        const response = await request(app).get('/v1/accounts');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe('OK');
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('GET /v1/accounts/:id', () => {
      it('should return account by ID', async () => {
        const accountId = 2;
        const response = await request(app).get(`/v1/accounts/${accountId}`);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe('OK');
        expect(response.body.data).toHaveProperty('id', accountId);
      });

      it('should return 404 if account not found', async () => {
        const accountId = 999;
        const response = await request(app).get(`/v1/accounts/${accountId}`);
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('bank account not found');
      });
    });
  });

  describe('Transaction API', () => {
    describe('POST /v1/make-transactions', () => {
      it('should create a new transaction', async () => {
        const response = await request(app)
          .post('/v1/make-transactions')
          .send({
            sourceAccountId: 3,
            destinationAccountId: 2,
            amount: 100.00,
          });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Transaction successful');
      });

      it('should return 400 for insufficient balance', async () => {
        const response = await request(app)
          .post('/v1/make-transactions')
          .send({
            sourceAccountId: 3,
            destinationAccountId: 2,
            amount: 100000000, // Excessive amount to cause error
          });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Insufficient balance');
      });

      it('should return 404 if source or destination account not found', async () => {
        // Test case for source account not found
        const responseSource = await request(app)
          .post('/v1/make-transactions')
          .send({
            sourceAccountId: 999,
            destinationAccountId: 2,
            amount: 100.00,
          });
        expect(responseSource.status).toBe(404);
        expect(responseSource.body.error).toBe('Source or destination account not found');

        // Test case for destination account not found
        const responseDestination = await request(app)
          .post('/v1/make-transactions')
          .send({
            sourceAccountId: 3,
            destinationAccountId: 999,
            amount: 100.00,
          });
        expect(responseDestination.status).toBe(404);
        expect(responseDestination.body.error).toBe('Source or destination account not found');
      });
    });

    describe('GET /v1/transactions', () => {
      it('should return list of transactions', async () => {
        const response = await request(app).get('/v1/transactions');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe('OK');
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('GET /v1/transactions/:transactionId', () => {
      it('should return transaction by ID', async () => {
        // Assume a transaction with ID 2 exists
        const transactionId = 2;
        const response = await request(app).get(`/v1/transactions/${transactionId}`);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe('OK');
        expect(response.body.data).toHaveProperty('id', transactionId);
        expect(response.body.data).toHaveProperty('amount');
        expect(response.body.data).toHaveProperty('sender');
        expect(response.body.data).toHaveProperty('recipient');
      });

      it('should return 404 if transaction not found', async () => {
        // Assume a transaction with non-existent ID
        const transactionId = 999;
        const response = await request(app).get(`/v1/transactions/${transactionId}`);
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Transaction not found');
      });
    });
  });
});
