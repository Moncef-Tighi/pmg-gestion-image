import fs from 'fs';
import * as articleModel from "../model/article.js"
import * as imageModel from "../model/imageHandeler.js"
import path from 'node:path';
import createError from 'http-errors'

const image_destination = "images_publiées"
const image_location = "images_FTP/"

async function moveFile(oldName, marque, division, i, code_article, buffer) {

  let newPath = image_destination
  if (marque) newPath+= "/" + marque.trim().toLowerCase()
  if (marque && division) newPath += "/" + division.trim().toLowerCase()
  newPath+= "/" + oldName.split(".")[0] + `(${i+1}).` + oldName.split(".")[1]

  await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
  if (!buffer) {
    await fs.promises.rename(image_location+ oldName, newPath);
  } else {
    await fs.promises.writeFile(newPath, buffer)
  }

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

export const addOneImage = async(request, response, next)=> {
  if (!request.body.code_article) return next(createError(400, "Aucun code article trouvé"))
  const result = await articleModel.allArticles({code_article: request.body.code_article})
  if (!result.data.length===1) return next(createError(400, "Impossible de trouver l'article"));
  const article = result.data[0] 
  await moveFile(request.file.originalname, article.marque, article.division, article.images.length, 
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