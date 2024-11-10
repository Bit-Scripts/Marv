var SummaryTool = require('node-summary');

var title = "L'exploration spaciale";
var content = "";
content += "L'exploration spatiale a débuté sérieusement au milieu du 20e siècle, marquant une étape majeure dans l'histoire de l'humanité.\n";
content += "Les premiers efforts étaient dominés par la compétition entre les États-Unis et l'Union soviétique, connue sous le nom de \"Course à l'espace\".\n";
content += "En 1957, l'Union soviétique a lancé le premier satellite artificiel, Spoutnik, ouvrant ainsi une nouvelle ère dans l'exploration spatiale.\n";
content += "Quatre ans plus tard, en 1961, Yuri Gagarine est devenu le premier homme à voyager dans l'espace, réalisant un vol orbital autour de la Terre.\n"; 
content += "Cette période de l'exploration spatiale était caractérisée par des avancées rapides et des découvertes majeures.\n\n";
content += "En 1969, la mission Apollo 11 des États-Unis a atteint un point culminant historique avec le premier alunissage habité, mené par Neil Armstrong et Buzz Aldrin.\n";
content += "Après la fin de la course à l'espace, l'accent a été mis sur les missions habitées plus durables et les satellites pour la recherche et la communication.\n\n\n";
content += "Le télescope spatial Hubble, lancé en 1990, a révolutionné notre compréhension de l'univers en fournissant des images détaillées et lointaines de galaxies, nébuleuses et autres phénomènes cosmiques.\n";
content += "Au 21e siècle, l'exploration spatiale a vu la participation croissante d'agences spatiales internationales et de sociétés privées.\n";
content += "La Station Spatiale Internationale, un projet collaboratif impliquant plusieurs pays, est un symbole de coopération internationale dans l'espace.\n";
content += "Des missions robotiques telles que les rovers martiens de la NASA ont fourni des informations précieuses sur la géologie et les conditions potentielles pour la vie sur Mars.\n";
content += "Les ambitions actuelles comprennent la colonisation de Mars, le retour des humains sur la Lune et l'exploration de l'espace lointain.\n";
content += "Les sociétés privées comme SpaceX et Blue Origin jouent un rôle de plus en plus important dans la fourniture de services de lancement et de développement de nouvelles technologies.\n";
content += "Les défis futurs de l'exploration spatiale incluent la durabilité, la sécurité des astronautes et les implications éthiques de la colonisation d'autres planètes.\n";
content += "Malgré ces défis, l'exploration spatiale continue de captiver l'imagination du public et de pousser les limites de notre connaissance scientifique et technologique.\n";

SummaryTool.summarize(title, content, function(err, summary) {
    if(err) return console.log("Something went wrong man!");

    console.log(summary);

    console.log("Original Length " + (title.length + content.length));
    console.log("Summary Length " + summary.length);
    console.log("Summary Ratio: " + (100 - (100 * (summary.length / (title.length + content.length)))));
});