const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID, `user:${user} is equal to expected:${expectedUserID} `)
  });
  
  it('should return undefined if given email not in DB', function() {
    const user = getUserByEmail("user47@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput, `user:${user} is equal to expected:${expectedOutput} `)
  });
});