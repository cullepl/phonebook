# phonebook
Readme file for myphonebook app.
The app is based on node js and express and requires these items to be installed to run.

1.  npm install express
2.  npm install fs
3.  npm install body-parser

Example calls:

GET /myphonebook?id=n
Returns the specific ID

GET /myphonebook?surname=smith
Returns all matches for the surname

GET /myphonebook
Returns the entire phonebook json object

PUT /myphonebook?id=n
Also requires a request body.
Replaces the ID specified with the updated items in the request body.

DELETE /myphonebook?id=n
Deletes the entry specified

POST /myphonebook
Also requires a JSON request body.
Creates a new entry in the phonebook


Other requirements:
phonebook.json file in the same directory as the program.
An example file is supplied which details the required json structure.

To run:
Execute this from the command line.
node myphonebook
