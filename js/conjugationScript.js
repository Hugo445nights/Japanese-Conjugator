import * as codec from "../node_modules/kamiya-codec/dist/kamiya.min.mjs";

console.log(codec.conjugate("むすぶ", "Ta"  , false));
console.log(codec.conjugateAuxiliaries("たべる", ["Masu"], "Te", "True"));

// constant values

// variables
let verbs = null; // the verbs csv content
let adjectives = null; // the adjectives csv content
let filters = null;
let expectedAnswer = null; // the current verb good answer

// elements

// functions
const updateExpectedAnswer = (isVerb) => {
    // UTILISER 'expectedAnswer', on prend toujours expectedAnswer[0] sauf si length > 1 (donc cas particuliers)
    if (isVerb) {
        // TO DO
        // Vérifier ceci: normalement, 'filters' contient des infos. Si 'Conjugation' == 'Negative', alors il faut prendre la deuxième valeur
    } else {
        // TO DO
    }
}

const getVerb = () => {
    // get all verbs from the concerned JLPT levels
    const filteredVerbs = verbs.filter(verb => filters.JLPT.includes(verb.JLPT));

    // get a random verb
    let randomVerb = null;
    let randomIndex = null;
    while (randomVerb == null || randomVerb == 'None') {
        randomIndex = Math.floor(Math.random() * filteredVerbs.length);
        randomVerb = filteredVerbs[randomIndex];
    }

    return randomVerb;
};

const getAdjective = () => {
    // get all adjectives from the concerned JLPT levels
    const filteredAdjectives = adjectives.filter(adjective => filters.JLPT.includes(adjective.JLPT));

    // get a random adjective
    let randomAdjective = null;
    let randomIndex = null;
    while (randomAdjective == null || randomAdjective == 'None') {
        randomIndex = Math.floor(Math.random() * filteredAdjectives.length);
        randomAdjective = filteredAdjectives[randomIndex];
    }

    console.log("Selected adjective: ", randomAdjective);
    return randomAdjective;
};

const getFilters = () => {
    let filters = {
        JLPT: [],
        Conjugation: [],
        Auxiliary: []
    };

    const tableRows = document.querySelectorAll('.options-table tr');

    tableRows.forEach(row => {
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const labelText = checkbox.parentNode.textContent.trim();

                if (labelText.includes('N5')
                    || labelText.includes('N4')
                    || labelText.includes('N3')
                    || labelText.includes('N2')
                    || labelText.includes('N1')
                    || labelText.includes('Others')) {
                    filters.JLPT.push(labelText);

                } else if (labelText.includes('Affirmative')
                    || labelText.includes('Negative')) {
                    filters.Conjugation.push(labelText);

                } else if (labelText.includes('Past')
                    || labelText.includes('Present/Future')) {
                    filters.Conjugation.push(labelText);

                } else if (labelText.includes('Plain')
                    || labelText.includes('Polite')) {
                    filters.Auxiliary.push(labelText);

                } else if (labelText.includes('～て')) {
                    filters.Conjugation.push(labelText);
                }
            }
        });
    });

    return filters;
};

const updateVerbDisplay = (filters, theVerb) => {
    // TO DO

    
};

const treatConjugation = (choosenConjugation) => {
    switch (choosenConjugation) {
        case 'Affirmative':
            return "Dictionary";
        case 'Negative':
            return "Negative";
        case 'Past':
            return "Ta";
        case 'Present/Future':
            return "Dictionary";
        case '～て':
            return "Te";
    }
};

const treatAuxiliaries = (choosenAuxiliaries) => {
    switch (choosenAuxiliaries[0]) {
        case 'Plain':
            return [];
        case 'Polite':
            return ["Masu"];
    }
};

const newRound = () => {
    const random = Math.floor(Math.random() * 4);
    const isVerb = random < 3;
    filters = getFilters();
    console.log(filters);
    if (isVerb) {
        // Verb 75% chance
        let theChoosenVerb = getVerb();

        // UTILISER la variable filters
        const randomConjugation = Math.floor(Math.random() * filters["Conjugation"].length);
        let choosenConjugation = filters["Conjugation"][randomConjugation];
        let treatedConjugation = treatConjugation(choosenConjugation);

        const randomAuxiliary = Math.floor(Math.random() * filters["Auxiliary"].length);
        let choosenAuxiliaries = [filters["Auxiliary"][randomAuxiliary]];

        if (choosenAuxiliaries[0] != "Masu" && filters["Auxiliary"].includes("Polite")) {
            const politeCoinflip = Math.floor(Math.random() * 3);
            if (politeCoinflip == 1) {
                choosenAuxiliaries.push("Masu");
            }
        }
        let treatedAuxiliaries = treatAuxiliaries(choosenAuxiliaries);

        const randomAuxiliaries = Math.floor(Math.random() * 2); // coinflip
        if (randomAuxiliaries == 1 && treatAuxiliaries.length > 0) {
            treatedAuxiliaries = [];
        }
        if (treatedConjugation == 'Dictionary' && treatedAuxiliaries.length == 0) {
            treatedAuxiliaries.push("Masu");
        }

        console.log("The verb: ", theChoosenVerb);
        console.log("The conjugation: ", treatedConjugation);
        console.log("The auxiliary(-ies): ", treatedAuxiliaries);

        console.log(theChoosenVerb["Hiragana"]);
        expectedAnswer = codec.conjugateAuxiliaries(theChoosenVerb["Hiragana"],
            treatedAuxiliaries, treatedConjugation, theChoosenVerb["typeII"]); // conjugate
        console.log(expectedAnswer);

        updateVerbDisplay();

    } else {
        // Adjective 25% chance
        let theChoosenAdjective = getAdjective();
        // い or な
    }

    // define style
    // define affirmation
    // define time

    // display everything (check if furigana option is ON or OFF)
    // store expected answer (hiragana reading)
    updateExpectedAnswer(isVerb, expectedAnswer);
};

const loadCSV = async (csvFile) => {
    try {
        const response = await fetch(csvFile);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${csvFile}`);
        }
        const csvData = await response.text();
        return parseCSV(csvData);
    } catch (error) {
        console.error(`Error fetching ${csvFile}:`, error);
        return null;
    }
};

const parseCSV = (csvData) => {
    const lines = csvData.trim().split('\n');
    const headers = lines.shift().split(',');
    const items = lines.map(line => {
        const values = line.split(',');
        const itemObject = {};
        headers.forEach((header, index) => {
            itemObject[header] = values[index];
        });
        return itemObject;
    });
    return items;
};

// events
document.addEventListener("DOMContentLoaded", async (event) => {
    console.log("Page loaded.");

    // Get the csv values
    verbs = await loadCSV('../csv/verbs.csv');
    console.log("Verbs loaded: ", verbs);

    adjectives = await loadCSV('../csv/adjectives.csv');
    console.log("Adjectives loaded: ", adjectives);

    newRound();
});
