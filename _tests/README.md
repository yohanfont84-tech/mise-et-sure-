# Tests automatiques du site

Ils tournent tout seuls à chaque envoi sur GitHub : résultat dans l'onglet **Actions** du dépôt.
- ✅ pastille verte : tout fonctionne.
- ❌ pastille rouge : quelque chose est cassé, le détail est dans le journal de l'étape « Lancer tous les tests ».

Le dossier commence par `_` : GitHub Pages ne le publie pas, il n'apparaît donc pas sur misesure.fr.

| Suite | Ce qui est vérifié |
|---|---|
| `code` | Pas d'erreur dans le JavaScript. `index.html` correspond bien à `_source/index.html`. Les pages /tarifs/, /cgu/… sont à jour |
| `site-public` | Accueil affiché sans serveur, vraies adresses, pages fonctionnalités, Google (sitemap, données structurées), logo 3D, téléphone |
| `balayage` | Toutes les pages de chaque rôle en démo, sur ordinateur et téléphone, en clair et en sombre, plus toutes les fenêtres |
| `clics-au-hasard` | Le « robot » clique partout en démo (ordinateur et téléphone) et vérifie que rien ne plante |

Les tests avec le vrai serveur (comptes, paiements, parrainage, équipe…) sont dans le dépôt `mise-et-sure-backend`, dossier `tests/`.

## Les lancer sur un ordinateur

```bash
cd _tests
npm install
npx playwright install chromium
node lancer-les-tests.js
```

Si `code` signale que `index.html` n'est pas à jour : relancez `node _source/build.js` puis `node _source/build-pages.js` depuis la racine du dépôt.
