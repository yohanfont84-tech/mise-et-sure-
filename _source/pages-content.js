// Contenu des pages « fonctionnalité » (misesure.fr/haccp/, /fiche-technique/…), faites pour être
// trouvées sur Google par un restaurateur qui cherche une solution précise.
//
// C'est ICI qu'on modifie les textes. Ensuite : node _source/build-pages.js (voir ce fichier).
// Conseils pour le référencement : un titre (title) de moins de 60 caractères, une description de
// 140 à 160 caractères, et des mots que les restaurateurs tapent vraiment dans Google.

module.exports = [
  {
    slug: 'haccp',
    title: 'Logiciel HACCP pour restaurant — relevés et traçabilité',
    description: "Relevés de température, plan de nettoyage, numéros de lot : tenez votre HACCP sur téléphone, sans classeur papier. Prêt pour le contrôle sanitaire. Essai gratuit.",
    kicker: 'Suivi HACCP',
    h1: 'Votre HACCP sur téléphone, prêt pour le contrôle sanitaire',
    intro: "Fini le classeur de relevés taché et incomplet. Chaque relevé de température, chaque nettoyage et chaque numéro de lot est daté, signé et rangé automatiquement — consultable en deux clics le jour où l'inspecteur passe.",
    image: 'mkt-haccp.webp',
    imageAlt: 'Écran de suivi HACCP de Mise & Sûre : relevés de température des frigos',
    benefits: [
      { icon: '🌡️', title: 'Relevés de température', text: "Frigos, chambres froides, congélateurs : saisie en 5 secondes, alerte immédiate si une température sort des seuils que vous avez fixés." },
      { icon: '🧽', title: 'Plan de nettoyage', text: "Tâches quotidiennes, hebdomadaires ou mensuelles, cochées par l'équipe. Vous voyez d'un coup d'œil ce qui a été fait, et par qui." },
      { icon: '🏷️', title: 'Traçabilité des lots', text: "Le numéro de lot est noté à la réception de chaque livraison : en cas de rappel produit, vous retrouvez tout instantanément." },
      { icon: '✍️', title: 'Historique sincère', text: "Une correction garde la valeur d'origine, l'auteur et la date. C'est exactement ce qu'attend un contrôleur." },
    ],
    steps: [
      "Ajoutez vos équipements froids avec leurs seuils (ex. 0 à 4 °C).",
      "L'équipe fait ses relevés et coche le nettoyage depuis son téléphone.",
      "Le jour du contrôle, vous montrez l'historique complet, daté et signé.",
    ],
    faq: [
      { q: "Le suivi HACCP numérique est-il accepté lors d'un contrôle ?", a: "Oui. La réglementation impose de pouvoir prouver vos autocontrôles, pas d'utiliser du papier. Un registre numérique daté, avec l'auteur de chaque relevé et l'historique des corrections, répond à cette exigence." },
      { q: 'Faut-il un thermomètre connecté ?', a: "Non. Vos thermomètres actuels suffisent : la personne lit la température et la saisit en quelques secondes. Mise & Sûre s'occupe de la date, de l'auteur et de l'alerte en cas d'anomalie." },
      { q: 'Le module HACCP est-il en option ?', a: "Non, il est inclus dans tous les forfaits. Il est désactivé par défaut : vous l'activez dans les paramètres seulement si vous en avez besoin." },
    ],
    related: ['fiche-technique', 'allergenes', 'inventaire'],
  },
  {
    slug: 'fiche-technique',
    title: 'Fiche technique et coût de revient en restaurant',
    description: "Calculez le coût de revient réel de chaque plat à partir de vos prix fournisseurs. Food cost, marge, et une alerte dès qu'une hausse de prix fait baisser votre marge.",
    kicker: 'Fiches techniques',
    h1: 'Le vrai coût de revient de chaque plat, toujours à jour',
    intro: "Vos fiches techniques sont reliées à vos prix fournisseurs. Quand le beurre augmente, le coût de votre croissant change tout seul — et Mise & Sûre vous prévient : « Le beurre a pris 12 % → le coût du croissant passe de 0,42 € à 0,47 € ».",
    image: 'mkt-fiches-techniques.webp',
    imageAlt: 'Fiche technique d\'un plat avec coût matière, marge et food cost',
    benefits: [
      { icon: '🧮', title: 'Coût matière automatique', text: "Grammes, litres, pièces, caisses : les conversions d'unités sont faites pour vous, à partir du prix d'achat réel de chaque produit." },
      { icon: '📈', title: 'Alerte « ta marge a baissé »', text: "Chaque hausse de prix fournisseur est repérée, avec son effet exact sur le coût et la marge de chaque plat concerné." },
      { icon: '🍽️', title: 'Food cost et marge', text: "Prix de vente, marge et ratio food cost affichés pour chaque plat : vous savez lesquels rapportent vraiment." },
      { icon: '🥣', title: 'Sous-recettes', text: "Une sauce maison, une pâte, un fond : créez-les une fois, réutilisez-les dans tous vos plats, leur coût suit." },
    ],
    steps: [
      "Votre catalogue produits contient déjà vos prix d'achat (import CSV possible).",
      "Créez la fiche du plat : ingrédients et quantités, le coût s'affiche aussitôt.",
      "Ajoutez le prix de vente : marge et food cost sont calculés, et surveillés.",
    ],
    faq: [
      { q: 'Comment calculer le coût de revient d\'un plat ?', a: "On additionne le coût de chaque ingrédient (quantité utilisée × prix d'achat ramené à la bonne unité). Mise & Sûre fait ce calcul automatiquement à partir de votre catalogue, et le met à jour à chaque changement de prix." },
      { q: 'Quel food cost viser en restauration ?', a: "On vise généralement 25 à 35 % du prix de vente HT selon le type de cuisine. Mise & Sûre affiche ce ratio pour chaque plat afin de repérer ceux qui dérivent." },
      { q: "Que se passe-t-il quand un fournisseur augmente ses prix ?", a: "Le nouveau prix (saisi à la main ou repris de la facture à la réception) met à jour toutes les fiches qui utilisent ce produit, et une alerte vous montre l'impact plat par plat." },
    ],
    related: ['allergenes', 'commandes-fournisseurs', 'inventaire'],
  },
  {
    slug: 'allergenes',
    title: 'Fiche allergènes restaurant — les 14 allergènes',
    description: "Cochez les 14 allergènes sur vos produits : chaque plat calcule les siens et la fiche allergènes à afficher en salle s'imprime en un clic. Conforme au règlement INCO.",
    kicker: 'Fiche allergènes',
    h1: 'La fiche allergènes de votre carte, générée en un clic',
    intro: "L'information sur les 14 allergènes est obligatoire pour tous les plats servis. Avec Mise & Sûre, vous les cochez une seule fois sur vos produits : chaque fiche technique en déduit les siens, et le tableau à afficher en salle se met à jour tout seul.",
    image: null,
    benefits: [
      { icon: '✅', title: 'Les 14 allergènes réglementaires', text: "Gluten, crustacés, œufs, poissons, arachides, soja, lait, fruits à coque, céleri, moutarde, sésame, sulfites, lupin, mollusques." },
      { icon: '🔗', title: 'Calcul automatique par plat', text: "Les allergènes remontent des produits vers les plats, sous-recettes comprises. Changez un produit : la fiche suit." },
      { icon: '🖨️', title: 'Fiche imprimable', text: "Un tableau clair, plat par plat, regroupé par catégorie, à imprimer ou à enregistrer en PDF pour la salle." },
      { icon: '⚠️', title: 'Rien d\'oublié', text: "Un produit dont les allergènes n'ont pas encore été vérifiés est signalé, au lieu d'afficher à tort « aucun allergène »." },
    ],
    steps: [
      "Sur chaque produit, cochez les allergènes indiqués sur son étiquette.",
      "Vos fiches techniques affichent automatiquement les allergènes de chaque plat.",
      "Imprimez la fiche allergènes et affichez-la en salle ou présentez-la sur demande.",
    ],
    faq: [
      { q: "La fiche allergènes est-elle obligatoire en restaurant ?", a: "Oui. Depuis le règlement européen INCO (n° 1169/2011) et le décret de 2015, tout établissement doit informer ses clients, par écrit, de la présence des 14 allergènes majeurs dans les plats servis." },
      { q: 'Quels sont les 14 allergènes à déclarer ?', a: "Gluten, crustacés, œufs, poissons, arachides, soja, lait, fruits à coque, céleri, moutarde, graines de sésame, anhydride sulfureux et sulfites, lupin, mollusques." },
      { q: 'Que faire si je change de fournisseur ?', a: "Mettez à jour les allergènes du nouveau produit : toutes les fiches techniques qui l'utilisent, et la fiche allergènes, sont recalculées automatiquement." },
    ],
    related: ['fiche-technique', 'haccp', 'commandes-fournisseurs'],
  },
  {
    slug: 'commandes-fournisseurs',
    title: 'Commandes fournisseurs pour restaurant — simple et rapide',
    description: "Paniers par fournisseur, validation par le patron, bon de commande PDF, réception avec contrôle des écarts. Toute l'équipe commande, vous gardez la main.",
    kicker: 'Commandes fournisseurs',
    h1: 'Vos commandes fournisseurs, sans oubli ni mauvaise surprise',
    intro: "La cuisine signale un manque, le panier se remplit, vous validez, le bon de commande part au fournisseur. À la livraison, les quantités et les prix facturés sont contrôlés : chaque écart est repéré.",
    image: 'mkt-commandes.webp',
    imageAlt: 'Écran des commandes fournisseurs de Mise & Sûre',
    benefits: [
      { icon: '🛒', title: 'Paniers partagés', text: "Un panier par fournisseur, alimenté par toute l'équipe. Fini les commandes passées en double ou oubliées." },
      { icon: '✔️', title: 'Validation par le patron', text: "Vous gardez le dernier mot, avec un plafond de dépense par employé si vous le souhaitez." },
      { icon: '📄', title: 'Envoi au fournisseur', text: "Le panier validé part au fournisseur, et un bon de commande PDF clair (références, conditionnements) est disponible en un clic." },
      { icon: '🔍', title: 'Réception contrôlée', text: "Quantités reçues, prix facturés, photo du bon de livraison : les écarts sont repérés et suivis jusqu'à leur résolution." },
    ],
    steps: [
      "Ajoutez vos fournisseurs et votre catalogue (import CSV possible).",
      "L'équipe remplit les paniers ; vous validez depuis votre téléphone.",
      "À la livraison, la réception compare ce qui est arrivé à ce qui était commandé.",
    ],
    faq: [
      { q: 'Mes employés peuvent-ils passer commande ?', a: "Oui, chacun avec son propre accès. Par défaut, leurs demandes passent par votre validation ; vous pouvez autoriser certains à commander directement, avec un plafond." },
      { q: "Le fournisseur doit-il s'inscrire ?", a: "Non. Aucun compte ni logiciel n'est nécessaire de son côté : il reçoit simplement votre commande." },
      { q: 'Et si la livraison ne correspond pas ?', a: "Vous saisissez ce qui a vraiment été reçu et au prix facturé : l'écart est enregistré, suivi, et le prix du catalogue peut être mis à jour d'un clic." },
    ],
    related: ['inventaire', 'fiche-technique', 'haccp'],
  },
  {
    slug: 'inventaire',
    title: 'Inventaire de restaurant sur téléphone, zone par zone',
    description: "Comptez votre stock zone par zone sur téléphone, avec l'historique de chaque relevé. Un inventaire de restaurant rapide, sans feuille Excel ni papier.",
    kicker: 'Inventaire',
    h1: 'Un inventaire rapide, zone par zone, sur téléphone',
    intro: "Chambre froide, réserve sèche, bar : comptez chaque zone dans l'ordre où vous la parcourez. Chaque relevé est daté et signé, et vous savez toujours ce qu'il vous reste avant de commander.",
    image: 'mkt-inventaire.webp',
    imageAlt: "Écran d'inventaire de Mise & Sûre, rangé par zones",
    benefits: [
      { icon: '📦', title: 'Comptage par zone', text: "Vos produits rangés comme dans votre établissement : on compte en marchant, sans chercher dans une liste interminable." },
      { icon: '🔄', title: 'Estimation après livraison', text: "Après chaque réception, une estimation du stock (signalée comme telle, jamais confondue avec un vrai comptage) vous aide à savoir où vous en êtes." },
      { icon: '🕓', title: 'Historique des comptages', text: "Chaque relevé garde sa date, son auteur et sa quantité : vous suivez l'évolution de votre stock d'un inventaire à l'autre." },
      { icon: '📱', title: 'Pensé pour le téléphone', text: "Gros boutons, saisie rapide, et les quantités déjà tapées ne sont jamais effacées par les mises à jour automatiques." },
    ],
    steps: [
      "Rangez vos produits par zones (chambre froide, réserve, bar…).",
      "Comptez zone par zone depuis votre téléphone.",
      "Consultez votre stock et commandez ce qui manque.",
    ],
    faq: [
      { q: "À quelle fréquence faire l'inventaire d'un restaurant ?", a: "Au minimum une fois par mois pour suivre le coût matière, et souvent chaque semaine pour les produits frais ou coûteux. Un comptage par zone sur téléphone rend l'exercice beaucoup plus rapide." },
      { q: "Faut-il un lecteur de code-barres ?", a: "Non. Les produits sont rangés par zone et recherchables par nom : le comptage se fait directement à l'écran." },
      { q: "L'inventaire est-il inclus ?", a: "Oui, dans tous les forfaits, et activable en un clic dans les paramètres." },
    ],
    related: ['commandes-fournisseurs', 'fiche-technique', 'haccp'],
  },
];
