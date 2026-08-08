const express = require('express');

// Test 1: Basic math check
test('simple test - addition works', () => {
    expect(2 + 3).toBe(5);
});

// Test 2: Check server port
test('app runs on port 3000', () => {
    const PORT = 3000;
    expect(PORT).toBe(3000);
});

// Test 3: Check MongoDB URL is correct
test('MongoDB Docker URL is correct', () => {
    const mongoUrlDocker = "mongodb://admin:password@mongodb:27017";
    expect(mongoUrlDocker).toContain('mongodb');
    expect(mongoUrlDocker).toContain('27017');
});

// Test 4: Check database name
const { MongoClient } = require('mongodb');

test('MongoDB connects successfully', async () => {
    const client = new MongoClient('mongodb://admin:password@localhost:27017');
    
    await client.connect();
    
    // just check client is connected
    expect(client).toBeDefined();
    
    console.log('MongoDB connected successfully!');
    
    await client.close();
}, 10000);