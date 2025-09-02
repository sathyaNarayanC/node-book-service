const { ServiceHandler } = require('../ServiceHandler');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Mock the database module
jest.mock('../db', () => ({
    getDb: jest.fn()
}));

describe('ServiceHandler - Login', () => {
    let mockDb;
    let mockCollection;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Create mock implementations
        mockCollection = {
            findOne: jest.fn()
        };
        mockDb = {
            db: jest.fn(() => ({
                collection: jest.fn(() => mockCollection)
            }))
        };
        require('../db').getDb.mockReturnValue(mockDb);
    });

    test('should return a valid JWT token when credentials are correct', (done) => {
        const testUser = {
            username: 'testuser',
            password: 'testpass',
            role: 'user'
        };

        mockCollection.findOne.mockImplementation((query, callback) => {
            callback(null, testUser);
        });

        const req = {
            body: {
                username: 'testuser',
                password: 'testpass'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const handler = new ServiceHandler();
        handler.login(req, res);

        setImmediate(() => {
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Authentication successful',
                token: expect.any(String)
            }));

            const jsonResponse = res.json.mock.calls[0][0];
            const decoded = jwt.verify(jsonResponse.token, config.secret);
            expect(decoded.username).toBe('testuser');
            expect(decoded.role).toBe('user');
            done();
        });
    });

    test('should return 401 when credentials are incorrect', (done) => {
        mockCollection.findOne.mockImplementation((query, callback) => {
            callback(null, null);
        });

        const req = {
            body: {
                username: 'wronguser',
                password: 'wrongpass'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const handler = new ServiceHandler();
        handler.login(req, res);

        setImmediate(() => {
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Authentication Failed, Please provide a valid username and password'
            });
            done();
        });
    });

    test('should handle database errors', () => {
        mockCollection.findOne.mockImplementation((query, callback) => {
            callback(new Error('Database error'));
        });

        const req = {
            body: {
                username: 'testuser',
                password: 'testpass'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const handler = new ServiceHandler();
        expect(() => handler.login(req, res)).toThrow('Database error');
    });
});
