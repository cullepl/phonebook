// My Phonebook HTTP application
// Based on express
// Provides methods to do the following:
// 1.) List all entries in the phone book
// 2.) Search on surname (case sensitive search)
// 3.) Add a new entry
// 4.) Modify an existing entry .

var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var fs             = require('fs');
var phonebookFile  = 'phonebook.json';
app.use(bodyParser.json());
var allowedKeys = ['Surname','Firstname','Phone','Address'];

var phonebook = JSON.parse(fs.readFileSync(phonebookFile, 'utf8'));

// GET returns the contents of the phonebook or uses a query parameter to find a particular entry
// for example: /myphonebook?surname=smith
app.get('/myphonebook/', function(req, res){
    
    // Search - query parm id
    if (req.query.id)
    {
        var id = req.query.id;
        if (!phonebook.hasOwnProperty(id)){
          res.send('id '+id+ ' does not exists in the phonebook');
          return;
        }
        else {
           res.send(phonebook[id]);
           return;
        }
    }
    //Search - query parm surname
    if (req.query.surname)
    {
        // Iterate through the phonebook entries
        // Try and find a match for the surname
        // If no matches found, return a string no matches.
        // Note:  This is a case sensitive search so if the entry is Smith, then surname=smith will not match it.
        var responseBody = {};
        for (var entry in phonebook) {
           if(phonebook.hasOwnProperty(entry)) {
              if(phonebook[entry].Surname == req.query.surname) {
                 responseBody[entry] = phonebook[entry]; 
              }
           }
        }
        if (null == responseBody) {
            // We'll return an empty json body but log that we've failed to find anything
            console.log('No Matching entries found for search ' + req.query.surname);
        }
        console.log(responseBody.length);
        res.send(responseBody);
        return;
    }
    else {
        // Return the lot
        res.send(phonebook);
        return;
    }
  
});



//********************************************************
// POST to write a new entry - reads in the request body
//********************************************************
app.post('/myphonebook', function (req, res) {
  var itemToAdd = req.body;
  console.log('Attempting to add this body:');
  console.log(itemToAdd); 
  // Check that the required info has been passed to us...
  // We require surname, firstname and phone as a minimum, address is optional.
  if (!itemToAdd.hasOwnProperty('Surname') || !itemToAdd.hasOwnProperty('Firstname') || !itemToAdd.hasOwnProperty('Phone')) {
    res.status(400).send('Invalid json passed - must include all of Surname, Firstname and Phone - optional Address.');
    return;
  }
  // Check that no invalid keys have been passed.
  for(var value in itemToAdd){
    //Check that the name matches something in the allowed_keys array
    if (allowedKeys.indexOf(value) == -1) {
       // Throw an error as an invalid key has been found
       console.log('Invalid key specified: ' + value);
       res.status(400).send('Invalid key provided. You must include all of Surname, Firstname and Phone - optional Address. No other values are valid.');
       return;
    }
  }
  // Now were ready to add this new entry
  // Add the new entry to the phonebook object in memory
  var keys = Object.keys(phonebook);
  var numberOfEntries = keys.length;
  console.log('Length = ' + numberOfEntries);
  phonebook[numberOfEntries+1] = itemToAdd;
  console.log('New phonebook to be written' + phonebook);
  // Write to fs
  fs.writeFile(phonebookFile, JSON.stringify(phonebook, null, 4), function(err) {
    if(err) {
      // If it fails, log the error and return
      console.log(err);
      res.status(500).send('Failed to update the phonebook');
      return;
    } else {
      console.log("New entry added");
      res.send("New entry successfully added");
      return;
    }
  }); 
      
});


//********************************************************
// Delete - uses query parm to delete an entry/id
//********************************************************
app.delete('/myphonebook', function(req, res){
  if (req.query.id)
  {
      var id = req.query.id;
      // Try and find the ID
      if (!phonebook.hasOwnProperty(id)){
        res.status(400).send('ID '+id+' does not exists in the phonebook');
        return;
      }
    
      // Delete it if found
      delete phonebook[id];
      // Write updated object back to the phonebook file on fs
      console.log('Deleting phonebook entry '+id);
      fs.writeFile(phonebookFile, JSON.stringify(phonebook, null, 4), function(err){
          if(err) {
            console.log(err);
            res.status(500).send('Failed to delete from the phonebook');
            return;
          }
      });
      console.log('ID '+id+' Removed from phonebook');
      res.send('Phonebook updated');
  }
  else {
     res.status(400).send('Phonebook not updated, no query param supplied.');
  }
});
//********************************************************
// PUT  - Update an ID
//********************************************************
// Probably quite crude but replaces the whole entry with the json body passed to it.
// takes a query param which is the ID
app.put('/myphonebook', function(req, res){
  var itemToChange = req.body;
  console.log('Attempting to add this body:');
  console.log(itemToChange);
  if (req.query.id)
  {
      var id = req.query.id;
      // Try and find the ID
      if (!phonebook.hasOwnProperty(id)){
        res.status(400).send('ID '+id+' does not exists in the phonebook so cannot update it');
        return;
      }
      // If we got this far, the ID exists.
      // Update the phonebook with the body passed.
       
      // Check that the required info has been passed to us...
      // We require surname, firstname and phone as a minimum, address is optional.
      if (!itemToChange.hasOwnProperty('Surname') || !itemToChange.hasOwnProperty('Firstname') || !itemToChange.hasOwnProperty('Phone')) {
        res.status(400).send('Invalid json passed - must include all of Surname, Firstname and Phone - optional Address.');
        return;
      }
      // Check that no invalid keys have been passed.
      for(var value in itemToChange){
        //Check that the name matches something in the allowed_keys array
        if (allowedKeys.indexOf(value) == -1) {
           // Throw an error as an invalid key has been found
           console.log('Invalid key specified: ' + value);
           res.status(400).send('Invalid key provided. You must include all of Surname, Firstname and Phone - optional Address. No other values are valid.');
           return;
        }
      }
      // Now were ready update the entry
      // Rather than add, we take the ID and override what is in that position in the array
      phonebook[id] = itemToChange;
      console.log('phonebook updated');
      // Write to fs
      fs.writeFile(phonebookFile, JSON.stringify(phonebook, null, 4), function(err) {
        if(err) {
          // If it fails, log the error and return
          console.log(err);
          res.status(500).send('Failed to update the phonebook');
          return;
        } else {
          console.log('ID '+id+ ' has been updated');
          res.send('ID '+id+ ' has been updated');
          return;
        }
      });
      
  } else {
      console.log('no IDs have been updated - no or incorrect query param supplied.');
      res.status(400).send('Phonebook not updated, no, or incorrect query param supplied.');
  }
  

});
app.listen(3000);
