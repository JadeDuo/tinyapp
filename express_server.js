const express = require("express");
const cookieParser = require('cookie-parser');
const { request } = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    ownerID: "testID2"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    ownerID: "testID2"
  },
};

const userDatabase = {
  testID: {
    id: "testID",
    email: "jade.duong@telus.com",
    password: "coolguy123",
  },
  testID2: {
    id: "testID2",
    email: "a@a.com",
    password: "a"
  }
}



//------GET displays------

//displays URLs page
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.redirect("/login");
  }
  const userURLs = urlsForUser(userID)
  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[userID],
    userURLs  };
  return res.render("urls_index", templateVars);
});

//displays URL creation page when logged in, else redirects to login
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: userDatabase[userID] };
  if (!userID){
    return res.redirect("/login");
  }
  return res.render("urls_new", templateVars);
});

//displays Register page, redirects to index if logged in
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: userDatabase[userID] };
  if (userID){
    return res.redirect("/urls");
  }
  return res.render("urls_register", templateVars);
});

//displays Register page, redirects to index if logged in
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: userDatabase[userID] };
  if (userID){
    return res.redirect("/urls");
  }
  return res.render("urls_login", templateVars);
});

// displays the register page with any errors that occured during registration
app.get("/register/:err", (req, res) => {
  let errorMsg = ""
  if(req.params.err === "invalid") {
    errorMsg = "Please ensure all fields are filled."
  }
  if(req.params.err === "exists") {
    errorMsg = "This email has already been registered, please login instead"
  }
  const userID = req.cookies["user_id"];
  const templateVars = { user: userDatabase[userID], errorMsg };
  return res.render("urls_register", templateVars )
})

//displays the login page with appropriate errors
app.get("/login/:err", (req, res) => {
  let errorMsg = ""
  if(req.params.err === "notfound") {
    errorMsg = "This email is not in our database. Please register instead"
  }
  if(req.params.err === "mismatch") {
    errorMsg = "Password does not match, please try again."
  }
  const userID = req.cookies["user_id"];
  const templateVars = { user: userDatabase[userID], errorMsg };
  return res.render("urls_login", templateVars )
})

//displays the results page after making new shorturl
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"]
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: userDatabase[userID] };
  if (!userID) {
    return res.status(400).send("Your are not logged in, please login to continue.");
  } 
  if (urlDatabase[req.params.id].ownerID !== userID) {
    return res.status(400).send("You do not own this short code, please try again.");
  }
  return res.render("urls_show", templateVars);
});
//---------------POST w button-----------------

//creates new short url - on button press
//prevents use when not logged in
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"]
  if (!userID) {
    return res.status(400).send("You are not logged in, please login and try again")
  }
  let id = generateRandomString(6);
  urlDatabase[id] = { 
    longURL: req.body.longURL,
    ownerID: userID,
  }
  console.log(urlDatabase)
  return res.status(200).redirect(`/urls/${id}`);
});

//updates the long url - on button press
//returns error paths if user isn't logged in, ID doesn't exist or shortURL is not owned by user.
app.post("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"]
  if (!userID) {
    return res.status(400).send("You are not logged in, please login to continue.");
  }
  if (!req.params.id) {
    return res.status(400).send("shortURL not found, please try again.")
  }
  if (urlDatabase[req.params.id].ownerID !== userID) {
    return res.status(400).send("Oops, looks like you don't own that short URL. Please try again.");
  }
  let newLongURL = req.body.editURL;
  urlDatabase[req.params.id].longURL = newLongURL;
  return res.redirect("back");
});

//removes coresponding URL from DB - on button press
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies["user_id"]
  if (!userID) {
    return res.status(400).send("You are not logged in, please login to continue.");
  }
  if (!req.params.id) {
    return res.status(400).send("shortURL not found, please try again.")
  }
  if (urlDatabase[req.params.id].ownerID !== userID) {
    return res.status(400).send("Oops, looks like you don't own that short URL. Please try again.");
  }
  console.log(req.params.id)
  delete urlDatabase[req.params.id];
  return res.redirect("/urls");
});

//creates new user and adds to userDB
app.post("/register", (req, res) => {
  //if user fails to fill out one or more fields
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).redirect("/register/invalid")
  }
  //if email already exists in userDB
  if(getUserByEmail(req.body.email) !== null) {
    return res.status(400).redirect("/register/exists")
  }
  //if user doesn't already exist
  id = generateRandomString(6);
  userDatabase[id] = {
    id: id,
    email: req.body.email.toLowerCase(),
    password: req.body.password
  }
  return res.cookie("user_id", id).redirect("/urls")
})

//login on login page. stores user as cookie - on button press
app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email)
  if (!user){
    return res.status(400).redirect("/login/notfound")
  }
  if (req.body.password !== userDatabase[user].password) {
    return res.status(400).redirect("/login/mismatch")
  }
  return res.cookie("user_id", user).redirect("urls");
});

//logout via header. deletes user_id cookie - on button press
app.post("/logout", (req, res) => {
  return res.clearCookie("user_id").redirect("/login");
});

//redirect functionality to long url with u/ID
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if(!longURL) {
    return res.status(400).send("Unknown short url, refirect failed. Please check your spelling.")
  }
  return res.redirect(longURL);
});

//listen text when starting server
app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

//returns the URLs logged in user owns.
const urlsForUser = function (id) {
  let userURLs = {}
  for (let key in urlDatabase) {
    if ( urlDatabase[key].ownerID === id) {
      userURLs[key] = { 
        longURL: urlDatabase[key].longURL,
        ownerID: id,
      }
    }
  }
  return userURLs;
}

//searches userDB to return user object if it exists
const getUserByEmail = function (email) {
  for(let id in userDatabase) {
    if (userDatabase[id].email === email.toLowerCase()){
      return id;
    }
  }
  return null;
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