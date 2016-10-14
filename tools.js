var tools = module.exports = {
   makeFullPath: function(URL) {
   if(!/(http:\/\/)/.test(URL)) {
    return `http://${URL}`
   }
   return URL;
  },

  generateRandomString: function() {
      var generatedString = "";
      var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i <= 5; i++ )
          generatedString += characters.charAt(Math.floor(Math.random() * characters.length));

      return generatedString;
  },

  checkValidUrl: function(urlIn) {
    var regex = new RegExp(urlIn,'g');
    //checks short url in and tests against data base to see if it exists,
    //returns false otherwise
    return regex.test(JSON.stringify(urlDatabase))? true: false;
  }
};