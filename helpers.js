//searches userDB to return user object if it exists
const getUserByEmail = function(email, database) {
  for (let id in database) {
    if (database[id].email === email.toLowerCase()) {
      return id;
    }
  }
  return undefined;
};

//returns the URLs logged in user owns.
const urlsForUser = function(id, database) {
  let userURLs = {};
  for (let key in database) {
    if (database[key].ownerID === id) {
      userURLs[key] = {
        longURL: database[key].longURL,
        ownerID: id,
      };
    }
  }
  return userURLs;
};

const httpify = function(url) {
  if (url.indexOf("http://") !== 0 ) {
    if(url.indexOf("https://") !==0) {
      url = "http://" + url;
    }
  }
  return url;
}


//Randomization helper function for generateRandomString
const getRandomInt = function(max) {
  return Math.floor(Math.random() * max);
};

//Creates userIDs and shortURL IDs. numDigits is 6 for both IDs.
const generateRandomString = function(numDigits) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let str = "";
  for (let i = 0; i < numDigits; i++) {
    str += chars[getRandomInt(chars.length)];
  }
  return str;
};


module.exports = { getUserByEmail, urlsForUser, getRandomInt, generateRandomString, httpify }