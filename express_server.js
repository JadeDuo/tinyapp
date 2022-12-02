const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: [ "meeples", "hexagons"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


const urlDatabase = {
  
};

const userDatabase = {
  HpuWv3: {
    id: 'HpuWv3',
    email: 'asdf@asdf.com',
    password: '$2a$10$TI/wajXILiX6ri.daOU4Le8..duo.MT3ZcKEJ8b.byS7X7CIn1FTq'
  },
};

//------GET displays------

//displays URLs page
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  }
  const userURLs = urlsForUser(userID);
  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[userID],
    userURLs  };
  return res.render("urls_index", templateVars);
});

//displays URL creation page when logged in, else redirects to login
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: userDatabase[userID] };
  if (!userID) {
    return res.redirect("/login");
  }
  return res.render("urls_new", templateVars);
});

//displays Register page, redirects to index if logged in
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: userDatabase[userID] };
  if (userID) {
    return res.redirect("/urls");
  }
  return res.render("urls_register", templateVars);
});

//displays Register page, redirects to index if logged in
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: userDatabase[userID] };
  if (userID) {
    return res.redirect("/urls");
  }
  return res.render("urls_login", templateVars);
});

// displays the register page with any errors that occured during registration
app.get("/register/:err", (req, res) => {
  let errorMsg = "";
  if (req.params.err === "invalid") {
    errorMsg = "Please ensure all fields are filled.";
  }
  if (req.params.err === "exists") {
    errorMsg = "This email has already been registered, please login instead";
  }
  const userID = req.session.user_id;
  const templateVars = { user: userDatabase[userID], errorMsg };
  return res.render("urls_register", templateVars);
});

//displays the login page with appropriate errors
app.get("/login/:err", (req, res) => {
  let errorMsg = "";
  if (req.params.err === "notfound") {
    errorMsg = "This email is not in our database. Please register instead";
  }
  if (req.params.err === "mismatch") {
    errorMsg = "Password does not match, please try again.";
  }
  const userID = req.session.user_id;
  const templateVars = { user: userDatabase[userID], errorMsg };
  return res.render("urls_login", templateVars);
});

//displays the results page after making new shorturl
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send("You are not logged in, please login to continue.");
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("Oops! That short URL doesn't exist");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: userDatabase[userID] };
  if (urlDatabase[req.params.id].ownerID !== userID) {
    return res.status(400).send("You do not own this short code, please try again.");
  }
  return res.render("urls_show", templateVars);
});
//---------------POST w button-----------------

//creates new short url - on button press
//prevents use when not logged in
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send("You are not logged in, please login and try again");
  }
  let url = req.body.longURL;
  if (url.indexOf("http://") !== 0 || url.indexOf("https://") !== 0) {
    url = "http://" + url;
  }
  let id = generateRandomString(6);
  urlDatabase[id] = {
    longURL: url,
    ownerID: userID,
  };
  return res.status(200).redirect(`/urls/${id}`);
});

//updates the long url - on button press
//returns error paths if user isn't logged in, ID doesn't exist or shortURL is not owned by user.
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send("You are not logged in, please login to continue.");
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("shortURL not found, please try again.");
  }
  if (urlDatabase[req.params.id].ownerID !== userID) {
    return res.status(400).send("Oops, looks like you don't own that short URL. Please try again.");
  }
  let newLongURL = req.body.editURL;
  if (newLongURL.indexOf("http://") !== 0 || newLongURL.indexOf("https://") !== 0) {
    newLongURL = "http://" + newLongURL;
  }
  urlDatabase[req.params.id].longURL = newLongURL;
  return res.redirect("back");
});

//removes coresponding URL from DB - on button press
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(400).send("You are not logged in, please login to continue.");
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("shortURL not found, please try again.");
  }
  if (urlDatabase[req.params.id].ownerID !== userID) {
    return res.status(400).send("Oops, looks like you don't own that short URL. Please try again.");
  }
  delete urlDatabase[req.params.id];
  return res.redirect("/urls");
});

//creates new user and adds to userDB
app.post("/register", (req, res) => {
  //if user fails to fill out one or more fields
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).redirect("/register/invalid");
  }
  //if email already exists in userDB
  if (getUserByEmail(req.body.email, userDatabase) !== null) {
    return res.status(400).redirect("/register/exists");
  }
  //if user doesn't already exist
  const id = generateRandomString(6);
  userDatabase[id] = {
    id: id,
    email: req.body.email.toLowerCase(),
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = id;
  console.log(userDatabase);
  return res.redirect("/urls");
});

//login on login page. stores user as cookie - on button press
app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, userDatabase);
  if (!user) {
    return res.status(400).redirect("/login/notfound");
  }
  if (!bcrypt.compareSync(req.body.password, userDatabase[user].password)) {
    return res.status(400).redirect("/login/mismatch");
  }
  req.session.user_id = user;
  return res.redirect("urls");
});

//logout via header. deletes user_id cookie - on button press
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

//redirect functionality to long url with u/ID
app.get("/u/:id", (req, res) => {
  const urlObj = urlDatabase[req.params.id];
  if (!urlObj) {
    return res.status(400).send("Unknown short url, refirect failed. Please check your spelling.");
  }
  return res.redirect(urlObj.longURL);
});

//listen text when starting server
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

//returns the URLs logged in user owns.
const urlsForUser = function(id) {
  let userURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].ownerID === id) {
      userURLs[key] = {
        longURL: urlDatabase[key].longURL,
        ownerID: id,
      };
    }
  }
  return userURLs;
};


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