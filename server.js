const express = require('express');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser');
const fm = require('front-matter');
const { parse } = require('url');
const fs = require('fs');
const low = require('lowdb');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');
const multer = require('multer');
const path = require('path');
// const upload = multer({ dest: path.join(__dirname, './public/assets/images') });
const upload = multer({ dest: './public/assets/images' })
const { check, validationResult } = require('express-validator');
const adapter = new FileSync('db.json');
const db = low(adapter);
db._.mixin(lodashId);

const app = express();

const PORT = process.env.PORT || 8080;


app.use('/static', express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Read file function. We are using all synchronous functions
const readFile = _file => fs.readFileSync(_file, 'utf8');


// Check if the file exists 
const fileExists = _path => fs.existsSync(_path) && fs.lstatSync(_path).isFile();

// Check if directory exists
const directoryExists = _path => fs.existsSync(_path) && fs.lstatSync(_path).isDirectory();

// remove beginning/trailing slash and file extension
const scrubPathname = _path => _path.replace(/^\/|\/$/g, '').replace(/\.[^/.]+$/, '');

// function to compile the content and the front-matter stuff. Passing in html string and passing in the attributes object from the front matter.
// Handlebars.compile is taking in the source/html content and then returns a function that we then pass the attributes to
const compile = (_source, _attributes = {}) => Handlebars.compile(_source)(_attributes);

const queries = {
    getPlayer: params => params.id && db.get('players').getById(params.id).value(),
    getPlayers: () => {
        return { players: db.get('players').value() };
        // Find how to loop through an array of objects with handlebars
    }



}

// Unlimited amount of middleware functions

// To use validator, we need to put an array full of checks inside the post arguments

app.post('/new-player', upload.single('image'), [
    check('name').isLength({ max: 25, min: 3 }),
    check('age').isInt(),
    check('number').isInt()],
    (req, res, next) => {

        if (req.file) {
            console.log("Uploading image...");

            const uploadStatus = "Image uploaded successfully";
        }
        else {
            console.log("No file uploaded");
            const filename = "File not uploaded";
            const uploadStatus = "File upload failed";
        }

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        db.get('players').insert(req.body).write();
        // Insert function was only taking in the first argument it saw

        db.get('players').find({ name: req.body.name }).assign({ image: req.file.filename }).write();
        // This line of code will add the image attribute to the new object we just added to the db.json file
        res.status(200).end();

    });


app.get('*', (req, res) => {
    // We are getting the requested path 
    const { pathname } = parse(req.url, true);

    // Remove beginning and trailing slashes from the pathname
    let view = scrubPathname(pathname);

    // Set the default status to found
    let status = 200;

    // Setting the default file path
    let mdFile = `./views/${view}.md`;
    let defaultLayout = './layouts/main.md';
    // Is the user requesting the home page?
    if (view.length === 0) {
        view = 'index';
        mdFile = `./views/index.md`;
    }

    // If the file does not exist, set the status to not found and send 404 file
    if (!fileExists(mdFile)) {
        mdFile = './views/404.md';
        status = 404;
    }




    // Read the contents of the found view
    // Front-matter takes files formatted like the md file and converts everything to an object
    // everything below the dashes is returned as the body
    const viewProperties = fm(readFile(mdFile));
    if (viewProperties.attributes.layout) {
        defaultLayout = `./layouts/${viewProperties.attributes.layout}.md`;
    }

    let queryResults = {};

    // Check for table property and query if necessary
    if (viewProperties.attributes.query) {
        queryResults = queries[viewProperties.attributes.query](req.query);
    }

    const layoutProperties = fm(readFile(defaultLayout));
    // To overwrite and add values


    const content = compile(viewProperties.body, { ...viewProperties.attributes, ...queryResults });

    console.log(queryResults);

    const layout = compile(layoutProperties.body, {
        ...layoutProperties.attributes,
        ...viewProperties.attributes,
        body: content
    });

    console.log(queryResults);
    res.status(status).send(layout);
})




app.listen(PORT, () => {
    console.log(`CMS runnning on PORT ${PORT}`);
})




