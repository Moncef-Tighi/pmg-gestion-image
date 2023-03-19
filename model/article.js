import pgsql from "./db.js"


export const allArticles = async function (param) {

  if (!param.page) param.page = 1

  const articles = await pgsql("article")
    .select(pgsql.raw(`
    article.code_article as code_article, libelle, composition_french, composition_arabic, style, libelle_couleur,
    code_couleur, position_tarif, pays_origine
    , pays_provenance, article.date_creation as date_creation, position_tarif, brand, 
    marque, saison, gender, categorie,division, libelle_arabic, description,age,
    JSON_AGG(DISTINCT jsonb_build_object(
      'taille', article_taille.taille,
      'taille_eu', article_taille.taille_eu,
      'taille_uk', article_taille.taille_uk,
      'taille_us', article_taille.taille_us,
      'code_barre', article_taille.code_barre)) AS tailles,
    array_remove(array_agg(DISTINCT article_image.src), null) AS images
    `))
    .leftOuterJoin('article_taille', 'article.code_article', 'article_taille.code_article')
    .leftOuterJoin("employe as created", "article.fait_par", "created.id_employe")
    .leftOuterJoin("employe as modified", "article.modifie_par", "modified.id_employe")
    .modify(function(queryBuilder) {
      if (param.image==="avec_photo") return queryBuilder.innerJoin("article_image", "article.code_article", "article_image.code_article")
      else queryBuilder.leftOuterJoin("article_image", "article.code_article", "article_image.code_article")
      })   
    .where((query) => {
      if (param.code_article) query.whereRaw("LOWER(article.code_article) LIKE '%' || ? || '%' ", param?.code_article?.toLowerCase());
      if (param.in) query.whereIn(pgsql.raw("LOWER(article.code_article)"), 
        param.in.map(art=> art.code_article.toLowerCase()))
      if (param.division) query.whereRaw("LOWER(article.division) LIKE '%' || ? || '%' ", param.division.toLowerCase());
      if (param.marque) query.whereRaw("LOWER(article.marque) LIKE '%' || ? || '%' ", param.marque.toLowerCase());
      if (param.code_barre) query.whereRaw("LOWER(article_taille.code_barre) LIKE '%' || ? || '%' ", param.code_barre.toLowerCase());
      if (param.image==="sans_photo") query.where("article_image.src", null)
    })
    .orderBy("article.date_creation", "desc")
    .groupBy("libelle","article.code_article", "composition_french", "composition_arabic", "style", 
    "libelle_couleur","code_couleur", "position_tarif", 'age',
    "pays_provenance"  , "pays_origine", "article.date_creation"
    ,"created.nom", "created.prenom", "modified.nom", "modified.prenom")
    .paginate({ perPage: 1000, currentPage: param.page, isLengthAware: true })

  return articles
}
