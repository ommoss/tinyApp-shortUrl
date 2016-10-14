const express = require('express');
const app = express();
const PORT = process.env.ENV_PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const tools = require('./tools')
var bcrypt = require('bcrypt');
const saltRounds = 10;
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const data = [];
//nody parser gets code from client side, express uses ejs, sets root
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.set('view engine', 'ejs');

app.listen(PORT, () =>{
  console.log(`now listening on port ${PORT}....`);
});
// Brings up login page
app.get('/urls/login', (req, res) =>{
  res.render("urls_login");
});
//Redirects homepage to login
app.get("/", (req, res) => {
  res.redirect("/urls/login");
});
//login in feature
app.post('/urls/login', (req, res) =>{
  const loginUsername = req.body.username;
  const tempP = req.body.password;
  const foundName = data.find((element) => {
    return  loginUsername === element.username;
  });
  //if it can't find the user
  if(foundName === undefined){
    res.redirect('/urls/login');
  }else if(bcrypt.compareSync(tempP, foundName.password) == true){
     //if password matches encrypted password
    req.session.user_id = loginUsername;
    res.redirect('/urls');
  }else{
    //password is wrong but username exsist
    res.redirect('/urls/login');
  }
});

app.post('/urls/logout',(req, res) => {
  res.clearCookie("username");
  res.redirect('/urls/login')
})

app.get('/urls/reg', (req, res) => {
  res.render('urls_reg');
})

app.post('/urls/reg', (req, res) =>{
  const newUsername = req.body.username;
  const temp = req.body.password;
  const foundName = data.find((element) => {
    return newUsername === element.username;
  });
  if(newUsername === undefined){
    //if nothing is put in
    res.redirect('/urls/reg');
  }else if(foundName !== undefined){
    //if user already exist
    res.redirect('/urls/reg');
  }else if(temp.length < 6){
    //if password is shorter than 6 characters
    res.redirect('/urls/reg');
  }
  //Creates New user
  const newUserWebs = [
  {id: "b2xVn2", web: "http://www.lighthouselabs.ca"},
  {id: "9sm5xK", web: "http://www.google.com"}
  ];
  const newPassword = bcrypt.hashSync(temp, 10);
  const newUser = {username:newUsername, password:newPassword, userWebs:newUserWebs};
  data.push(newUser);
  res.redirect('/urls/login');
});

app.get('/urls/guest', (req, res) => {
  const templateVars = {
    username: req.session.user_id,
    urls: urlDatabase
  };
  res.render('urls_guest', templateVars);
});

app.post('/urls/guest', (req, res) =>{5
  res.cookie("username","Guest");
  res.redirect("/urls/guest");
});
//Creates the homepage
app.get("/urls", (req, res) => {
  if(req.session.user_id === undefined){
    res.redirect('/urls/login');
  }else if(req.session.user_id === "Guest"){
    res.redirect('/urls/guest');
  };
  let templateVars = {
    username: req.session.user_id,
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});
//Renders the create a url page
app.get("/urls/new", (req, res) => {
  if(req.session.user_id === undefined){
    res.redirect('/urls/login');
  }else if(req.session.user_id === "Guest"){
    res.redirect('/urls/guest');
  }
  templateVars = {
    username: req.session.user_id
  };
  res.render('urls_new', templateVars);
});

app.get("/urls/user", (req, res) =>{
  if(req.session.user_id === undefined){
    res.redirect('/urls/login');
  }else if(req.session.user_id === "Guest"){
    res.redirect('/urls/guest');
  };
  const username = req.session.user_id;
  const foundName = data.find((element) => {
    return username === element.username;
  })
  let templateVars = {
    username: username,
    urls: foundName.userWebs
  };
  res.render('urls_user', templateVars);
})

app.get("/urls/:id", (req,res) => {
  if(req.session.user_id === undefined){
    res.redirect('/urls/login');
  }else if(req.session.user_id === "Guest"){
    res.redirect('/urls/guest');
  }
  let templateVars = {
    username: req.session.user_id,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
})


app.get("/u/:id", (req, res) => {
  //redirects to webpage if shortURL is a real id
  let shortURL =  req.params.id;
  if(tools.checkValidUrl(shortURL)) {
    let longURL = urlDatabase[shortURL];
    res.redirect(302, longURL);
  }else{
    res.redirect("/urls");
  }
});

app.get("/urls/:id/edit", (req, res) => {
  if(req.session.user_id === undefined){
    res.redirect('/urls/login');
  }else if(req.session.user_id === "Guest"){
    res.redirect('/urls/guest');
  };
  let shortURL = req.params.id;
  let currentURL = urlDatabase[shortURL]
  res.render('urls_edit', {
    username: req.session.user_id,
    longURL: currentURL,
    id: shortURL
  });
});

app.post("/urls/user", (req, res) =>{
  const username = req.session.user_id;
  const foundName = data.find((element) => {
    return username === element.username;
  })
  web ={
    id: tools.generateRandomString(),
    web: tools.makeFullPath(req.body.longURL)
   };
  foundName.userWebs.push(web);
  res.redirect(302, `/urls/user`);
});

app.post('/urls/:id', (req, res) => {
  let id = req.params.id;
  if(req.body.newLongURL===""){
    res.redirect(`/urls/${id}/edit`);
  }else{
  let newLongURL = tools.makeFullPath(req.body.newLongURL);
  urlDatabase[id] = newLongURL;
  res.redirect(`/urls`);
  };
});

app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  const username = req.session.user_id;
  const foundName = data.find((element) => {
    return  username === element.username;
  });
  const web = foundName.userWebs.find((element) => {
    return  id === element.id;
  });
  const index = foundName.userWebs.indexOf(web);
  if (index > -1) {
    foundName.userWebs.splice(index, 1);
  };
  delete urlDatabase[id];
  res.redirect(`/urls/user`);
});

app.post('/urls/:id/publish', (req, res) => {
  let id = req.params.id;
  const username = req.session.user_id;
  const foundName = data.find((element) => {
    return  username === element.username;
  });
  const web = foundName.userWebs.find((element) => {
    return  id === element.id;
  });
  urlDatabase[id] = web.web;
  res.redirect(`/urls`)
});




