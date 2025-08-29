// Load test environment variables
require('dotenv').config({ path: '.env.test' });

const tap = require('tap');
const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server: httpServer } = require('../app');
const server = supertest(app);

const mockUser = {
    name: 'Clark Kent',
    email: 'clark@superman.com',
    password: 'Krypt()n8',
    preferences:['movies', 'comics']
};

let token = '';

// Setup: Ensure test database is ready
tap.test('Setup: Connect to test database', async (t) => {
    try {
        // Wait for MongoDB connection to be ready
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/news-aggregator-test');
        }
        t.pass('Test database connected');
        t.end();
    } catch (error) {
        console.error('Database connection error:', error);
        t.fail(`Failed to connect to test database: ${error.message}`);
        t.end();
    }
});

// Auth tests

tap.test('POST /users/register', async (t) => { 
    const response = await server.post('/users/register').send(mockUser);
    t.equal(response.status, 200);
    t.end();
});

tap.test('POST /users/register with missing email', async (t) => {
    const response = await server.post('/users/register').send({
        name: mockUser.name,
        password: mockUser.password
    });
    t.equal(response.status, 400);
    t.end();
});

tap.test('POST /users/login', async (t) => { 
    const response = await server.post('/users/login').send({
        email: mockUser.email,
        password: mockUser.password
    });
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'token');
    token = response.body.token;
    t.end();
});

tap.test('POST /users/login with wrong password', async (t) => {
    const response = await server.post('/users/login').send({
        email: mockUser.email,
        password: 'wrongpassword'
    });
    t.equal(response.status, 401);
    t.end();
});

// Preferences tests

tap.test('GET /users/preferences', async (t) => {
    const response = await server.get('/users/preferences').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'preferences');
    t.same(response.body.preferences, mockUser.preferences);
    t.end();
});

tap.test('GET /users/preferences without token', async (t) => {
    const response = await server.get('/users/preferences');
    t.equal(response.status, 401);
    t.end();
});

tap.test('PUT /users/preferences', async (t) => {
    const response = await server.put('/users/preferences').set('Authorization', `Bearer ${token}`).send({
        preferences: ['movies', 'comics', 'games']
    });
    t.equal(response.status, 200);
    t.end();
});

tap.test('Check PUT /users/preferences', async (t) => {
    const response = await server.get('/users/preferences').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.same(response.body.preferences, ['movies', 'comics', 'games']);
    t.end();
});

// News tests

tap.test('GET /news', async (t) => {
    const response = await server.get('/news').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'news');
    t.end();
});

tap.test('GET /news without token', async (t) => {
    const response = await server.get('/news');
    t.equal(response.status, 401);
    t.end();
});

tap.teardown(async () => {
    try {
        // Only clear collections if connection exists and is open
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            const collections = mongoose.connection.collections;
            for (const key in collections) {
                const collection = collections[key];
                await collection.deleteMany({});
            }
            
            // Close the database connection
            await mongoose.connection.close();
            console.log('Test database cleared and connection closed');
        } else {
            console.log('No active database connection to close');
        }
        
        // Close the HTTP server
        if (httpServer) {
            await new Promise((resolve) => {
                httpServer.close(() => {
                    console.log('HTTP server closed');
                    resolve();
                });
            });
        }
        
        // Let the test runner handle the exit naturally
    } catch (error) {
        console.error('Error during teardown:', error);
        // Let the test runner handle the exit naturally
    }
});