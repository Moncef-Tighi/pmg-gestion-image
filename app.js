import express from "express";
import helmet from 'helmet';
import createError from "http-errors";
import cors from 'cors';
import { errorHandeler } from "./controllers/errorController.js";
import cron, { CronJob } from "cron"
import pgsql from "./model/db.js";
import pino from "pino";
import { addNewImages } from "./controllers/imageHandelerController.js";

const app = express();

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

app.use('/', express.static('./images_publiées'));
app.all('*', (request, response, next) => {
  //Dans ce cas si, le middleware va return une image vide. 
  response.render("./pages/404.ejs", {employe : request?.user})
});

app.use(errorHandeler);

const port = process.env.PORT || 2000;
app.listen(port, () => {
  console.log(`Server ouvert sur le port ${port}`);
});

new CronJob("0 * * * *", addNewImages, null, true, undefined, undefined, true)

export default logger