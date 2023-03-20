import pgsql from "./db.js"

export const addImage = async function (code_article, src) {
  await pgsql("article_image").insert({code_article, src})
}
export const removeImage = async (code_article, src) => {
  await pgsql("article_image").delete().where("code_article", code_article).andWhere("src", src)
}
