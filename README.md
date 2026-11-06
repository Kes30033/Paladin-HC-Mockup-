# Paladin Healthcare website mockup

**Live site: https://kes30033.github.io/Paladin-HC-Mockup-/**

Review mockup of a simpler [paladinhc.com](https://www.paladinhc.com). It keeps all the live site's products, documents, photos, articles, and contacts, and puts them in far fewer places. Page intros and button labels are new and need Paladin's approval. Nothing here is the live site.

Plain HTML, CSS, and JavaScript with no build step. The review notes (`review-notes.html`) cover what changed, where each old page went, the problems found on the live site, and what Paladin needs to decide.

## Edit on a computer

For people working on the site's code. To view the site, use the live link above.

```bash
python3 -m http.server 4173
```

This starts a private preview at `localhost:4173`, which only opens on the computer running it.

## Pages

- `index.html`: home, with the four main tasks hanging off the rail
- `products.html`: search and filter all 294 products (replaces the catalog and spec sheet pages)
- `product.html?id=…`: one template for every product
- `systems.html`: Evolution and ONE Rail compared, headwalls, existing walls, mobile and surge
- `resources.html`: one library for documents, spec sheets, catalogs, and videos
- `va-dha.html`: JSN cross references, JSN lookup, government contact
- `projects.html`: installation photos by room type, plus the client list
- `about.html`: story, mission, history, quality, partners
- `news.html` and `article.html?id=…`: trade shows, Lunch & Learns, articles, gallery
- `contact.html`: rep finder by state, offices, contact form, team
- `search.html`, `privacy.html`, `terms.html`, `404.html`
- `review-notes.html`: for Paladin's review only

## Where the content lives

Products, documents, photos, people, and events are in `assets/data/`, one file per type, so a change there updates every page that uses it. Thumbnails are in `assets/img/`. Full-size product photos and all PDFs still load from the live site's file host.

## Before going live

- Connect the contact and newsletter forms, which are not connected to a service yet, and review the privacy policy since they collect personal details.
- Have someone at Paladin check the "Fits your rail" filter, which was worked out from part numbers and descriptions.
- Move full-size photos and PDFs off the live site's file host.
- Give products and articles real web addresses, and redirect the old addresses to the new pages.
- Remove `<meta name="robots" content="noindex">` from each page.
- Remove `review-notes.html` and the review notice from each page's footer.
