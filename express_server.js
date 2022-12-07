const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString, httpify } = require("./helpers");
const { errorList, userDatabase, urlDatabase } = require("./databases");

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

//------GET endpoints------
// redirects root to urls if logged in, and login otherwise
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

//displays users URLs page when logged in, else redirects to login
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/error/ind-login");
  }
  const userURLs = urlsForUser(userID, urlDatabase);
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

//displays Register page, redirects to users URLs if logged in
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: userDatabase[userID] };
  if (userID) {
    return res.redirect("/urls");
  }
  return res.render("urls_register", templateVars);
});

//displays Register page, redirects to users URLS if logged in
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: userDatabase[userID] };
  if (userID) {
    return res.redirect("/urls");
  }
  return res.render("urls_login", templateVars);
});

//displays the results page after making new shortID. redirects to errors if not logged in, url not valid or url not owned.
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/error/ind-login");
  }
  if (!urlDatabase[req.params.id]) {
    return res.redirect("/error/url-notfound");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: userDatabase[userID] };
  if (urlDatabase[req.params.id].ownerID !== userID) {
    return res.redirect("/error/url-unowned");
  }
  return res.render("urls_show", templateVars);
});

// redirects user to longurl of the given shortID
app.get("/u/:id", (req, res) => {
  const urlObj = urlDatabase[req.params.id];
  if (!urlObj) {
    return res.redirect("/error/url-notfound");
  }
  return res.redirect(urlObj.longURL);
});

// Displays an error page that gives details on errors encountered
app.get("/error/:err", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: userDatabase[userID], errKey: req.params.err, errorList };
  return res.render("urls_error", templateVars);
});
//---------------POST w button-----------------

//creates new short url, stores in urlDB. redirects to error if not logged in.
//adds http:// automatically if user doesn't input it
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/error/ind-login");
  }
  let url = req.body.longURL;
  url = httpify(url);
  let id = generateRandomString(6);
  urlDatabase[id] = {
    longURL: url,
    ownerID: userID,
  };
  return res.redirect(`/urls/${id}`);
});

//updates the long url value in urlDB.
//redirects to error paths if user isn't logged in, ID doesn't exist or shortURL is not owned by user.
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/error/ind-login");
  }
  if (!urlDatabase[req.params.id]) {
    return res.redirect("/error/url-notfound");
  }
  if (urlDatabase[req.params.id].ownerID !== userID) {
    return res.redirect("url-unowned");
  }
  let editURL = req.body.editURL;
  editURL = httpify(editURL);
  urlDatabase[req.params.id].longURL = editURL;
  return res.redirect("/urls");
});

//removes URL from DB
//redirects to error paths if user isn't logged in, ID doesn't exist or shortURL is not owned by user.
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/error/ind-login");
  }
  if (!urlDatabase[req.params.id]) {
    return res.redirect("/error/url-notfound");
  }
  if (urlDatabase[req.params.id].ownerID !== userID) {
    return res.redirect("/error/url-unowned");
  }
  delete urlDatabase[req.params.id];
  return res.redirect("/urls");
});

//creates new user and adds to userDB
//redirects to error paths if form isn't filled or email exists in userDB
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.redirect("/error/reg-invalid");
  }
  if (getUserByEmail(req.body.email, userDatabase) !== undefined) {
    return res.redirect("/error/reg-exists");
  }
  const id = generateRandomString(6);
  userDatabase[id] = {
    id: id,
    email: req.body.email.toLowerCase(),
    password: bcrypt.hashSync(req.body.password, 10),
  };
  req.session.user_id = id;
  return res.redirect("/urls");
});

//logs in existing user and stores user as cookie
//redirects to error paths if email not found in DB or password mismatch.
app.post("/login", (req, res) => {
  let user = getUserByEmail(req.body.email, userDatabase);
  if (!user) {
    return res.redirect("/error/log-notfound");
  }
  if (!bcrypt.compareSync(req.body.password, userDatabase[user].password)) {
    return res.redirect("/error/log-mismatch");
  }
  req.session.user_id = user;
  return res.redirect("urls");
});

//logout via header. deletes user_id cookie. redirects to login.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//listen text when starting server
app.listen(PORT, () => {
  console.log(`Tiny app reporting for duty on port ${PORT}!`);
});