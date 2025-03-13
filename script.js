document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".section");
    const motsListe = document.getElementById("motsListe");
    const compteurMots = document.getElementById("compteurMots");
    const ajouterBtn = document.getElementById("ajouter");
    const enregistrerBtn = document.getElementById("enregistrer");
    const chargerBtn = document.getElementById("charger");
    const supprimerTousBtn = document.getElementById("supprimerTous");
    const chargerFichier = document.getElementById("chargerFichier");
    const navButtons = document.querySelectorAll(".nav-bar button");
    const modal = document.getElementById("modal");
    const modalMot = document.getElementById("modalMot");
    const modalDefinition = document.getElementById("modalDefinition");
    const closeModal = document.querySelector(".close");
    
    let mots = JSON.parse(localStorage.getItem("mots")) || [];
    afficherMots();

    // Gestion des onglets de navigation
    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            sections.forEach(section => section.classList.remove("active"));
            document.getElementById(button.dataset.section).classList.add("active");
            navButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });

    // Ajouter un mot avec animation
    ajouterBtn.addEventListener("click", () => {
        const mot = document.getElementById("mot").value.trim();
        const definition = document.getElementById("definition").value.trim();

        if (mot && definition) {
            mots.push({ mot, definition });
            trierMots();
            sauvegarderMots();
            afficherMots();
            document.getElementById("mot").value = "";
            document.getElementById("definition").value = "";
        }
    });

    function trierMots() {
        mots.sort((a, b) => a.mot.localeCompare(b.mot));
    }

    function afficherMots() {
        motsListe.innerHTML = "";
        mots.forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = item.mot;
            li.classList.add("fade-in");
            li.addEventListener("click", () => afficherDefinition(index, li));
            motsListe.appendChild(li);
        });
        compteurMots.textContent = mots.length;
    }

    function sauvegarderMots() {
        localStorage.setItem("mots", JSON.stringify(mots));
    }

    function afficherDefinition(index, element) {
        modalMot.textContent = mots[index].mot;
        modalDefinition.textContent = mots[index].definition;
        modal.classList.add("active");
        
        document.querySelectorAll("#motsListe li").forEach(li => li.classList.remove("active"));
        element.classList.add("active");
    }

    closeModal.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("active");
        }
    });

    enregistrerBtn.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(mots)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mots.json";
        a.click();
    });

    chargerBtn.addEventListener("click", () => {
        const file = chargerFichier.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                mots = JSON.parse(event.target.result);
                trierMots();
                sauvegarderMots();
                afficherMots();
            };
            reader.readAsText(file);
        }
    });

    supprimerTousBtn.addEventListener("click", () => {
        mots = [];
        localStorage.removeItem("mots");
        afficherMots();
    });
});

async function getRandomWord() {
    try {
        let wordResponse = await fetch("https://random-word-api.herokuapp.com/word");
        let wordArray = await wordResponse.json();
        let word = wordArray[0];

        let definitionResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        let definitionData = await definitionResponse.json();

        if (definitionData.title) {
            return getRandomWord(); // Si pas de définition, recommencer
        }

        let definition = definitionData[0].meanings[0].definitions[0].definition;
        return { word, definition };
    } catch (error) {
        console.error("Erreur lors de la récupération du mot :", error);
    }
}

// Ouvre la modale avec un nouveau mot
async function showRandomWord() {
    let data = await getRandomWord();
    if (data) {
        document.getElementById("randomWord").textContent = `Mot : ${data.word}`;
        document.getElementById("wordDefinition").textContent = `Définition : ${data.definition}`;

        // Réinitialiser la traduction
        document.getElementById("translatedWord").textContent = "";
        document.getElementById("translatedDefinition").textContent = "";

        // Réafficher le bouton de traduction
        document.getElementById("translateButton").style.display = "block";

        document.getElementById("wordModal").style.display = "block"; // Afficher la modale
    }
}

// Fermer la modale
function closeModal() {
    document.getElementById("wordModal").style.display = "none";
}

// Traduire du texte avec l'API MyMemory
async function translateText(text) {
    try {
        let response = await fetch("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=en|fr");
        let data = await response.json();
        return data.responseData.translatedText;
    } catch (error) {
        console.error("Erreur de traduction :", error);
        return "Traduction non disponible";
    }
}

async function translateWord() {
    let word = document.getElementById("randomWord").textContent.replace("Mot : ", "");
    let definition = document.getElementById("wordDefinition").textContent.replace("Définition : ", "");

    let translatedWord = await translateText(word);
    let translatedDefinition = await translateText(definition);

    document.getElementById("translatedWord").textContent = `Mot en français : ${translatedWord}`;
    document.getElementById("translatedDefinition").textContent = `Définition en français : ${translatedDefinition}`;

    // Cacher le bouton après traduction et afficher "Ajouter à la liste"
    document.getElementById("translateButton").style.display = "none";
    document.getElementById("addToListButton").style.display = "block";
}

function addTranslatedWord() {
    let translatedWord = document.getElementById("translatedWord").textContent.replace("Mot en français : ", "").trim();
    let translatedDefinition = document.getElementById("translatedDefinition").textContent.replace("Définition en français : ", "").trim();

    if (translatedWord && translatedDefinition) {
        mots.push({ mot: translatedWord, definition: translatedDefinition });
        trierMots();
        sauvegarderMots();
        afficherMots();
        
        // Fermer la modale après l'ajout
        closeModal();
    }
}
