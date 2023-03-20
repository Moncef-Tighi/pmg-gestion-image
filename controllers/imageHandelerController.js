import fs from 'fs';
import * as articleModel from "../model/article.js"
import * as imageModel from "../model/imageHandeler.js"
import path from 'node:path';
import createError from 'http-errors'
import slug from 'slug';
slug.charmap['.'] = '.'
slug.charmap['_'] = '_'

const image_destination = "images_publiées"
const image_location = process.env.FTP_FOLDER

async function moveFile(oldName, marque, division, code_article, buffer) {

  let newPath = image_destination
  if (marque) newPath+= "/" + slug(marque.trim().toLowerCase())
  if (marque && division) newPath += "/" + slug(division.trim().toLowerCase())
  newPath+= "/" + oldName

  await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
  if (!buffer) {
    await fs.promises.rename(image_location + oldName, newPath);
  } else {
    await fs.promises.writeFile(newPath, buffer)
  }

  let fileLocation = newPath.split("/")
  fileLocation.shift()
  try {
    await imageModel.addImage(code_article, fileLocation.join("/"))
  } catch(error) {
    console.log(error)
  }

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

  for (const code_article of code_articles) { 
    const article = articles.data.find(article=> 
      article.code_article.toLowerCase()===code_article.code_article.toLowerCase())
    const oldPath = code_article.src
    if (!article) continue
    moveFile(oldPath, article?.marque, article?.division, article.code_article)
  }
}

export const addOneImage = async(request, response, next)=> {
  if (!request.body.code_article) return next(createError(400, "Aucun code article trouvé"))
  const result = await articleModel.allArticles({code_article: request.body.code_article})
  if (!result.data.length===1) return next(createError(400, "Impossible de trouver l'article"));
  const article = result.data[0] 
  await moveFile(request.file.originalname, article.marque, article.division, 
    article.code_article, request.file.buffer)
  return response.status(200).json({
    result : "ok"
  })
}

export const removeOneImage = async(request,response, next) => {
  const code_article = request.body.code_article
  const src = request.body.src
  if (!code_article || !src) return next(createError(400, "Aucun code article trouvé"))
  try {
    await fs.promises.unlink(image_destination + "/" + src)
  } catch(error) {
    console.log(error)
  }
  await imageModel.removeImage(code_article, src)
  return response.status(200).json({
    result : "ok"
  })
}