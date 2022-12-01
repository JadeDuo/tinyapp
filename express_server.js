const express = require("express");
const cookieParser = require('cookie-parser');
const { request } = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  testID: {
    id: "testID",
    email: "jade.duong@telus.com",
    password: "coolguy123",
  }
}



//------GET displays------

//displays URLs page
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: userDatabase[userID] };
  res.render("urls_index", templateVars);
});

//displays URL creation page
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: userDatabase[userID] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: userDatabase[userID] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: userDatabase[userID] };
  res.render("urls_login", templateVars);
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
  res.render("urls_register", templateVars )
})

//displays the results page after making new shorturl
//keep as final display GET
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"]
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: userDatabase[userID] };
  res.render("urls_show", templateVars);
});
//---------------POST w button-----------------

//creates new short url - on button press
app.post("/urls", (req, res) => {
  //we will send a new id here when given a long URL
  let id = generateRandomString(6);
  urlDatabase[id] = req.body.longURL;
  res.status(200);
  res.redirect(`/urls/${id}`);
});

//updates the long url - on button press
app.post("/urls/:id", (req, res) => {
  let newLongURL = req.body.editURL;
  urlDatabase[req.params.id] = newLongURL;
  res.redirect("back");
});

//removes coresponding URL from DB - on button press
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//creates new user and adds to userDB
//need to find a way to make alert pop in the render
app.post("/register", (req, res) => {
  //if user fails to fill out one or more fields
  if (req.body.email === "" || req.body.password === "") {
    res.status(400)
    res.redirect("/register/invalid")
  }
  //if email already exists in userDB
  if(getUserByEmail(req.body.email) !== null) {
    res.status(400)
    res.redirect("/register/exists")
  }
  //if user doesn't already exist
  id = generateRandomString(6);
  userDatabase[id] = {
    id: id,
    email: req.body.email.toLowerCase(),
    password: req.body.password
  }
  res.cookie("user_id", id)
  console.log(userDatabase)
  res.redirect("/urls")
})

//login via header. stores username as cookie - on button press
//requires refactor
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("back");
});

//logout via header. deletes username cookie - on button press
//requires refactor
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//redirect function to long url with u/ID
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//listen text when starting server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//
const getUserByEmail = function (email) {
  for(let id in userDatabase) {
    if (userDatabase[id].email === email.toLowerCase()){
      return id;
    }
  }
  return null;
}

//helper function for generate 
const getRandomInt = function(max) {
  return Math.floor(Math.random() * max);
};

const generateRandomString = function(numDigits) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let str = "";
  for (let i = 0; i < numDigits; i++) {
    str += chars[getRandomInt(chars.length)];
  }
  return str;
};