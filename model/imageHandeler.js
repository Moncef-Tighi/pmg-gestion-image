import pgsql from "./db.js"

export const addImage = async function (code_article, src) {
  await pgsql("article_image").insert({code_article, src})
}