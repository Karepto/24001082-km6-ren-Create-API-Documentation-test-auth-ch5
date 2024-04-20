require('dotenv').config();
const express = require('express');
const app = express();
var logger = require('morgan');
// const port = 3000;
const cors = require('cors');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());

const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const fs = require('fs');
const file = fs.readFileSync('./api-docs.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);

app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const v1 = require('./route/v1/index');
app.use('/v1', v1);


module.exports = app;
// app.listen (port, () => {
//     console.log(`app listening at http://localhost:${port}`);
// })