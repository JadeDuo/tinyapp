const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//dead
app.get("/", (req, res) => {
  res.send("Hello! Please go to /urls");
});
//dead
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//displays main URL page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

//displays the url creation page
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//displays the results page after making new shorturl
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

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

//allows delete button to remove that entry from DB
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//allows a user to login using header button
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("back");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//redirects to long url with u/ID
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//listen text
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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