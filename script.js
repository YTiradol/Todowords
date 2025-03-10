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

    let mots = JSON.parse(localStorage.getItem("mots")) || []; // Charger depuis Local Storage

    afficherMots(); // Charger les mots au démarrage

    // Changer de section via la barre de navigation
    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            sections.forEach(section => section.classList.remove("active"));
            document.getElementById(button.dataset.section).classList.add("active");
        });
    });

    // Ajouter un mot
    ajouterBtn.addEventListener("click", () => {
        const mot = document.getElementById("mot").value.trim();
        const definition = document.getElementById("definition").value.trim();

        if (mot && definition) {
            mots.push({ mot, definition });
            sauvegarderMots();
            afficherMots();
            document.getElementById("mot").value = "";
            document.getElementById("definition").value = "";
        }
    });

    // Afficher la liste des mots et mettre à jour le compteur
    function afficherMots() {
        motsListe.innerHTML = "";
        mots.forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = item.mot;
            li.addEventListener("click", () => afficherDefinition(index));
            motsListe.appendChild(li);
        });
        compteurMots.textContent = mots.length; // Mise à jour du compteur
    }

    // Sauvegarder les mots dans le Local Storage
    function sauvegarderMots() {
        localStorage.setItem("mots", JSON.stringify(mots));
    }

    // Afficher la définition dans une fenêtre modale
    function afficherDefinition(index) {
        document.getElementById("modalMot").textContent = mots[index].mot;
        document.getElementById("modalDefinition").textContent = mots[index].definition;
        document.getElementById("modal").style.display = "flex";
    }

    // Fermer la modale
    document.querySelector(".close").addEventListener("click", () => {
        document.getElementById("modal").style.display = "none";
    });

    // Sauvegarder en fichier JSON
    enregistrerBtn.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(mots)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mots.json";
        a.click();
    });

    // Charger un fichier JSON
    chargerBtn.addEventListener("click", () => {
        const file = chargerFichier.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                mots = JSON.parse(event.target.result);
                sauvegarderMots(); // Mettre à jour Local Storage
                afficherMots();
            };
            reader.readAsText(file);
        }
    });

    // Supprimer tous les mots
    supprimerTousBtn.addEventListener("click", () => {
        mots = [];
        localStorage.removeItem("mots"); // Effacer du Local Storage
        afficherMots();
    });
});
