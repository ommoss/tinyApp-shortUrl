const express = require('express');
const app = express();
const PORT = process.env.ENV_PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const data = [{}]
//nody parser gets code from client side, express uses ejs, sets root
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.set('view engine', 'ejs');

app.get('/urls/login', (req, res) =>{
  res.render("urls_login")
});

app.post('/urls/login', (req, res) =>{
  const username = req.body.username;
  res.cookie("username", username);
  // const password = req.body.password;
  // if(username === data.user.find(name){
  res.redirect('/urls')
  // })
});

app.get("/", (req, res) => {
  res.redirect("/urls/login");
});
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});

app.get("/urls/:id", (req,res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars)
})

app.get("/u/:id", (req, res) => {
  //redirects to webpage if shortURL is a real id
  let shortURL =  req.params.id
  if(checkValidUrl(shortURL)) {
    let longURL = urlDatabase[shortURL];
    res.redirect(302, longURL);
  } else{
    res.redirect("/urls");
  }
});

app.get("/urls/:id/edit", (req, res) => {
  let shortURL = req.params.id;
  let currentURL = urlDatabase[shortURL]
// console.log(shortURL)
// console.log(templateVars)
  res.render('urls_edit', {
    longURL: currentURL,
    id: shortURL
  });
});

app.post("/urls", (req, res) =>{
  let short = generateRandomString();
  urlDatabase[short] = makeFullPath(req.body.longURL);
  res.redirect(302, `/urls`);
});

app.post('/urls/:id', (req, res) => {
  let id = req.params.id;
  if(req.body.newLongURL===""){
    res.redirect(`/urls/${id}/edit`);
  }else{
  let newLongURL = makeFullPath(req.body.newLongURL);
  urlDatabase[id] = newLongURL;
  res.redirect(`/urls`);
}
});
app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect(`/urls`)
})

/*app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});*/
app.listen(PORT, () =>{
  console.log(`now listening on port ${PORT}....`);
});


function makeFullPath(URL) {
   if(!/(http:\/\/)/.test(URL)) {
    return `http://${URL}`
   }
   return URL;
}

function generateRandomString() {
    var generatedString = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i <= 5; i++ )
        generatedString += characters.charAt(Math.floor(Math.random() * characters.length));

    return generatedString;
}

function checkValidUrl(urlIn) {
  var regex = new RegExp(urlIn,'g');
  //checks short url in and tests against data base to see if it exists,
  //returns false otherwise
  return regex.test(JSON.stringify(urlDatabase))? true: false;
}