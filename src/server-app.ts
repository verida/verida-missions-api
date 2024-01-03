import bodyParser from 'body-parser'
import express from 'express'
import serverless from 'serverless-http'
import router from './routes'
const cors = require('cors')
require('dotenv').config()

// Set up the express app
const app = express()

// Parse incoming requests data
const corsConfig = {}
app.use(cors(corsConfig))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(router)

module.exports=app
module.exports.handler = serverless(app)