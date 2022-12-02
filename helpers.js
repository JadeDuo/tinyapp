//searches userDB to return user object if it exists
const getUserByEmail = function(email, database) {
  for (let id in database) {
    if (database[id].email === email.toLowerCase()) {
      return id;
    }
  }
  return null;
};

module.exports = { getUserByEmail }