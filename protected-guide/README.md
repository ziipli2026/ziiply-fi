# Ziiply – suojattu mobiiliohje

Erillinen Next.js-sovellus suunniteltuun osoitteeseen `ohje.ziiply.fi`. Julkinen `ziiply.fi` pysyy erillään.

## Todellinen tila
- Lähdekoodissa kirjautuminen, uloskirjautuminen, tietokantaan perustuvat istunnot, kirjautumisyritysten rajoitus ja kirjautumista edellyttävät kuva- sekä HTML-reitit.
- Erillinen Vercel-projekti `ziiply-protected-guide` on luotu, mutta ensimmäinen rakennus epäonnistui hakemistoasetukseen. Toimivaa julkaisua ei ole vahvistettu.
- 406 tunnuksen luonti- ja tuontiskriptit ovat GitHubissa, mutta niiden suoritusta tai tietokantatuontia ei ole vahvistettu.
- Alkuperäinen ohje ja kuvat ovat edelleen julkisesti saatavilla GitHub Pagesissa. **Suojaus ei ole käytössä.**

## Käyttöönottojärjestys
1. Luo erillinen tietokanta ja suorita `schema.sql`. Aseta `GUIDE_DATABASE_URL` salaisena ympäristömuuttujana; älä tallenna sitä GitHubiin.
2. Luo tunnukset yksityiseen hakemistoon: `node scripts/generate-accounts.mjs /secure/private`. Säilytä CSV vain turvallisessa paikassa.
3. Tuo tunnukset: `GUIDE_DATABASE_URL=... node scripts/import-accounts.mjs /secure/private/ziiply-406-credentials.csv`.
4. Kerää kaikki alkuperäisen HTML:n viittaamat kuvat yksityiseen hakemistoon. Säilytä `/images/mobiiliohje/foo.png` nimellä `mobiiliohje--foo.png` ja `/images/foo.png` nimellä `foo.png`. Tarkista kattavuus: `node scripts/audit-guide.mjs /path/index.html /secure/private/assets`.
5. Tuo jokainen kuva `node scripts/import-assets.mjs <asset-name> <file-path>` -komennolla ja alkuperäinen HTML `node scripts/import-guide.mjs /path/index.html` -komennolla.
6. Korjaa Vercel-projektin juurihakemisto tai julkaise tiedostot oikeaan `protected-guide`-hakemistoon. Vahvista onnistunut rakennus ja ympäristömuuttujat.
7. Testaa 401-vastaus ilman istuntoa jokaiselle kuvalle ja ohjesisällölle, kirjautuminen, uloskirjautuminen, väärät tunnukset ja kaikki 37 diaa.
8. Poista alkuperäinen julkinen HTML ja kuvat aktiivisesta GitHub Pages -julkaisusta **vasta onnistuneen suojatun testin jälkeen**. Git-historia ja välimuistit voivat silti säilyttää aiemmin julkistettuja kuvia.
9. Lisää oma verkkotunnus Verceliin ja tee Vercelin osoittama CNAME Zonerissa.

## Huomio
`noindex` ei ole salasanasuojaus. Älä väitä ohjetta suojatuksi ennen kuin vanhat julkiset osoitteet on poistettu käytöstä ja uusi palvelu testattu.
