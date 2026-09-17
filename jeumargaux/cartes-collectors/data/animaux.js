// 30 cartes à collectionner — animaux terrestres.
// force / vitesse / endurance : notes sur 100, échelle comparative entre les cartes.
// image : fichier local dans /images ; credit : auteur + licence (voir CREDITS.md).
// emoji : conservé comme image de secours si la photo ne charge pas.
const ANIMAUX = [
  {
    nom: "Lion d'Afrique", latin: "Panthera leo", emoji: "🦁", rarete: "legendaire", groupe: "terrestre",
    image: "images/01-lion.jpg", credit: "Giles Laurent — CC BY-SA 4.0",
    habitat: "Savane africaine", continent: "Afrique", regime: "Carnivore",
    poids: "190 kg", vitesse: "80 km/h", longevite: "14 ans", statut: "Vulnérable",
    stats: { force: 88, vitesse: 72, endurance: 55 },
    fait: "Le rugissement du lion s'entend jusqu'à 8 km à la ronde."
  },
  {
    nom: "Éléphant d'Afrique", latin: "Loxodonta africana", emoji: "🐘", rarete: "legendaire", groupe: "terrestre",
    image: "images/02-elephant-afrique.jpg", credit: "Giles Laurent — CC BY-SA 4.0",
    habitat: "Savane et forêt", continent: "Afrique", regime: "Herbivore",
    poids: "6 000 kg", vitesse: "40 km/h", longevite: "65 ans", statut: "En danger",
    stats: { force: 100, vitesse: 38, endurance: 82 },
    fait: "Sa trompe compte près de 40 000 muscles et peut saisir une seule cacahuète."
  },
  {
    nom: "Tigre du Bengale", latin: "Panthera tigris tigris", emoji: "🐅", rarete: "legendaire", groupe: "terrestre",
    image: "images/03-tigre-bengale.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Jungle et mangrove", continent: "Asie", regime: "Carnivore",
    poids: "220 kg", vitesse: "65 km/h", longevite: "15 ans", statut: "En danger",
    stats: { force: 92, vitesse: 66, endurance: 58 },
    fait: "Chaque tigre a un motif de rayures unique, comme une empreinte digitale."
  },
  {
    nom: "Girafe", latin: "Giraffa camelopardalis", emoji: "🦒", rarete: "epique", groupe: "terrestre",
    image: "images/04-girafe.jpg", credit: "Thomas Fuhrmann — CC BY-SA 4.0",
    habitat: "Savane arborée", continent: "Afrique", regime: "Herbivore",
    poids: "1 200 kg", vitesse: "60 km/h", longevite: "25 ans", statut: "Vulnérable",
    stats: { force: 70, vitesse: 55, endurance: 60 },
    fait: "Elle a le même nombre de vertèbres cervicales que nous : sept."
  },
  {
    nom: "Rhinocéros blanc", latin: "Ceratotherium simum", emoji: "🦏", rarete: "epique", groupe: "terrestre",
    image: "images/05-rhinoceros-blanc.jpg", credit: "Giles Laurent — CC BY-SA 4.0",
    habitat: "Prairie sèche", continent: "Afrique", regime: "Herbivore",
    poids: "2 300 kg", vitesse: "50 km/h", longevite: "45 ans", statut: "Quasi menacé",
    stats: { force: 96, vitesse: 46, endurance: 64 },
    fait: "Sa corne n'est pas en os mais en kératine, comme nos ongles."
  },
  {
    nom: "Hippopotame", latin: "Hippopotamus amphibius", emoji: "🦛", rarete: "epique", groupe: "terrestre",
    image: "images/06-hippopotame.jpg", credit: "Muhammad Mahdi Karim — CC BY-SA 4.0",
    habitat: "Fleuves et berges", continent: "Afrique", regime: "Herbivore",
    poids: "1 500 kg", vitesse: "30 km/h", longevite: "45 ans", statut: "Vulnérable",
    stats: { force: 94, vitesse: 30, endurance: 50 },
    fait: "Il ne sait pas nager : il marche et rebondit au fond de l'eau."
  },
  {
    nom: "Guépard", latin: "Acinonyx jubatus", emoji: "🐆", rarete: "legendaire", groupe: "terrestre",
    image: "images/07-guepard.jpg", credit: "AfricanConservation — CC BY-SA 4.0",
    habitat: "Savane ouverte", continent: "Afrique", regime: "Carnivore",
    poids: "60 kg", vitesse: "110 km/h", longevite: "12 ans", statut: "Vulnérable",
    stats: { force: 52, vitesse: 100, endurance: 22 },
    fait: "Il passe de 0 à 100 km/h en trois secondes, mais tient à peine 30 secondes."
  },
  {
    nom: "Loup gris", latin: "Canis lupus", emoji: "🐺", rarete: "rare", groupe: "terrestre",
    image: "images/08-loup-gris.jpg", credit: "Mas3cf — CC BY-SA 4.0",
    habitat: "Forêt et toundra", continent: "Eurasie & Amérique", regime: "Carnivore",
    poids: "45 kg", vitesse: "60 km/h", longevite: "13 ans", statut: "Préoccupation mineure",
    stats: { force: 58, vitesse: 62, endurance: 90 },
    fait: "Une meute peut parcourir 100 km en une seule nuit de chasse."
  },
  {
    nom: "Ours brun", latin: "Ursus arctos", emoji: "🐻", rarete: "epique", groupe: "terrestre",
    image: "images/09-ours-brun.jpg", credit: "Yathin S Krishnappa — CC BY-SA 3.0",
    habitat: "Forêt et montagne", continent: "Eurasie & Amérique", regime: "Omnivore",
    poids: "400 kg", vitesse: "55 km/h", longevite: "25 ans", statut: "Préoccupation mineure",
    stats: { force: 90, vitesse: 52, endurance: 66 },
    fait: "Il dort jusqu'à sept mois sans boire ni manger pendant l'hibernation."
  },
  {
    nom: "Ours polaire", latin: "Ursus maritimus", emoji: "🐻‍❄️", rarete: "legendaire", groupe: "terrestre",
    image: "images/10-ours-polaire.jpg", credit: "Alan Wilson — CC BY-SA 3.0",
    habitat: "Banquise arctique", continent: "Arctique", regime: "Carnivore",
    poids: "600 kg", vitesse: "40 km/h", longevite: "25 ans", statut: "Vulnérable",
    stats: { force: 95, vitesse: 44, endurance: 74 },
    fait: "Sous sa fourrure translucide, sa peau est entièrement noire."
  },
  {
    nom: "Panda géant", latin: "Ailuropoda melanoleuca", emoji: "🐼", rarete: "epique", groupe: "terrestre",
    image: "images/11-panda-geant.JPG", credit: "J. Patrick Fischer — CC BY-SA 3.0",
    habitat: "Forêt de bambous", continent: "Asie", regime: "Herbivore",
    poids: "100 kg", vitesse: "32 km/h", longevite: "20 ans", statut: "Vulnérable",
    stats: { force: 72, vitesse: 28, endurance: 40 },
    fait: "Il mange du bambou 14 heures par jour, soit 20 kg quotidiens."
  },
  {
    nom: "Koala", latin: "Phascolarctos cinereus", emoji: "🐨", rarete: "rare", groupe: "terrestre",
    image: "images/12-koala.jpg", credit: "Diliff — CC BY-SA 3.0",
    habitat: "Forêt d'eucalyptus", continent: "Océanie", regime: "Herbivore",
    poids: "14 kg", vitesse: "30 km/h", longevite: "15 ans", statut: "Vulnérable",
    stats: { force: 30, vitesse: 26, endurance: 18 },
    fait: "Il dort 20 heures par jour : les feuilles d'eucalyptus sont peu nourrissantes."
  },
  {
    nom: "Kangourou roux", latin: "Osphranter rufus", emoji: "🦘", rarete: "rare", groupe: "terrestre",
    image: "images/13-kangourou-roux.jpg", credit: "PotMart186 — CC BY-SA 4.0",
    habitat: "Désert et plaine", continent: "Océanie", regime: "Herbivore",
    poids: "85 kg", vitesse: "70 km/h", longevite: "22 ans", statut: "Préoccupation mineure",
    stats: { force: 62, vitesse: 76, endurance: 68 },
    fait: "Un seul bond peut franchir 9 mètres de long."
  },
  {
    nom: "Zèbre des plaines", latin: "Equus quagga", emoji: "🦓", rarete: "rare", groupe: "terrestre",
    image: "images/14-zebre.jpg", credit: "Yathin S Krishnappa — CC BY-SA 3.0",
    habitat: "Savane herbeuse", continent: "Afrique", regime: "Herbivore",
    poids: "350 kg", vitesse: "65 km/h", longevite: "25 ans", statut: "Quasi menacé",
    stats: { force: 60, vitesse: 70, endurance: 72 },
    fait: "Ses rayures éloignent les mouches tsé-tsé, qui s'y perdent en vol."
  },
  {
    nom: "Gorille des montagnes", latin: "Gorilla beringei beringei", emoji: "🦍", rarete: "legendaire", groupe: "terrestre",
    image: "images/15-gorille-montagnes.jpg", credit: "d_proffer (Flickr) — CC BY 2.0",
    habitat: "Forêt d'altitude", continent: "Afrique", regime: "Herbivore",
    poids: "160 kg", vitesse: "40 km/h", longevite: "40 ans", statut: "En danger",
    stats: { force: 93, vitesse: 40, endurance: 60 },
    fait: "Il construit un nid de feuilles neuf chaque soir pour dormir."
  },
  {
    nom: "Orang-outan de Bornéo", latin: "Pongo pygmaeus", emoji: "🦧", rarete: "legendaire", groupe: "terrestre",
    image: "images/16-orang-outan.jpg", credit: "Nanosanchez — CC BY-SA 4.0",
    habitat: "Canopée tropicale", continent: "Asie", regime: "Frugivore",
    poids: "75 kg", vitesse: "10 km/h", longevite: "40 ans", statut: "En danger critique",
    stats: { force: 78, vitesse: 20, endurance: 55 },
    fait: "Son envergure de bras atteint 2,20 m, bien plus que sa taille."
  },
  {
    nom: "Chimpanzé", latin: "Pan troglodytes", emoji: "🐒", rarete: "epique", groupe: "terrestre",
    image: "images/17-chimpanze.jpg", credit: "Giles Laurent — CC BY-SA 4.0",
    habitat: "Forêt et savane boisée", continent: "Afrique", regime: "Omnivore",
    poids: "60 kg", vitesse: "40 km/h", longevite: "40 ans", statut: "En danger",
    stats: { force: 70, vitesse: 44, endurance: 58 },
    fait: "Il fabrique des outils : brindilles pour pêcher les termites, pierres pour casser les noix."
  },
  {
    nom: "Bison d'Amérique", latin: "Bison bison", emoji: "🦬", rarete: "epique", groupe: "terrestre",
    image: "images/18-bison-amerique.jpg", credit: "Jack Dykinga — domaine public",
    habitat: "Grandes plaines", continent: "Amérique du Nord", regime: "Herbivore",
    poids: "900 kg", vitesse: "55 km/h", longevite: "20 ans", statut: "Quasi menacé",
    stats: { force: 89, vitesse: 50, endurance: 70 },
    fait: "Malgré sa tonne, il saute une barrière d'un mètre quatre-vingts."
  },
  {
    nom: "Cerf élaphe", latin: "Cervus elaphus", emoji: "🦌", rarete: "commune", groupe: "terrestre",
    image: "images/19-cerf-elaphe.jpg", credit: "Luc Viatour — CC BY-SA 3.0",
    habitat: "Forêt tempérée", continent: "Europe", regime: "Herbivore",
    poids: "200 kg", vitesse: "70 km/h", longevite: "18 ans", statut: "Préoccupation mineure",
    stats: { force: 55, vitesse: 72, endurance: 66 },
    fait: "Le mâle perd et refait ses bois entiers chaque année."
  },
  {
    nom: "Sanglier", latin: "Sus scrofa", emoji: "🐗", rarete: "commune", groupe: "terrestre",
    image: "images/20-sanglier.jpg", credit: "Valentin Panzirsch — CC BY-SA 3.0 AT",
    habitat: "Bois et champs", continent: "Eurasie", regime: "Omnivore",
    poids: "100 kg", vitesse: "40 km/h", longevite: "12 ans", statut: "Préoccupation mineure",
    stats: { force: 66, vitesse: 44, endurance: 58 },
    fait: "Son odorat détecte une truffe enfouie sous 25 cm de terre."
  },
  {
    nom: "Renard roux", latin: "Vulpes vulpes", emoji: "🦊", rarete: "commune", groupe: "terrestre",
    image: "images/21-renard-roux.jpg", credit: "ClaudiaTen — CC BY-SA 4.0",
    habitat: "Partout, jusqu'en ville", continent: "Hémisphère nord", regime: "Omnivore",
    poids: "7 kg", vitesse: "50 km/h", longevite: "5 ans", statut: "Préoccupation mineure",
    stats: { force: 28, vitesse: 56, endurance: 60 },
    fait: "Il entend une souris sous 60 cm de neige et plonge tête la première."
  },
  {
    nom: "Blaireau européen", latin: "Meles meles", emoji: "🦡", rarete: "commune", groupe: "terrestre",
    image: "images/22-blaireau.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Terriers forestiers", continent: "Europe", regime: "Omnivore",
    poids: "12 kg", vitesse: "30 km/h", longevite: "10 ans", statut: "Préoccupation mineure",
    stats: { force: 42, vitesse: 30, endurance: 52 },
    fait: "Son terrier familial, agrandi de génération en génération, peut compter 50 entrées."
  },
  {
    nom: "Hérisson d'Europe", latin: "Erinaceus europaeus", emoji: "🦔", rarete: "commune", groupe: "terrestre",
    image: "images/23-herisson.jpg", credit: "Jörg Hempel — CC BY-SA 2.0 DE",
    habitat: "Haies et jardins", continent: "Europe", regime: "Insectivore",
    poids: "1 kg", vitesse: "7 km/h", longevite: "7 ans", statut: "Quasi menacé",
    stats: { force: 14, vitesse: 10, endurance: 30 },
    fait: "Il porte environ 6 000 piquants, qu'il hérisse en boule en cas de danger."
  },
  {
    nom: "Paresseux à trois doigts", latin: "Bradypus variegatus", emoji: "🦥", rarete: "rare", groupe: "terrestre",
    image: "images/24-paresseux.jpg", credit: "Stefan Laube — domaine public",
    habitat: "Canopée tropicale", continent: "Amérique du Sud", regime: "Herbivore",
    poids: "5 kg", vitesse: "0,25 km/h", longevite: "30 ans", statut: "Préoccupation mineure",
    stats: { force: 20, vitesse: 2, endurance: 44 },
    fait: "Des algues poussent dans son pelage et le camouflent en vert."
  },
  {
    nom: "Raton laveur", latin: "Procyon lotor", emoji: "🦝", rarete: "commune", groupe: "terrestre",
    image: "images/25-raton-laveur.jpg", credit: "Rhododendrites — CC BY-SA 4.0",
    habitat: "Forêt et ville", continent: "Amérique du Nord", regime: "Omnivore",
    poids: "8 kg", vitesse: "24 km/h", longevite: "5 ans", statut: "Préoccupation mineure",
    stats: { force: 26, vitesse: 30, endurance: 40 },
    fait: "Ses pattes avant sont si sensibles qu'il « voit » les objets en les tâtant."
  },
  {
    nom: "Chameau de Bactriane", latin: "Camelus bactrianus", emoji: "🐫", rarete: "rare", groupe: "terrestre",
    image: "images/26-chameau-bactriane.jpg", credit: "Christian Ursilva — CC BY-SA 4.0",
    habitat: "Désert de Gobi", continent: "Asie", regime: "Herbivore",
    poids: "600 kg", vitesse: "65 km/h", longevite: "40 ans", statut: "En danger critique",
    stats: { force: 74, vitesse: 48, endurance: 96 },
    fait: "Ses deux bosses stockent de la graisse, pas de l'eau : jusqu'à 36 kg."
  },
  {
    nom: "Lama", latin: "Lama glama", emoji: "🦙", rarete: "commune", groupe: "terrestre",
    image: "images/27-lama.jpg", credit: "Andrija12345678 — CC BY-SA 4.0",
    habitat: "Hauts plateaux andins", continent: "Amérique du Sud", regime: "Herbivore",
    poids: "150 kg", vitesse: "56 km/h", longevite: "20 ans", statut: "Domestiqué",
    stats: { force: 48, vitesse: 50, endurance: 84 },
    fait: "Il porte 40 kg sur 30 km à 4 000 m d'altitude sans faiblir."
  },
  {
    nom: "Bouquetin des Alpes", latin: "Capra ibex", emoji: "🐐", rarete: "rare", groupe: "terrestre",
    image: "images/28-bouquetin-alpes.jpg", credit: "Giles Laurent — CC BY-SA 4.0",
    habitat: "Falaises de montagne", continent: "Europe", regime: "Herbivore",
    poids: "100 kg", vitesse: "50 km/h", longevite: "19 ans", statut: "Préoccupation mineure",
    stats: { force: 56, vitesse: 46, endurance: 88 },
    fait: "Il escalade des barrages quasi verticaux pour lécher le sel de la pierre."
  },
  {
    nom: "Écureuil roux", latin: "Sciurus vulgaris", emoji: "🐿️", rarete: "commune", groupe: "terrestre",
    image: "images/29-ecureuil-roux.jpg", credit: "Peter Trimming — CC BY 2.0",
    habitat: "Forêt de conifères", continent: "Eurasie", regime: "Granivore",
    poids: "0,3 kg", vitesse: "20 km/h", longevite: "6 ans", statut: "Préoccupation mineure",
    stats: { force: 10, vitesse: 34, endurance: 38 },
    fait: "Il oublie une partie de ses réserves : chaque oubli fait pousser un arbre."
  },
  {
    nom: "Lièvre d'Europe", latin: "Lepus europaeus", emoji: "🐇", rarete: "commune", groupe: "terrestre",
    image: "images/30-lievre-europe.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Champs ouverts", continent: "Europe", regime: "Herbivore",
    poids: "4 kg", vitesse: "72 km/h", longevite: "4 ans", statut: "Préoccupation mineure",
    stats: { force: 18, vitesse: 80, endurance: 62 },
    fait: "Il fuit en zigzag et bondit sur 3 mètres pour semer les rapaces."
  },

  // ----------------------------------------------------------------------
  // Série n° 2 — océan, oiseaux, reptiles & amphibiens, insectes & araignées
  // ----------------------------------------------------------------------

  {
    nom: "Baleine bleue", latin: "Balaenoptera musculus", emoji: "🐋", rarete: "legendaire", groupe: "marin",
    image: "images/31-baleine-bleue.jpg", credit: "NOAA Photo Library — domaine public",
    habitat: "Haute mer", continent: "Tous les océans", regime: "Planctonophage",
    poids: "150 000 kg", vitesse: "37 km/h", longevite: "90 ans", statut: "En danger",
    stats: { force: 100, vitesse: 40, endurance: 96 },
    fait: "C'est le plus gros animal ayant jamais vécu : son cœur pèse à lui seul 180 kg."
  },
  {
    nom: "Orque", latin: "Orcinus orca", emoji: "🐳", rarete: "legendaire", groupe: "marin",
    image: "images/32-orque.jpg", credit: "Robert Pittman — domaine public",
    habitat: "Toutes les mers", continent: "Tous les océans", regime: "Carnivore",
    poids: "5 500 kg", vitesse: "56 km/h", longevite: "60 ans", statut: "Données insuffisantes",
    stats: { force: 92, vitesse: 76, endurance: 88 },
    fait: "Chaque groupe possède son dialecte de sifflements, transmis de mère en fille."
  },
  {
    nom: "Grand dauphin", latin: "Tursiops truncatus", emoji: "🐬", rarete: "rare", groupe: "marin",
    image: "images/33-grand-dauphin.jpg", credit: "NASA — domaine public",
    habitat: "Mers tempérées et chaudes", continent: "Tous les océans", regime: "Piscivore",
    poids: "300 kg", vitesse: "50 km/h", longevite: "45 ans", statut: "Préoccupation mineure",
    stats: { force: 46, vitesse: 70, endurance: 80 },
    fait: "Il se reconnaît dans un miroir et se donne un nom : un sifflement bien à lui."
  },
  {
    nom: "Grand requin blanc", latin: "Carcharodon carcharias", emoji: "🦈", rarete: "legendaire", groupe: "marin",
    image: "images/34-requin-blanc.jpg", credit: "Terry Goss — CC BY 2.5",
    habitat: "Mers côtières tempérées", continent: "Tous les océans", regime: "Carnivore",
    poids: "1 100 kg", vitesse: "40 km/h", longevite: "70 ans", statut: "Vulnérable",
    stats: { force: 90, vitesse: 62, endurance: 78 },
    fait: "Il perd et remplace ses dents toute sa vie : près de 30 000 au total."
  },
  {
    nom: "Raie manta géante", latin: "Mobula birostris", emoji: "🐟", rarete: "epique", groupe: "marin",
    image: "images/35-raie-manta.jpg", credit: "Jon Hanson — CC BY-SA 2.0",
    habitat: "Océan tropical", continent: "Tous les océans", regime: "Planctonophage",
    poids: "1 400 kg", vitesse: "24 km/h", longevite: "45 ans", statut: "En danger",
    stats: { force: 58, vitesse: 42, endurance: 76 },
    fait: "Ses nageoires atteignent 7 mètres d'envergure et elle bondit hors de l'eau."
  },
  {
    nom: "Pieuvre commune", latin: "Octopus vulgaris", emoji: "🐙", rarete: "rare", groupe: "marin",
    image: "images/36-pieuvre.jpg", credit: "Albert Kok — CC BY-SA 3.0",
    habitat: "Fonds rocheux", continent: "Atlantique et Méditerranée", regime: "Carnivore",
    poids: "6 kg", vitesse: "40 km/h", longevite: "2 ans", statut: "Préoccupation mineure",
    stats: { force: 30, vitesse: 44, endurance: 26 },
    fait: "Elle a neuf cerveaux : un central, plus un dans chacun de ses huit bras."
  },
  {
    nom: "Tortue verte", latin: "Chelonia mydas", emoji: "🐢", rarete: "rare", groupe: "marin",
    image: "images/37-tortue-verte.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Récifs et herbiers", continent: "Mers tropicales", regime: "Herbivore",
    poids: "160 kg", vitesse: "35 km/h", longevite: "80 ans", statut: "En danger",
    stats: { force: 40, vitesse: 32, endurance: 92 },
    fait: "Elle revient pondre sur la plage exacte où elle est née, trente ans plus tard."
  },
  {
    nom: "Manchot empereur", latin: "Aptenodytes forsteri", emoji: "🐧", rarete: "epique", groupe: "oiseau",
    image: "images/38-manchot-empereur.jpg", credit: "Ian Duffy — CC BY 2.0",
    habitat: "Banquise antarctique", continent: "Antarctique", regime: "Piscivore",
    poids: "35 kg", vitesse: "14 km/h", longevite: "20 ans", statut: "Quasi menacé",
    stats: { force: 40, vitesse: 26, endurance: 94 },
    fait: "Le mâle jeûne deux mois en couvant l'œuf sur ses pattes, par −40 °C."
  },
  {
    nom: "Morse", latin: "Odobenus rosmarus", emoji: "🦭", rarete: "rare", groupe: "marin",
    image: "images/39-morse.jpg", credit: "Nixette — CC BY-SA 4.0",
    habitat: "Banquise et côtes arctiques", continent: "Arctique", regime: "Carnivore",
    poids: "1 200 kg", vitesse: "35 km/h", longevite: "40 ans", statut: "Vulnérable",
    stats: { force: 84, vitesse: 36, endurance: 70 },
    fait: "Ses défenses d'un mètre lui servent de piolet pour se hisser hors de l'eau."
  },
  {
    nom: "Loutre de mer", latin: "Enhydra lutris", emoji: "🦦", rarete: "rare", groupe: "marin",
    image: "images/40-loutre-de-mer.jpg", credit: "Marshal Hedin — CC BY-SA 2.0",
    habitat: "Forêts de kelp", continent: "Pacifique Nord", regime: "Carnivore",
    poids: "35 kg", vitesse: "9 km/h", longevite: "20 ans", statut: "En danger",
    stats: { force: 26, vitesse: 24, endurance: 58 },
    fait: "Elle dort en se tenant la patte pour ne pas dériver pendant la nuit."
  },
  {
    nom: "Aigle royal", latin: "Aquila chrysaetos", emoji: "🦅", rarete: "epique", groupe: "oiseau",
    image: "images/41-aigle-royal.jpg", credit: "Giles Laurent — CC BY-SA 4.0",
    habitat: "Montagnes et steppes", continent: "Hémisphère nord", regime: "Carnivore",
    poids: "5 kg", vitesse: "320 km/h", longevite: "30 ans", statut: "Préoccupation mineure",
    stats: { force: 44, vitesse: 92, endurance: 74 },
    fait: "Sa vue est huit fois plus perçante que la nôtre : il repère un lièvre à 2 km."
  },
  {
    nom: "Faucon pèlerin", latin: "Falco peregrinus", emoji: "🐦", rarete: "legendaire", groupe: "oiseau",
    image: "images/42-faucon-pelerin.jpg", credit: "Mykola Swarnyk — CC BY-SA 3.0",
    habitat: "Falaises, et gratte-ciel", continent: "Monde entier", regime: "Carnivore",
    poids: "1 kg", vitesse: "390 km/h", longevite: "15 ans", statut: "Préoccupation mineure",
    stats: { force: 26, vitesse: 100, endurance: 62 },
    fait: "C'est l'animal le plus rapide du monde, en piqué sur sa proie."
  },
  {
    nom: "Chouette effraie", latin: "Tyto alba", emoji: "🦉", rarete: "rare", groupe: "oiseau",
    image: "images/43-chouette-effraie.jpg", credit: "Steven Ward — CC BY 2.0",
    habitat: "Granges et campagnes", continent: "Monde entier", regime: "Carnivore",
    poids: "0,3 kg", vitesse: "80 km/h", longevite: "4 ans", statut: "Préoccupation mineure",
    stats: { force: 14, vitesse: 48, endurance: 44 },
    fait: "Son vol est totalement silencieux : le bord de ses plumes forme un peigne."
  },
  {
    nom: "Flamant rose", latin: "Phoenicopterus roseus", emoji: "🦩", rarete: "commune", groupe: "oiseau",
    image: "images/44-flamant-rose.jpg", credit: "Giles Laurent — CC BY-SA 4.0",
    habitat: "Lagunes salées", continent: "Afrique et Europe du Sud", regime: "Filtreur",
    poids: "3,5 kg", vitesse: "60 km/h", longevite: "40 ans", statut: "Préoccupation mineure",
    stats: { force: 16, vitesse: 46, endurance: 70 },
    fait: "Il naît gris : ce sont les crevettes de son menu qui le teintent en rose."
  },
  {
    nom: "Autruche", latin: "Struthio camelus", emoji: "🪶", rarete: "rare", groupe: "oiseau",
    image: "images/45-autruche.jpg", credit: "Yathin S Krishnappa — CC BY-SA 4.0",
    habitat: "Savane et semi-désert", continent: "Afrique", regime: "Omnivore",
    poids: "130 kg", vitesse: "70 km/h", longevite: "40 ans", statut: "Préoccupation mineure",
    stats: { force: 54, vitesse: 80, endurance: 86 },
    fait: "Elle ne vole pas mais court à 70 km/h ; son œil est plus gros que son cerveau."
  },
  {
    nom: "Colibri à gorge rubis", latin: "Archilochus colubris", emoji: "🐤", rarete: "rare", groupe: "oiseau",
    image: "images/46-colibri.jpg", credit: "jeffreyw — CC BY 2.0",
    habitat: "Jardins et lisières", continent: "Amérique du Nord", regime: "Nectarivore",
    poids: "0,003 kg", vitesse: "50 km/h", longevite: "5 ans", statut: "Préoccupation mineure",
    stats: { force: 4, vitesse: 60, endurance: 36 },
    fait: "Ses ailes battent 53 fois par seconde et il est le seul oiseau à voler à reculons."
  },
  {
    nom: "Ara rouge", latin: "Ara macao", emoji: "🦜", rarete: "rare", groupe: "oiseau",
    image: "images/47-ara-rouge.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Forêt tropicale humide", continent: "Amérique centrale et du Sud", regime: "Frugivore",
    poids: "1 kg", vitesse: "56 km/h", longevite: "50 ans", statut: "Préoccupation mineure",
    stats: { force: 20, vitesse: 50, endurance: 52 },
    fait: "Il choisit un partenaire pour la vie entière et peut atteindre cinquante ans."
  },
  {
    nom: "Toucan toco", latin: "Ramphastos toco", emoji: "🐦", rarete: "commune", groupe: "oiseau",
    image: "images/48-toucan-toco.jpg", credit: "Giles Laurent — CC BY-SA 4.0",
    habitat: "Lisières et savanes boisées", continent: "Amérique du Sud", regime: "Frugivore",
    poids: "0,7 kg", vitesse: "40 km/h", longevite: "20 ans", statut: "Préoccupation mineure",
    stats: { force: 16, vitesse: 40, endurance: 36 },
    fait: "Son bec énorme est un radiateur : il y fait circuler son sang pour se rafraîchir."
  },
  {
    nom: "Crocodile du Nil", latin: "Crocodylus niloticus", emoji: "🐊", rarete: "legendaire", groupe: "reptile",
    image: "images/49-crocodile-du-nil.jpg", credit: "Dewet — CC BY-SA 2.0",
    habitat: "Fleuves et marais", continent: "Afrique", regime: "Carnivore",
    poids: "750 kg", vitesse: "35 km/h", longevite: "70 ans", statut: "Préoccupation mineure",
    stats: { force: 96, vitesse: 42, endurance: 80 },
    fait: "Sa morsure est la plus puissante du règne animal : près de deux tonnes de pression."
  },
  {
    nom: "Dragon de Komodo", latin: "Varanus komodoensis", emoji: "🦎", rarete: "legendaire", groupe: "reptile",
    image: "images/50-dragon-de-komodo.jpg", credit: "James Jolokia — CC BY 4.0",
    habitat: "Îles sèches d'Indonésie", continent: "Asie", regime: "Carnivore",
    poids: "90 kg", vitesse: "20 km/h", longevite: "30 ans", statut: "En danger",
    stats: { force: 76, vitesse: 32, endurance: 58 },
    fait: "C'est le plus grand lézard du monde : trois mètres du museau à la queue."
  },
  {
    nom: "Cobra royal", latin: "Ophiophagus hannah", emoji: "🐍", rarete: "epique", groupe: "reptile",
    image: "images/51-cobra-royal.jpg", credit: "Michael Allen Smith — CC BY-SA 2.0",
    habitat: "Forêts d'Asie du Sud", continent: "Asie", regime: "Carnivore",
    poids: "6 kg", vitesse: "20 km/h", longevite: "20 ans", statut: "Vulnérable",
    stats: { force: 48, vitesse: 38, endurance: 40 },
    fait: "C'est le seul serpent au monde qui construit un nid pour ses œufs."
  },
  {
    nom: "Caméléon panthère", latin: "Furcifer pardalis", emoji: "🦎", rarete: "commune", groupe: "reptile",
    image: "images/52-cameleon-panthere.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Forêts de Madagascar", continent: "Afrique", regime: "Insectivore",
    poids: "0,2 kg", vitesse: "3 km/h", longevite: "6 ans", statut: "Préoccupation mineure",
    stats: { force: 8, vitesse: 10, endurance: 24 },
    fait: "Ses deux yeux bougent séparément et sa langue jaillit en 7 centièmes de seconde."
  },
  {
    nom: "Tortue géante des Galápagos", latin: "Chelonoidis niger", emoji: "🐢", rarete: "epique", groupe: "reptile",
    image: "images/53-tortue-galapagos.jpg", credit: "Matthew Field — CC BY-SA 3.0",
    habitat: "Îles volcaniques", continent: "Amérique du Sud", regime: "Herbivore",
    poids: "300 kg", vitesse: "0,3 km/h", longevite: "150 ans", statut: "Vulnérable",
    stats: { force: 52, vitesse: 2, endurance: 100 },
    fait: "Elle dépasse les 150 ans et peut rester une année entière sans manger."
  },
  {
    nom: "Dendrobate à tapirer", latin: "Dendrobates tinctorius", emoji: "🐸", rarete: "epique", groupe: "reptile",
    image: "images/54-dendrobate.jpg", credit: "H. Zell — CC BY-SA 3.0",
    habitat: "Sous-bois humide", continent: "Amérique du Sud", regime: "Insectivore",
    poids: "0,008 kg", vitesse: "2 km/h", longevite: "12 ans", statut: "Préoccupation mineure",
    stats: { force: 6, vitesse: 12, endurance: 20 },
    fait: "Ses couleurs éclatantes sont un avertissement : sa peau est toxique."
  },
  {
    nom: "Axolotl", latin: "Ambystoma mexicanum", emoji: "🦎", rarete: "rare", groupe: "reptile",
    image: "images/55-axolotl.jpg", credit: "LoKiLeCh — CC BY-SA 3.0",
    habitat: "Canaux de Xochimilco", continent: "Amérique du Nord", regime: "Carnivore",
    poids: "0,1 kg", vitesse: "2 km/h", longevite: "15 ans", statut: "En danger critique",
    stats: { force: 6, vitesse: 10, endurance: 30 },
    fait: "Il fait repousser ses pattes, sa moelle épinière et une partie de son cerveau."
  },
  {
    nom: "Papillon monarque", latin: "Danaus plexippus", emoji: "🦋", rarete: "epique", groupe: "insecte",
    image: "images/56-monarque.jpg", credit: "Derek Ramsey — CC BY-SA 4.0",
    habitat: "Prairies à asclépiades", continent: "Amérique du Nord", regime: "Nectarivore",
    poids: "0,0005 kg", vitesse: "20 km/h", longevite: "9 mois", statut: "Vulnérable",
    stats: { force: 2, vitesse: 28, endurance: 90 },
    fait: "Il migre sur 4 500 km jusqu'au Mexique, sans avoir jamais fait le trajet."
  },
  {
    nom: "Abeille domestique", latin: "Apis mellifera", emoji: "🐝", rarete: "commune", groupe: "insecte",
    image: "images/57-abeille.jpg", credit: "Andreas Trepte — CC BY-SA 2.5",
    habitat: "Ruches et prairies", continent: "Monde entier", regime: "Nectarivore",
    poids: "0,0001 kg", vitesse: "28 km/h", longevite: "6 semaines", statut: "Domestiquée",
    stats: { force: 3, vitesse: 32, endurance: 48 },
    fait: "Elle indique à ses sœurs la direction des fleurs en dansant en forme de huit."
  },
  {
    nom: "Mante religieuse", latin: "Mantis religiosa", emoji: "🦗", rarete: "commune", groupe: "insecte",
    image: "images/58-mante-religieuse.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Herbes hautes et broussailles", continent: "Europe et Afrique", regime: "Insectivore",
    poids: "0,005 kg", vitesse: "5 km/h", longevite: "1 an", statut: "Préoccupation mineure",
    stats: { force: 8, vitesse: 20, endurance: 22 },
    fait: "Elle saisit sa proie en 50 millisecondes, plus vite qu'un clin d'œil."
  },
  {
    nom: "Mygale de Goliath", latin: "Theraphosa blondi", emoji: "🕷️", rarete: "rare", groupe: "insecte",
    image: "images/59-mygale-goliath.jpg", credit: "Didier Descouens — CC BY-SA 4.0",
    habitat: "Terriers de forêt humide", continent: "Amérique du Sud", regime: "Carnivore",
    poids: "0,175 kg", vitesse: "8 km/h", longevite: "20 ans", statut: "Préoccupation mineure",
    stats: { force: 16, vitesse: 22, endurance: 34 },
    fait: "C'est la plus grosse araignée du monde : 30 cm, la taille d'une assiette."
  },
  {
    nom: "Scarabée Hercule", latin: "Dynastes hercules", emoji: "🪲", rarete: "epique", groupe: "insecte",
    image: "images/60-scarabee-hercule.jpg", credit: "Didier Descouens — CC BY-SA 4.0",
    habitat: "Forêt tropicale", continent: "Amérique centrale et du Sud", regime: "Frugivore",
    poids: "0,03 kg", vitesse: "3 km/h", longevite: "2 ans", statut: "Préoccupation mineure",
    stats: { force: 34, vitesse: 12, endurance: 40 },
    fait: "Il soulève 850 fois son poids : pour un humain, ce serait porter un autobus."
  },

  // ----------------------------------------------------------------------
  // Série n° 3 — le tour du monde, seconde vague
  //
  // Chiffres vérifiés sur les articles de Wikipédia consultés le 5 août 2026.
  // Quand aucune vitesse de pointe fiable n'est publiée (animaux marins,
  // reptiles, insectes), la fiche affiche la longueur ou l'envergure à la
  // place, via la propriété `libelles`, plutôt qu'un chiffre inventé.
  // ----------------------------------------------------------------------

  {
    nom: "Jaguar", latin: "Panthera onca", emoji: "🐆", rarete: "legendaire", groupe: "terrestre",
    image: "images/061-jaguar.jpg", credit: "USFWS — domaine public",
    habitat: "Forêt tropicale et marais", continent: "Amériques", regime: "Carnivore",
    poids: "jusqu'à 158 kg", vitesse: "80 km/h", longevite: "15 ans", statut: "Quasi menacé",
    stats: { force: 90, vitesse: 62, endurance: 58 },
    fait: "Sa mâchoire perce la carapace des tortues ; il tue souvent en perforant le crâne de sa proie."
  },
  {
    nom: "Léopard des neiges", latin: "Panthera uncia", emoji: "🐆", rarete: "legendaire", groupe: "terrestre",
    image: "images/062-leopard-neiges.JPG", credit: "Irbis1983 — domaine public",
    habitat: "Montagnes d'Asie, 3 000 à 4 500 m", continent: "Asie", regime: "Carnivore",
    poids: "22 à 55 kg", vitesse: "65 km/h", longevite: "18 ans", statut: "Vulnérable",
    stats: { force: 62, vitesse: 66, endurance: 70 },
    fait: "Ses larges pattes font raquettes dans la neige et sa longue queue lui sert de balancier."
  },
  {
    nom: "Puma", latin: "Puma concolor", emoji: "🐆", rarete: "epique", groupe: "terrestre",
    image: "images/063-puma.jpg", credit: "National Park Service — domaine public",
    habitat: "Du Yukon à la Patagonie", continent: "Amériques", regime: "Carnivore",
    poids: "29 à 100 kg", vitesse: "80 km/h", longevite: "13 ans", statut: "Préoccupation mineure",
    stats: { force: 66, vitesse: 76, endurance: 62 },
    fait: "C'est le mammifère terrestre sauvage le plus largement réparti de tout le continent américain."
  },
  {
    nom: "Hyène tachetée", latin: "Crocuta crocuta", emoji: "🐺", rarete: "rare", groupe: "terrestre",
    image: "images/064-hyene.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Savane africaine", continent: "Afrique", regime: "Carnivore",
    poids: "45 à 80 kg", vitesse: "60 km/h", longevite: "20 ans", statut: "Préoccupation mineure",
    stats: { force: 72, vitesse: 60, endurance: 86 },
    fait: "C'est le plus social des carnivores : ses clans sont les plus grands et les plus complexes."
  },
  {
    nom: "Suricate", latin: "Suricata suricatta", emoji: "🐾", rarete: "commune", groupe: "terrestre",
    image: "images/065-suricate.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Déserts d'Afrique australe", continent: "Afrique", regime: "Insectivore",
    poids: "0,6 à 1 kg", vitesse: "30 km/h", longevite: "12 ans", statut: "Préoccupation mineure",
    stats: { force: 8, vitesse: 32, endurance: 44 },
    fait: "Il vit en clans de 2 à 30 individus, où les non-reproducteurs élèvent les petits des autres."
  },
  {
    nom: "Okapi", latin: "Okapia johnstoni", emoji: "🦒", rarete: "epique", groupe: "terrestre",
    image: "images/066-okapi.jpg", credit: "Daniel Jolivet — CC BY 2.0",
    habitat: "Forêts du nord-est du Congo", continent: "Afrique", regime: "Herbivore",
    poids: "200 à 350 kg", vitesse: "60 km/h", longevite: "30 ans", statut: "En danger",
    stats: { force: 56, vitesse: 50, endurance: 58 },
    fait: "Malgré ses rayures de zèbre, c'est le seul cousin vivant de la girafe."
  },
  {
    nom: "Ornithorynque", latin: "Ornithorhynchus anatinus", emoji: "🦫", rarete: "epique", groupe: "terrestre",
    image: "images/067-ornithorynque.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Rivières de l'est australien", continent: "Océanie", regime: "Carnivore",
    poids: "0,7 à 2,4 kg", vitesse: "40 à 60 cm", longevite: "17 ans", statut: "Quasi menacé",
    stats: { force: 10, vitesse: 26, endurance: 40 },
    fait: "Mammifère qui pond des œufs, il repère ses proies aux signaux électriques de leurs muscles."
  },
  {
    nom: "Diable de Tasmanie", latin: "Sarcophilus harrisii", emoji: "🐾", rarete: "epique", groupe: "terrestre",
    image: "images/068-diable-tasmanie.jpg", credit: "JJ Harrison — CC BY-SA 3.0",
    habitat: "Forêts de Tasmanie", continent: "Océanie", regime: "Carnivore",
    poids: "6 à 12 kg", vitesse: "24 km/h", longevite: "6 ans", statut: "En danger",
    stats: { force: 44, vitesse: 34, endurance: 52 },
    fait: "Plus grand marsupial carnivore du monde, sa morsure est l'une des plus fortes pour sa taille."
  },
  {
    nom: "Capybara", latin: "Hydrochoerus hydrochaeris", emoji: "🐹", rarete: "rare", groupe: "terrestre",
    image: "images/069-capybara.jpg", credit: "Giles Laurent — CC BY-SA 4.0",
    habitat: "Berges d'Amérique du Sud", continent: "Amérique du Sud", regime: "Herbivore",
    poids: "35 à 66 kg", vitesse: "35 km/h", longevite: "10 ans", statut: "Préoccupation mineure",
    stats: { force: 30, vitesse: 40, endurance: 50 },
    fait: "C'est le plus gros rongeur du monde ; il vit en groupes de 10 à 20, parfois jusqu'à 100."
  },
  {
    nom: "Lémur catta", latin: "Lemur catta", emoji: "🐒", rarete: "rare", groupe: "terrestre",
    image: "images/070-lemur-catta.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Forêts du sud de Madagascar", continent: "Afrique", regime: "Omnivore",
    poids: "2,2 à 3,5 kg", vitesse: "20 km/h", longevite: "18 ans", statut: "En danger",
    stats: { force: 12, vitesse: 42, endurance: 40 },
    fait: "Ses troupes sont dominées par les femelles, et il prend de longs bains de soleil au petit matin."
  },
  {
    nom: "Élan", latin: "Alces alces", emoji: "🦌", rarete: "epique", groupe: "terrestre",
    image: "images/071-elan.jpg", credit: "Paxson Woelber — CC BY-SA 4.0",
    habitat: "Forêt boréale", continent: "Eurasie et Amérique du Nord", regime: "Herbivore",
    poids: "380 à 700 kg", vitesse: "56 km/h", longevite: "20 ans", statut: "Préoccupation mineure",
    stats: { force: 78, vitesse: 52, endurance: 70 },
    fait: "Plus grand et plus lourd des cervidés, il porte des bois plats en forme de palmes."
  },
  {
    nom: "Bœuf musqué", latin: "Ovibos moschatus", emoji: "🐂", rarete: "rare", groupe: "terrestre",
    image: "images/072-boeuf-musque.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Toundra arctique", continent: "Arctique", regime: "Herbivore",
    poids: "180 à 400 kg", vitesse: "60 km/h", longevite: "20 ans", statut: "Préoccupation mineure",
    stats: { force: 76, vitesse: 48, endurance: 82 },
    fait: "Menacé, le troupeau forme un cercle défensif, cornes vers l'extérieur et petits au centre."
  },
  {
    nom: "Requin-baleine", latin: "Rhincodon typus", emoji: "🦈", rarete: "legendaire", groupe: "marin",
    image: "images/073-requin-baleine.jpg", credit: "Abe Khao Lak — CC BY-SA 4.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Océans tropicaux", continent: "Tous les océans", regime: "Planctonophage",
    poids: "environ 20 000 kg", vitesse: "jusqu'à 18,8 m", longevite: "70 ans", statut: "En danger",
    stats: { force: 88, vitesse: 24, endurance: 84 },
    fait: "Plus grand poisson du monde, il filtre plus de 6 000 litres d'eau par heure."
  },
  {
    nom: "Cachalot", latin: "Physeter macrocephalus", emoji: "🐋", rarete: "legendaire", groupe: "marin",
    image: "images/074-cachalot.jpg", credit: "Gabriel Barathieu — CC BY-SA 2.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Haute mer", continent: "Tous les océans", regime: "Carnivore",
    poids: "environ 40 000 kg", vitesse: "16 m en moyenne", longevite: "70 ans", statut: "Vulnérable",
    stats: { force: 96, vitesse: 46, endurance: 92 },
    fait: "Il plonge à 2 250 m ; sa tête, un tiers de son corps, émet le son le plus puissant du règne animal."
  },
  {
    nom: "Narval", latin: "Monodon monoceros", emoji: "🐋", rarete: "legendaire", groupe: "marin",
    image: "images/075-narval.jpg", credit: "Gazprom Neft (service de presse) — CC BY-SA 4.0",
    libelles: { vitesse: "Défense" },
    habitat: "Eaux arctiques", continent: "Arctique", regime: "Carnivore",
    poids: "800 à 1 600 kg", vitesse: "1,5 à 3 m", longevite: "50 ans", statut: "Préoccupation mineure",
    stats: { force: 62, vitesse: 50, endurance: 78 },
    fait: "Sa « corne » est une canine gauche torsadée qui traverse la lèvre, longue de 1,5 à 3 mètres."
  },
  {
    nom: "Béluga", latin: "Delphinapterus leucas", emoji: "🐋", rarete: "epique", groupe: "marin",
    image: "images/076-beluga.jpg", credit: "Javier Yaya Tur — CC BY 2.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Mers arctiques", continent: "Arctique", regime: "Carnivore",
    poids: "jusqu'à 1 600 kg", vitesse: "jusqu'à 5,5 m", longevite: "50 ans", statut: "Préoccupation mineure",
    stats: { force: 58, vitesse: 44, endurance: 74 },
    fait: "Surnommé « canari des mers » pour ses cris aigus, il n'a pas d'aileron : il nage sous la glace."
  },
  {
    nom: "Phoque léopard", latin: "Hydrurga leptonyx", emoji: "🦭", rarete: "epique", groupe: "marin",
    image: "images/077-phoque-leopard.jpg", credit: "Godot13 — CC BY-SA 4.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Banquise antarctique", continent: "Antarctique", regime: "Carnivore",
    poids: "200 à 600 kg", vitesse: "2,4 à 3,5 m", longevite: "26 ans", statut: "Préoccupation mineure",
    stats: { force: 78, vitesse: 60, endurance: 70 },
    fait: "Superprédateur de l'Antarctique, il ne craint que l'orque ; ses dents mesurent 2,5 cm."
  },
  {
    nom: "Poisson-clown", latin: "Amphiprion ocellaris", emoji: "🐠", rarete: "commune", groupe: "marin",
    image: "images/078-poisson-clown.jpg", credit: "Ritiks — CC BY-SA 3.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Récifs coralliens", continent: "Indo-Pacifique", regime: "Omnivore",
    poids: "environ 30 g", vitesse: "jusqu'à 11 cm", longevite: "10 ans", statut: "Préoccupation mineure",
    stats: { force: 3, vitesse: 24, endurance: 26 },
    fait: "Il vit à l'abri des tentacules urticants d'une anémone, avec laquelle il fait équipe."
  },
  {
    nom: "Albatros hurleur", latin: "Diomedea exulans", emoji: "🐦", rarete: "legendaire", groupe: "oiseau",
    image: "images/079-albatros.jpg", credit: "JJ Harrison — CC BY-SA 3.0",
    libelles: { vitesse: "Envergure" },
    habitat: "Océan Austral", continent: "Antarctique", regime: "Piscivore",
    poids: "6 à 12 kg", vitesse: "jusqu'à 3,5 m", longevite: "50 ans", statut: "Vulnérable",
    stats: { force: 24, vitesse: 72, endurance: 100 },
    fait: "Plus grande envergure d'oiseau vivant ; certains font trois fois le tour de l'Antarctique par an."
  },
  {
    nom: "Macareux moine", latin: "Fratercula arctica", emoji: "🐦", rarete: "commune", groupe: "oiseau",
    image: "images/080-macareux.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    habitat: "Falaises de l'Atlantique Nord", continent: "Atlantique Nord", regime: "Piscivore",
    poids: "environ 0,4 kg", vitesse: "88 km/h", longevite: "20 ans", statut: "Vulnérable",
    stats: { force: 8, vitesse: 52, endurance: 56 },
    fait: "Il « vole » sous l'eau en battant des ailes pour poursuivre les petits poissons."
  },
  {
    nom: "Martin-pêcheur d'Europe", latin: "Alcedo atthis", emoji: "🐦", rarete: "commune", groupe: "oiseau",
    image: "images/081-martin-pecheur.jpg", credit: "Tony Wood — CC BY 2.0",
    habitat: "Rivières d'Eurasie", continent: "Eurasie", regime: "Piscivore",
    poids: "environ 0,04 kg", vitesse: "40 km/h", longevite: "7 ans", statut: "Préoccupation mineure",
    stats: { force: 4, vitesse: 46, endurance: 34 },
    fait: "Sa vue s'adapte au passage de l'air à l'eau ; il niche au fond d'un terrier creusé dans la berge."
  },
  {
    nom: "Cigogne blanche", latin: "Ciconia ciconia", emoji: "🐦", rarete: "commune", groupe: "oiseau",
    image: "images/082-cigogne.jpg", credit: "Charles J. Sharp — CC BY-SA 4.0",
    libelles: { vitesse: "Envergure" },
    habitat: "Prairies et marais", continent: "Europe et Afrique", regime: "Carnivore",
    poids: "2,3 à 4,4 kg", vitesse: "1,55 à 2,15 m", longevite: "25 ans", statut: "Préoccupation mineure",
    stats: { force: 16, vitesse: 44, endurance: 84 },
    fait: "Elle contourne la Méditerranée : les ascendances dont elle dépend ne se forment pas au-dessus de la mer."
  },
  {
    nom: "Hibou grand-duc", latin: "Bubo bubo", emoji: "🦉", rarete: "epique", groupe: "oiseau",
    image: "images/083-grand-duc.jpg", credit: "Martin Mecnarowski — CC BY-SA 3.0",
    libelles: { vitesse: "Envergure" },
    habitat: "Falaises et forêts", continent: "Eurasie", regime: "Carnivore",
    poids: "1,5 à 4 kg", vitesse: "jusqu'à 1,88 m", longevite: "20 ans", statut: "Préoccupation mineure",
    stats: { force: 36, vitesse: 54, endurance: 56 },
    fait: "L'un des plus grands hiboux du monde, reconnaissable à ses yeux orange et à ses aigrettes."
  },
  {
    nom: "Casoar à casque", latin: "Casuarius casuarius", emoji: "🐦", rarete: "rare", groupe: "oiseau",
    image: "images/084-casoar.jpg", credit: "Summerdrought — CC BY-SA 4.0",
    habitat: "Forêt tropicale humide", continent: "Océanie", regime: "Frugivore",
    poids: "jusqu'à 85 kg", vitesse: "50 km/h", longevite: "40 ans", statut: "Menacé en Australie",
    stats: { force: 58, vitesse: 60, endurance: 58 },
    fait: "Parmi les oiseaux les plus lourds du monde, il ne vole pas et porte un casque osseux sur la tête."
  },
  {
    nom: "Anaconda vert", latin: "Eunectes murinus", emoji: "🐍", rarete: "epique", groupe: "reptile",
    image: "images/085-anaconda.jpg", credit: "MKAMPIS — CC BY-SA 4.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Marais et rivières d'Amazonie", continent: "Amérique du Sud", regime: "Carnivore",
    poids: "jusqu'à 100 kg", vitesse: "jusqu'à 6 m", longevite: "10 ans", statut: "Préoccupation mineure",
    stats: { force: 84, vitesse: 30, endurance: 54 },
    fait: "L'un des serpents les plus lourds du monde ; dépourvu de venin, il tue par constriction."
  },
  {
    nom: "Iguane marin", latin: "Amblyrhynchus cristatus", emoji: "🦎", rarete: "rare", groupe: "reptile",
    image: "images/086-iguane-marin.jpg", credit: "RAF-YYC — CC BY-SA 2.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Côtes rocheuses des Galápagos", continent: "Amérique du Sud", regime: "Herbivore",
    poids: "1 à 12 kg", vitesse: "jusqu'à 1,3 m", longevite: "12 ans", statut: "Vulnérable",
    stats: { force: 20, vitesse: 26, endurance: 44 },
    fait: "Seul lézard marin au monde : il plonge brouter les algues, puis se réchauffe au soleil sur la roche."
  },
  {
    nom: "Alligator d'Amérique", latin: "Alligator mississippiensis", emoji: "🐊", rarete: "epique", groupe: "reptile",
    image: "images/087-alligator.jpg", credit: "Postdlf — CC BY-SA 3.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Marais du sud-est des États-Unis", continent: "Amérique du Nord", regime: "Carnivore",
    poids: "jusqu'à 450 kg", vitesse: "3,4 à 4,8 m", longevite: "50 ans", statut: "Préoccupation mineure",
    stats: { force: 88, vitesse: 44, endurance: 72 },
    fait: "Son museau large en U le distingue du crocodile américain, et il supporte bien mieux le froid."
  },
  {
    nom: "Salamandre tachetée", latin: "Salamandra salamandra", emoji: "🦎", rarete: "rare", groupe: "reptile",
    image: "images/088-salamandre.jpg", credit: "Didier Descouens — CC BY-SA 4.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Forêts humides d'Europe", continent: "Europe", regime: "Insectivore",
    poids: "environ 40 g", vitesse: "15 à 25 cm", longevite: "20 ans", statut: "Vulnérable",
    stats: { force: 6, vitesse: 8, endurance: 26 },
    fait: "Ses taches jaunes avertissent qu'elle est toxique ; un individu a vécu plus de 50 ans en musée."
  },
  {
    nom: "Libellule empereur", latin: "Anax imperator", emoji: "🦗", rarete: "commune", groupe: "insecte",
    image: "images/089-libellule.jpg", credit: "Quartl — CC BY 3.0",
    libelles: { vitesse: "Envergure" },
    habitat: "Mares et étangs", continent: "Europe et Afrique", regime: "Insectivore",
    poids: "environ 1 g", vitesse: "environ 10 cm", longevite: "1 an", statut: "Préoccupation mineure",
    stats: { force: 4, vitesse: 60, endurance: 40 },
    fait: "C'est la plus grande libellule d'Europe ; elle capture et dévore ses proies en plein vol."
  },
  {
    nom: "Coccinelle à sept points", latin: "Coccinella septempunctata", emoji: "🐞", rarete: "commune", groupe: "insecte",
    image: "images/090-coccinelle.jpg", credit: "Dominik Stodulski / MathKnight — CC BY-SA 3.0",
    libelles: { vitesse: "Longueur" },
    habitat: "Prairies et jardins", continent: "Eurasie et Afrique du Nord", regime: "Carnivore",
    poids: "moins de 0,1 g", vitesse: "5 à 8 mm", longevite: "1 an", statut: "Préoccupation mineure",
    stats: { force: 2, vitesse: 20, endurance: 24 },
    fait: "Grande dévoreuse de pucerons, elle a été introduite en Amérique du Nord comme insecticide vivant."
  },

  // ----------------------------------------------------------------------
  // Série n° 4 — animaux domestiques
  //
  // Libellés adaptés : « Origine » (lieu et date de domestication) plutôt
  // qu'habitat, « Taille », et « Rôle » plutôt que statut de conservation —
  // aucune de ces espèces n'est menacée à l'état domestique.
  //
  // Chiffres vérifiés sur les articles de Wikipédia consultés le 4 août 2026.
  // Les fourchettes de poids et de taille couvrent les variations entre races
  // et entre mâles et femelles : une valeur unique serait trompeuse.
  // ----------------------------------------------------------------------

  {
    nom: "Labrador retriever", latin: "Canis lupus familiaris", emoji: "🐕", rarete: "commune", groupe: "domestique",
    image: "images/091-labrador.jpg", credit: "IDS.photos — CC BY-SA 2.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Royaume-Uni, XIXe siècle", continent: "Europe", regime: "Omnivore",
    poids: "25 à 36 kg", vitesse: "55 à 62 cm au garrot", longevite: "12 ans", statut: "Compagnie et assistance",
    stats: { force: 40, vitesse: 52, endurance: 62 },
    fait: "Développé à partir de chiens d'eau de Terre-Neuve, il est souvent formé comme chien guide."
  },
  {
    nom: "Berger allemand", latin: "Canis lupus familiaris", emoji: "🐕", rarete: "epique", groupe: "domestique",
    image: "images/092-berger-allemand.jpg", credit: "gomagoti — CC BY-SA 2.5",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Allemagne, à partir de 1899", continent: "Europe", regime: "Omnivore",
    poids: "22 à 40 kg", vitesse: "55 à 65 cm au garrot", longevite: "11 ans", statut: "Travail et compagnie",
    stats: { force: 52, vitesse: 58, endurance: 70 },
    fait: "Créé par Max von Stephanitz pour garder les troupeaux, il sert aussi en secours et en police."
  },
  {
    nom: "Border collie", latin: "Canis lupus familiaris", emoji: "🐕", rarete: "rare", groupe: "domestique",
    image: "images/093-border-collie.jpg", credit: "Sannse — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Frontière anglo-écossaise", continent: "Europe", regime: "Omnivore",
    poids: "14 à 20 kg", vitesse: "48 à 56 cm au garrot", longevite: "13 ans", statut: "Conduite de troupeaux",
    stats: { force: 30, vitesse: 62, endurance: 82 },
    fait: "Souvent présenté comme la race de chien la plus intelligente, il domine les concours de bergers."
  },
  {
    nom: "Chihuahua", latin: "Canis lupus familiaris", emoji: "🐕", rarete: "rare", groupe: "domestique",
    image: "images/094-chihuahua.jpg", credit: "Bonnie van den Born — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Mexique", continent: "Amérique du Nord", regime: "Omnivore",
    poids: "1,5 à 3 kg", vitesse: "15 à 23 cm au garrot", longevite: "14 ans", statut: "Compagnie",
    stats: { force: 6, vitesse: 30, endurance: 24 },
    fait: "Plus petite race de chien reconnue au monde, il garde une part d'ascendance canine précolombienne."
  },
  {
    nom: "Dogue allemand", latin: "Canis lupus familiaris", emoji: "🐕", rarete: "legendaire", groupe: "domestique",
    image: "images/095-dogue-allemand.jpg", credit: "Lilly M — CC BY-SA 2.5",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Allemagne", continent: "Europe", regime: "Omnivore",
    poids: "50 à 80 kg", vitesse: "72 à 90 cm au garrot", longevite: "8 ans", statut: "Garde et compagnie",
    stats: { force: 68, vitesse: 48, endurance: 44 },
    fait: "C'est l'une des deux plus grandes races de chien au monde, avec le lévrier irlandais."
  },
  {
    nom: "Maine Coon", latin: "Felis catus", emoji: "🐈", rarete: "epique", groupe: "domestique",
    image: "images/096-maine-coon.jpeg", credit: "Alix devil — CC BY-SA 4.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Maine, États-Unis", continent: "Amérique du Nord", regime: "Carnivore",
    poids: "5 à 8 kg", vitesse: "jusqu'à 1 m de long", longevite: "13 ans", statut: "Compagnie",
    stats: { force: 22, vitesse: 40, endurance: 38 },
    fait: "Surnommé « le gentil géant », c'est le chat officiel de l'État du Maine."
  },
  {
    nom: "Chat siamois", latin: "Felis catus", emoji: "🐈", rarete: "commune", groupe: "domestique",
    image: "images/097-siamois.JPG", credit: "Meekahoo — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Thaïlande, ancien Siam", continent: "Asie", regime: "Carnivore",
    poids: "3 à 5 kg", vitesse: "environ 50 cm", longevite: "15 ans", statut: "Compagnie",
    stats: { force: 14, vitesse: 44, endurance: 36 },
    fait: "Ses extrémités foncées viennent d'un albinisme sensible à la température : le froid fonce le poil."
  },
  {
    nom: "Chat persan", latin: "Felis catus", emoji: "🐈", rarete: "commune", groupe: "domestique",
    image: "images/098-persan.jpg", credit: "Lajoma — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Iran, puis Europe au XIXe siècle", continent: "Asie", regime: "Carnivore",
    poids: "3 à 5,5 kg", vitesse: "environ 45 cm", longevite: "14 ans", statut: "Compagnie",
    stats: { force: 12, vitesse: 26, endurance: 28 },
    fait: "Le nez très aplati, obtenu par sélection aux États-Unis, gêne la respiration ; le type ancien en est exempt."
  },
  {
    nom: "Chat sphynx", latin: "Felis catus", emoji: "🐈", rarete: "rare", groupe: "domestique",
    image: "images/099-sphynx.jpg", credit: "Dmitry Makeev — CC BY-SA 4.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Canada, années 1960", continent: "Amérique du Nord", regime: "Carnivore",
    poids: "3 à 5 kg", vitesse: "environ 45 cm", longevite: "13 ans", statut: "Compagnie",
    stats: { force: 12, vitesse: 38, endurance: 30 },
    fait: "Sa nudité vient d'une mutation naturelle ; sans fourrure, il perd vite sa chaleur et cherche les coins tièdes."
  },
  {
    nom: "Pur-sang arabe", latin: "Equus caballus", emoji: "🐎", rarete: "legendaire", groupe: "domestique",
    image: "images/100-cheval-arabe.jpg", credit: "Ealdgyth — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Asie de l'Ouest", continent: "Asie", regime: "Herbivore",
    poids: "400 à 450 kg", vitesse: "1,45 à 1,55 m au garrot", longevite: "30 ans", statut: "Selle et endurance",
    stats: { force: 62, vitesse: 78, endurance: 92 },
    fait: "L'une des plus anciennes races modernes : son sang coule dans presque tous les chevaux de selle actuels."
  },
  {
    nom: "Poney Shetland", latin: "Equus caballus", emoji: "🐴", rarete: "rare", groupe: "domestique",
    image: "images/101-poney-shetland.jpg", credit: "Pitke — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Îles Shetland, Écosse", continent: "Europe", regime: "Herbivore",
    poids: "180 à 200 kg", vitesse: "jusqu'à 1,07 m au garrot", longevite: "30 ans", statut: "Attelage et équitation",
    stats: { force: 44, vitesse: 44, endurance: 76 },
    fait: "Présent aux Shetland depuis l'âge du bronze, il a porté la tourbe puis travaillé dans les mines de charbon."
  },
  {
    nom: "Âne domestique", latin: "Equus asinus", emoji: "🐴", rarete: "rare", groupe: "domestique",
    image: "images/102-ane.jpg", credit: "Adrian Pingstone — domaine public",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Afrique, il y a 5 000 à 7 000 ans", continent: "Afrique", regime: "Herbivore",
    poids: "150 à 400 kg", vitesse: "0,9 à 1,5 m au garrot", longevite: "30 ans", statut: "Bât et trait",
    stats: { force: 46, vitesse: 36, endurance: 88 },
    fait: "Plus de 40 millions d'ânes travaillent dans le monde ; croisé avec une jument, il donne le mulet."
  },
  {
    nom: "Vache Holstein", latin: "Bos taurus", emoji: "🐄", rarete: "epique", groupe: "domestique",
    image: "images/103-vache-holstein.jpg", credit: "Hayden Soloviev — CC BY 4.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Frise, Pays-Bas et Allemagne", continent: "Europe", regime: "Herbivore",
    poids: "580 à 680 kg", vitesse: "1,45 m au garrot", longevite: "20 ans", statut: "Production laitière",
    stats: { force: 70, vitesse: 30, endurance: 58 },
    fait: "Race laitière dominante dans le monde, élevée dans plus de 160 pays."
  },
  {
    nom: "Buffle d'eau", latin: "Bubalus bubalis", emoji: "🐃", rarete: "epique", groupe: "domestique",
    image: "images/104-buffle-eau.jpg", credit: "Alexander Vasenin — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Inde, il y a 6 300 ans", continent: "Asie", regime: "Herbivore",
    poids: "300 à 900 kg", vitesse: "1,5 m au garrot", longevite: "25 ans", statut: "Trait, lait et viande",
    stats: { force: 86, vitesse: 34, endurance: 78 },
    fait: "Son lait, très riche, est celui de la véritable mozzarella di bufala."
  },
  {
    nom: "Mouton", latin: "Ovis aries", emoji: "🐑", rarete: "commune", groupe: "domestique",
    image: "images/105-mouton.jpg", credit: "Keith Weller — domaine public",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Asie du Sud-Ouest", continent: "Asie", regime: "Herbivore",
    poids: "45 à 100 kg", vitesse: "1,2 m de long", longevite: "12 ans", statut: "Laine, viande et lait",
    stats: { force: 30, vitesse: 40, endurance: 56 },
    fait: "Environ 1,2 milliard de moutons dans le monde ; leur laine est la fibre animale la plus utilisée."
  },
  {
    nom: "Chèvre domestique", latin: "Capra hircus", emoji: "🐐", rarete: "commune", groupe: "domestique",
    image: "images/106-chevre.jpg", credit: "Armin Kübelbeck — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Iran, il y a 10 000 ans", continent: "Asie", regime: "Herbivore",
    poids: "20 à 140 kg", vitesse: "0,7 à 1 m au garrot", longevite: "15 ans", statut: "Lait, viande et poil",
    stats: { force: 34, vitesse: 46, endurance: 70 },
    fait: "L'un des tout premiers animaux domestiqués : on en compte plus de 1,1 milliard, dont 150 millions en Inde."
  },
  {
    nom: "Cochon domestique", latin: "Sus domesticus", emoji: "🐖", rarete: "commune", groupe: "domestique",
    image: "images/107-cochon.jpg", credit: "kallerna — CC BY-SA 4.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Proche-Orient et Chine, Néolithique", continent: "Eurasie", regime: "Omnivore",
    poids: "50 à 350 kg", vitesse: "0,9 à 1,8 m de long", longevite: "15 ans", statut: "Élevage",
    stats: { force: 58, vitesse: 42, endurance: 50 },
    fait: "Il a été domestiqué deux fois indépendamment : au Proche-Orient et en Chine."
  },
  {
    nom: "Poule", latin: "Gallus gallus domesticus", emoji: "🐔", rarete: "commune", groupe: "domestique",
    image: "images/108-poule.jpg", credit: "Andrei Niemimäki — CC BY-SA 2.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Asie du Sud-Est, il y a 8 000 ans", continent: "Asie", regime: "Omnivore",
    poids: "1,5 à 3 kg", vitesse: "environ 40 cm", longevite: "8 ans", statut: "Œufs et viande",
    stats: { force: 8, vitesse: 30, endurance: 32 },
    fait: "Une pondeuse donne plus de 300 œufs par an ; la population mondiale dépasse 26 milliards d'individus."
  },
  {
    nom: "Canard de Pékin", latin: "Anas platyrhynchos domesticus", emoji: "🦆", rarete: "commune", groupe: "domestique",
    image: "images/109-canard-pekin.jpg", credit: "Martin Backert — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Chine, puis États-Unis en 1873", continent: "Asie", regime: "Omnivore",
    poids: "3,5 à 4 kg", vitesse: "environ 50 cm", longevite: "9 ans", statut: "Viande et œufs",
    stats: { force: 10, vitesse: 34, endurance: 40 },
    fait: "Race américaine issue de canards chinois importés en 1873 : le canard de chair le plus élevé au monde."
  },
  {
    nom: "Oie domestique", latin: "Anser anser domesticus", emoji: "🦢", rarete: "commune", groupe: "domestique",
    image: "images/110-oie.jpg", credit: "Tomás Del Coro — CC BY-SA 2.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Europe et Asie", continent: "Eurasie", regime: "Herbivore",
    poids: "5 à 9 kg", vitesse: "75 à 90 cm", longevite: "20 ans", statut: "Viande, œufs et duvet",
    stats: { force: 18, vitesse: 36, endurance: 48 },
    fait: "Elle descend de l'oie cendrée en Europe et de l'oie cygnoïde en Asie."
  },
  {
    nom: "Dindon domestique", latin: "Meleagris gallopavo domesticus", emoji: "🦃", rarete: "commune", groupe: "domestique",
    image: "images/111-dindon.jpg", credit: "Lupin — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Mésoamérique, il y a 2 000 ans", continent: "Amérique du Nord", regime: "Omnivore",
    poids: "5 à 15 kg", vitesse: "environ 1 m", longevite: "10 ans", statut: "Viande",
    stats: { force: 22, vitesse: 32, endurance: 38 },
    fait: "Domestiqué au Mexique, il fut rapporté en Europe par les Espagnols au XVIe siècle."
  },
  {
    nom: "Pigeon voyageur", latin: "Columba livia domestica", emoji: "🕊️", rarete: "epique", groupe: "domestique",
    image: "images/112-pigeon-voyageur.jpg", credit: "Patrick Edwin Moran — domaine public",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Bassin méditerranéen", continent: "Europe et Afrique du Nord", regime: "Granivore",
    poids: "0,3 à 0,5 kg", vitesse: "environ 32 cm", longevite: "15 ans", statut: "Messager et concours",
    stats: { force: 6, vitesse: 70, endurance: 92 },
    fait: "Des vols de 1 800 km ont été enregistrés en compétition ; il s'oriente au champ magnétique terrestre."
  },
  {
    nom: "Lapin domestique", latin: "Oryctolagus cuniculus domesticus", emoji: "🐰", rarete: "commune", groupe: "domestique",
    image: "images/113-lapin.jpg", credit: "Friedrich Haag — CC BY-SA 4.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Europe, époque romaine", continent: "Europe", regime: "Herbivore",
    poids: "1 à 8 kg", vitesse: "20 à 50 cm", longevite: "9 ans", statut: "Compagnie et élevage",
    stats: { force: 12, vitesse: 48, endurance: 40 },
    fait: "Domestiqué par les Romains ; il apprend la litière et vient quand on l'appelle."
  },
  {
    nom: "Cochon d'Inde", latin: "Cavia porcellus", emoji: "🐹", rarete: "commune", groupe: "domestique",
    image: "images/114-cochon-inde.jpg", credit: "Plath81 — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Andes, Amérique du Sud", continent: "Amérique du Sud", regime: "Herbivore",
    poids: "0,7 à 1,2 kg", vitesse: "20 à 25 cm", longevite: "6 ans", statut: "Compagnie",
    stats: { force: 5, vitesse: 22, endurance: 26 },
    fait: "Domestiqué dans les Andes comme animal de boucherie, il y est encore élevé pour sa viande."
  },
  {
    nom: "Hamster doré", latin: "Mesocricetus auratus", emoji: "🐹", rarete: "commune", groupe: "domestique",
    image: "images/115-hamster-dore.jpg", credit: "Adamjennison111 — CC BY 2.5",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Syrie et sud de la Turquie", continent: "Asie", regime: "Omnivore",
    poids: "0,1 à 0,2 kg", vitesse: "13 à 18 cm", longevite: "3 ans", statut: "Compagnie",
    stats: { force: 3, vitesse: 26, endurance: 22 },
    fait: "Très répandu en cage, il est pourtant classé en danger à l'état sauvage."
  },
  {
    nom: "Chinchilla", latin: "Chinchilla lanigera", emoji: "🐭", rarete: "rare", groupe: "domestique",
    image: "images/116-chinchilla.JPG", credit: "Guérin Nicolas — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Andes du Chili", continent: "Amérique du Sud", regime: "Herbivore",
    poids: "0,4 à 0,8 kg", vitesse: "25 à 35 cm", longevite: "15 ans", statut: "Compagnie",
    stats: { force: 6, vitesse: 34, endurance: 34 },
    fait: "Sa fourrure est la plus dense de tous les mammifères terrestres : environ 20 000 poils par cm²."
  },
  {
    nom: "Furet", latin: "Mustela furo", emoji: "🐾", rarete: "rare", groupe: "domestique",
    image: "images/117-furet.png", credit: "Alfredo Gutiérrez — CC BY-SA 4.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Europe, Antiquité", continent: "Europe", regime: "Carnivore",
    poids: "0,7 à 2 kg", vitesse: "50 cm avec la queue", longevite: "8 ans", statut: "Compagnie et chasse",
    stats: { force: 14, vitesse: 44, endurance: 40 },
    fait: "Domestiqué depuis l'Antiquité pour déloger les lapins de leur terrier : c'est le furetage."
  },
  {
    nom: "Poisson rouge", latin: "Carassius auratus", emoji: "🐠", rarete: "commune", groupe: "domestique",
    image: "images/118-poisson-rouge.jpg", credit: "לינה אבוגוש — CC BY-SA 3.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Chine, il y a plus de 1 000 ans", continent: "Asie", regime: "Omnivore",
    poids: "0,1 à 3 kg", vitesse: "10 à 40 cm", longevite: "20 ans", statut: "Aquarium",
    stats: { force: 4, vitesse: 26, endurance: 34 },
    fait: "Sélectionné pour sa couleur dans la Chine impériale il y a plus de mille ans."
  },
  {
    nom: "Canari", latin: "Serinus canaria forma domestica", emoji: "🐦", rarete: "commune", groupe: "domestique",
    image: "images/119-canari.JPG", credit: "NEWSchr — CC BY-SA 4.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Îles Canaries", continent: "Macaronésie", regime: "Granivore",
    poids: "0,015 kg", vitesse: "12 à 13 cm", longevite: "10 ans", statut: "Compagnie et chant",
    stats: { force: 2, vitesse: 30, endurance: 26 },
    fait: "On l'emportait dans les mines de charbon : sa mort signalait la présence de gaz toxiques."
  },
  {
    nom: "Perruche ondulée", latin: "Melopsittacus undulatus", emoji: "🦜", rarete: "commune", groupe: "domestique",
    image: "images/120-perruche.jpg", credit: "Anna Saccheri — CC BY-SA 2.0",
    libelles: { habitat: "Origine", vitesse: "Taille", statut: "Rôle" },
    habitat: "Australie", continent: "Océanie", regime: "Granivore",
    poids: "0,03 kg", vitesse: "environ 18 cm", longevite: "8 ans", statut: "Compagnie",
    stats: { force: 3, vitesse: 34, endurance: 30 },
    fait: "Troisième animal de compagnie le plus répandu au monde, après le chien et le chat."
  }
];
