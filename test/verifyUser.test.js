const { ServiceHandler } = require('../ServiceHandler');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Mock the database module
jest.mock('../db', () => ({
    getDb: jest.fn()
}));

describe('ServiceHandler - verifyUser', () => {
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

    test('should find a user with correct credentials', (done) => {
        const testUser = {
            username: 'testuser',
            password: 'testpass',
            role: 'user'
        };

        mockCollection.findOne.mockImplementation((query, callback) => {
            callback(null, testUser);
        });

        ServiceHandler.verifyUser('testuser', 'testpass', (err, user) => {
            expect(err).toBeNull();
            expect(user).toEqual(testUser);
            done();
        });
    });

    test('should return null for incorrect credentials', (done) => {
        mockCollection.findOne.mockImplementation((query, callback) => {
            callback(null, null);
        });

        ServiceHandler.verifyUser('wronguser', 'wrongpass', (err, user) => {
            expect(err).toBeNull();
            expect(user).toBeNull();
            done();
        });
    });

    test('should handle database errors', (done) => {
        mockCollection.findOne.mockImplementation((query, callback) => {
            callback(new Error('Database error'));
        });

        ServiceHandler.verifyUser('testuser', 'testpass', (err, user) => {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('Database error');
            done();
        });
    });
});
