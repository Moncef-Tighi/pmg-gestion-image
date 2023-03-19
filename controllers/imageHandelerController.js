import fs from 'fs';
import * as articleModel from "../model/article.js"
import * as imageModel from "../model/imageHandeler.js"
import path from 'node:path';

const image_destination = "images_publiées"
const image_location = "images/"

async function moveFile(oldName, marque, division, i, code_article) {

  let newPath = image_destination
  if (marque) newPath+= "/" + marque.trim().toLowerCase()
  if (marque && division) newPath += "/" + division.trim().toLowerCase()
  newPath+= "/" + oldName.split(".")[0] + `(${i+1}).` + oldName.split(".")[1]

  await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
  await fs.promises.rename(image_location+ oldName, newPath);

  let fileLocation = newPath.split("/")
  fileLocation.shift()
  await imageModel.addImage(code_article, fileLocation.join("/"))

}


export const addNewImages =  async ()=> {
  const files = await fs.promises.readdir(image_location)
  const code_articles = files.map((file) => {
    let code_article= ""
    if (file.includes("_")) code_article = file.split("_")[0]
    else code_article = file.split(".")[0]
    return {code_article, src : file}
  });  

  const articles = await articleModel.allArticles({in : code_articles})

  articles.data.forEach(article=> {
    const oldPath = code_articles.find(code_article=> code_article.code_article === article.code_article).src
    moveFile(oldPath, article?.marque, article?.division, article?.images?.length || 0, article.code_article)
  })
}