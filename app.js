import express from "express";
import helmet from 'helmet';
import createError from "http-errors";
import cors from 'cors';
import { errorHandeler } from "./controllers/errorController.js";
import cron, { CronJob } from "cron"
import pgsql from "./model/db.js";
import pino from "pino";
import { addNewImages } from "./controllers/imageHandelerController.js";
import apiRouter from "./Routers/Router.js"

const app = express();


app.use(express.json());
app.use(cors());
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {policy: "cross-origin"}
  })
);
app.use(express.urlencoded({ extended: true }));
app.set('Access-Control-Allow-Origin', '*')

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  },
})

app.use('/api', apiRouter);
app.use('/', express.static('./images_publiées'));
app.all("*", (request,response)=> {
  response.sendFile("not_found.jpg",  { root: "." })
})
app.use(errorHandeler);

const port = process.env.PORT || 2000;
app.listen(port, () => {
  console.log(`Server ouvert sur le port ${port}`);
});

new CronJob("*/30 * * * *", addNewImages, null, true, undefined, undefined, true)

export default logger