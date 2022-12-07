
const urlDatabase = {
  eOOu4N: {
    longURL: "http://www.example.com",
    ownerID: 'HpuWv3',
  }
};
//password is asdf if you would like to use this test user
const userDatabase = {
  HpuWv3: {
    id: 'HpuWv3',
    email: 'asdf@asdf.com',
    password: '$2a$10$TI/wajXILiX6ri.daOU4Le8..duo.MT3ZcKEJ8b.byS7X7CIn1FTq',
  },
};

const errorList = {
  "ind-login":  "You are not logged in, please login or register and try again",
  "reg-invalid": "Please ensure all fields are filled.",
  "reg-exists": "This email has already been registered, please login instead",
  "log-notfound": "This email is not in our database. Please register instead",
  "log-mismatch": "Password does not match, please try again.",
  "url-notfound": "Hmm, that shortURL was not found, please check your spelling and try again.",
  "url-unowned": "Oops, looks like you don't own that short URL. Please try again.",
};

module.exports = { errorList, userDatabase, urlDatabase };