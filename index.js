const express = require("express")
const multer = require('multer');
const fs = require('fs');
const FileCleaner = require('cron-file-cleaner').FileCleaner;
const bodyParser = require('body-parser');

const PDFConvert = require('./utils/pdfconvert');


const PORT = 5959;
const HOST = 'localhost';
const UPLOAD_PATH = './uploads';
const OUTPUT_PATH = './outputs';
// app
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const fileUploadWatcher = new FileCleaner(UPLOAD_PATH, 600000,  '* */1 * * * *', {
  start: true
});

const fileOutputWatcher = new FileCleaner(OUTPUT_PATH, 600000,  '* */1 * * * *', {
  start: true
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = ["application/pdf"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Wrong file types");
    error.code = "LIMIT_FILE_TYPES";
    return cb(error, false)
  }
  cb(null, true);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_PATH)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname )
  }
})

const MAX_FILE_SIZE = 20000000;
//configuration
const upload = multer({
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  storage: storage
});



//router
app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.post('/upload', upload.single("file"), (req, res) => {
  res.json({
    file: req.file
  })
});

app.post('/uploads', upload.array("files"), (req, res) => {
  res.json({
    files: req.files
  })
});

app.post('/split', (req, res) => {

  PDFConvert.split(req.body).endPDF();

  res.json({
    files: "file berhasil di split"
  })
});

app.get('/encrypt', (req, res, body) => {
  const data = {
    name: req.query.name,
    password: req.query.password
  }
  console.log(data)
  const filename = PDFConvert.encrypt(data);
  console.log(filename);
  res.status(200).download(filename, filename);
});

app.delete('/deleteUploads', (req, res) => {
  const directory = UPLOAD_PATH;

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });
  res.status(200).json({
    files: "Folder has been deleted"
  })
});



app.use(function (err, req, res, next) {
  if (err.code === "LIMIT_FILE_TYPES") {
    res.status(422).json({
      error: "Only PDF are allowed"
    });
    return;
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(422).json({
      error: `Too Large, Max size is ${MAX_FILE_SIZE/1000000}MB are allowed`
    });
    return;
  }
});

app.listen(PORT, function () {
  console.log(`listening on// ${ HOST }:${ PORT }!`);
});