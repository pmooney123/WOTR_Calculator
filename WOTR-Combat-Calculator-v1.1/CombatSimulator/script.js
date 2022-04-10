let shadow = {
    regulars: 8,
    elites: 2,
    leaders: 5,
    stronghold: false,
    city: false,
    hits: 0,
} //permanent starting conditions

let free = {
    regulars: 3,
    elites: 2,
    leaders: 0,
    city: false,
    stronghold: true,
    hits: 0,
}

let steps = 10000; //simulation N count
let press = false; //press into strongholds?
let warnings = []; //warning messages for shitty starting conditions

function change(player, unit, amount) {
    if (player === 0) {
        switch (unit) {
            case "regular":
                shadow.regulars += amount;
                break;
            case "elite":
                shadow.elites += amount;
                break;
            case "leader":
                shadow.leaders += amount;
                break;
        }
    }
    if (player === 1) {
        switch (unit) {
            case "regular":
                free.regulars += amount;
                break;
            case "elite":
                free.elites += amount;
                break;
            case "leader":
                free.leaders += amount;
                break;
        }

    }
    updateTexts();
} //takes an int, a string, and an amount. Changes simulation conditions. Modularity used to make button function code simple

function updateTexts() {
    let fr = document.getElementById("fr");
    let fe = document.getElementById("fe");
    let fl = document.getElementById("fl");
    let sr = document.getElementById("sr");
    let se = document.getElementById("se");
    let sl = document.getElementById("sl");

    fr.innerText = "Regular: " + free.regulars;
    fe.innerText = "Elite: " + free.elites;
    fl.innerText = "Leaders: " + free.leaders;

    sr.innerText = "Regular: " + shadow.regulars;
    se.innerText = "Elite:  " + shadow.elites;
    sl.innerText = "Leaders: " + shadow.leaders;


    document.getElementById('press').innerText = press + ''
    document.getElementById('sc').innerText = shadow.city + '';
    document.getElementById('ssh').innerText = shadow.stronghold + '';
    document.getElementById('fc').innerText = free.city + '';
    document.getElementById('fsh').innerText = free.stronghold + '';
} //do this after a change!

updateTexts();

let info = {};
let s = {};
let f = {};

let confusionOnes = 0;

function resetInfo() {
    info.shadowWins = 0;
    info.freeWins = 0;
    info.ties = 0;
    info.total = 0;

    info.diceUsed = 1;

    info.presses = 0;

    info.combatRounds = 0;

    info.hitsFree = 0;
    info.averageHitsFree = 0;

    info.hitsShadow = 0;
    info.averageHitsShadow = 0;

    info.remainingHPShadow = 0;
    info.remainingHPFree = 0;
    info.averageRemainingHPShadow = 0;
    info.averageRemainingHPFree = 0;
    info.averageRemainingHPWinner = 0;


} //simulation information for reporting

function printInfo() {
    info.averageRemainingHPFree = info.remainingHPFree / info.freeWins;

    info.averageRemainingHPShadow = info.remainingHPShadow / info.shadowWins;

    info.averageHitsShadow = info.hitsShadow / info.combatRounds;

    info.averageHitsFree = info.hitsFree / info.combatRounds;

    let report = "";
    report = "Details: ";
    report = report.concat("\n" + "Hp Remaining Free (on win): " + round(info.averageRemainingHPFree, 10));
    report = report.concat("\n" + "Hp Remaining Shadow (on win): " + round(info.averageRemainingHPShadow, 10));
    report = report.concat("\n" + "Average Hits Free: " + round(info.averageHitsFree, 10));
    report = report.concat("\n" + "Average Hits Shadow: " + round(info.averageHitsShadow, 10));
    report = report.concat("\n" + "Average Presses: " + round((info.presses/info.total), 10));
    report = report.concat("\n" + "Average Dice Used by Attacker: " + round((info.diceUsed/info.total), 10));

    document.getElementById("details").innerText  = report;
}

function setStepVars() {
    s.regulars = shadow.regulars;
    s.elites = shadow.elites;
    s.leaders = shadow.leaders;
    s.stronghold = shadow.stronghold;

    f.regulars = free.regulars;
    f.elites = free.elites;
    f.leaders = free.leaders;
    f.stronghold = free.stronghold;

} //set simulation conditions after an entire combat to default

function resetCardEffects() {
    s.combatBonus = 0;
    s.leaderBonus = 0;
    s.maxDice = 5;
    s.durins = false;
    s.preDice = 0;
    s.preHit = 0;
    s.preBonus = 0;
    s.preTarget = 0;
    s.forfietLeaders = 0;
    s.onslaught = 0;

    s.weCome = false;
    s.mumakil = false;
    s.foulStench = false;
    s.greatHost = false;
    s.postDice = 0;
    s.postHits = 0;

    f.combatBonus = 0;
    f.leaderBonus = 0;
    f.maxDice = 5;
    f.suddenStrike = false;
    f.charge = false;
    f.preHit = 0 ;
    f.preDice = 0;
    f.ldrHit = 0;
    f.ldrActual = 0;
    f.preBonus = 0;
    f.preTarget = 0;
    f.mightyHits = 0;
    f.shieldwall = false;
    f.confusion = false;
    f.checkForNoQuarter = 0;
} //reset some variables associated with card effects every combat round

function getResult() {
    resetInfo();
    for (let i = 0; i < steps; i++) {
        info.total++;
        setStepVars(); //reset s and f

        let combatOver = false;
        let firstTurn = true;
        let roundNumber = 0;
        while (!combatOver) {
            s.hits = 0;
            f.hits = 0;
            roundNumber++;
            //apply Card Effects
            resetCardEffects();
            switch (shadowCards[roundNumber]) {
                case "desperate battle":
                    f.combatBonus++;
                    s.combatBonus++;
                    f.leaderBonus++;
                    s.leaderBonus++;
                    break;
                case "durins bane":
                    s.durins = true;
                    break;
                case "deadly strife":
                    f.combatBonus += 2;
                    s.combatBonus += 2;
                    f.leaderBonus += 2;
                    s.leaderBonus += 2;
                    break;
                case "devilry of orthanc":
                    s.combatBonus++;
                    if (!shadow.stronghold && !free.stronghold) {
                        warnings.push("Devilry played with no stronghold.");
                    }
                    break;
                case "special tile":
                    s.combatBonus++;
                    s.leaderBonus++;
                    break;
                case "we come to kill":
                    s.weCome = true;
                    break;
                case "great host":
                    s.greatHost = true;
                    break;
                case "mumakil":
                    s.combatBonus++;
                    s.mumakil = true;
                    break;
                case "foul stench":
                    s.foulStench = true;
                    break;
                case "cruel as death":
                    s.forfietLeaders = 2;
                    s.combatBonus++;
                    break;
                case "they are terrible":
                    s.forfietLeaders = 1;
                    s.leaderBonus++;
                    break;
                case "relentless1":
                    s.combatBonus++;
                    takeCasualties(s, 1);
                    break;
                case "relentless2":
                    s.combatBonus+=2;
                    takeCasualties(s, 2);
                    break;
                case "onslaught1":
                    s.onslaught = 1;
                    break;
                case "onslaught2":
                    s.onslaught = 2;
                    break;
                case "onslaught3":
                    s.onslaught = 3;
                    break;
                case "onslaught4":
                    s.onslaught = 4;
                    break;
                default:
                    warnings.push("WARNING: shadow card not registered");
            }
            switch (freeCards[roundNumber]) {
                case "sudden strike":
                    f.suddenStrike = true;
                    break;
                case "charge":
                    f.charge = true;
                    break;
                case "daylight":
                    s.maxDice = 3;
                    break;
                case "ents rage":
                    f.combatBonus += 2;
                    break;
                case "valour":
                    f.combatBonus++;
                    if (f.elites <= 0) {
                        warnings.push("Valour played with no elite.");
                    }
                    break;
                case "no quarter":
                    f.checkForNoQuarter = 1;
                    break;
                case "nameless wood":
                    f.checkForNoQuarter = 2;
                    break;
                case "servant":
                    f.combatBonus++;
                    break;
                case "hourndark":
                    s.maxDice = 2;
                    break;
                case "anduril":
                    f.mightyHits = 2;
                    break;
                case "mighty attack":
                    f.mightyHits = 1;
                    break;
                case "shieldwall":
                    f.shieldwall = true;
                    break;
                case "confusion":
                    f.confusion = true;
                    break;
                case "special tile":
                    f.combatBonus++;
                    f.leaderBonus++;
                    break;
                default:
                    warnings.push("WARNING: free card not registered");
                    break;
            }

        //precombat rolls
            if (s.durins) {
                s.preHit = getRoll(3, 0, 4);
                takeCasualties(f, s.preHit);
            }
            if (f.suddenStrike) {
                f.preDice = Math.min(5, f.leaders);
                let target = ((firstTurn && shadow.city) || shadow.stronghold) ? 6 : 5;
                let bonus = 0;
                f.preHit = getRoll(f.preDice, bonus, target);
                takeCasualties(s, f.preHit);
            }
            if (f.charge) {
                f.preDice = Math.min(5, f.elites);
                let target = ((firstTurn && shadow.city) || shadow.stronghold) ? 6 : 5;
                let bonus = 0;
                f.preHit = getRoll(f.preDice, bonus, target);
                takeCasualties(s, f.preHit);
            }

            //free rolls combat
            f.combatDice = Math.min(f.regulars + f.elites, f.maxDice);
            f.cmbActual = f.combatDice;

            let target = ((firstTurn && shadow.city) || shadow.stronghold) ? 6 : 5;
            let bonus = f.combatBonus;

            f.cmbHit = getRoll(f.cmbActual, bonus, target);
            f.hits += f.cmbHit;

        //shadow rolls combat
            s.combatDice = Math.min(s.regulars + s.elites, s.maxDice);
            s.cmbActual = s.combatDice;

            target = ((firstTurn && free.city) || free.stronghold) ? 6 : 5;
            bonus = s.combatBonus;

            confusionOnes = 0;
            s.cmbHit = getRoll(s.cmbActual, bonus, target);
            s.hits += s.cmbHit;

            if (f.confusion) {
                f.hits += confusionOnes;
            }


        //free rolls leader
            if (s.leaders >= f.leaders && s.foulStench) {

            } else {

                f.leaderDice = Math.min(f.leaders, f.maxDice, f.regulars + f.elites);
                f.ldrActual = f.leaderDice - f.cmbHit;

                for (let i = 0; i < f.mightyHits && f.ldrActual > 0; i++) {
                    f.ldrActual--;
                    f.ldrHit++;
                }

                target = ((firstTurn && shadow.city) || shadow.stronghold) ? 6 : 5;
                bonus = f.leaderBonus;

                f.ldrHit += getRoll(f.ldrActual, bonus, target);
                f.hits += f.ldrHit;
            }

        //shadow rolls leader

            s.leaderDice = Math.min(s.leaders - s.forfietLeaders, s.maxDice, s.regulars + s.elites);
            let confusionBonus = confusionOnes;
            if (!f.confusion) {
                confusionBonus = 0;
            }
            s.ldrActual = s.leaderDice - (s.cmbHit + confusionBonus);

            target = ((firstTurn && free.city) || free.stronghold) ? 6 : 5;
            bonus = s.leaderBonus;

            s.ldrHit = getRoll(s.ldrActual, bonus, target);
            s.hits += s.ldrHit;

        //post roll checks
            if (f.checkForNoQuarter != null) {
                if (f.checkForNoQuarter > 0) {
                    if (f.hits > 0) {
                        f.hits += f.checkForNoQuarter;
                    }
                }
            }
            if (s.mumakil) {
                if (s.hits > f.preHit + f.hits) {
                    s.hits++;
                }
            }
            if (f.shieldwall) {
                if (s.hits > 1) {
                    s.hits--;
                }
            }
        //both sides take hits
            takeCasualties(f, s.hits)

            takeCasualties(s, f.hits)

        //post combat card effects
            if (s.weCome) {
                s.postDice = Math.min(5, s.elites);
                s.postHits = getRoll(s.postDice, 0, 5);
                takeCasualties(f, s.postHits);
            }
            if (s.greatHost) {
                if (s.regulars + s.elites >= 2 * (f.regulars + f.elites)) {
                    takeCasualties(f, 1);
                }
            }
            if (s.onslaught > 0) {
                for (let i = 0; i < s.onslaught && s.regulars + s.elites > 0; i++) {
                    takeCasualties(s, 1);
                    if (Math.random() > 0.5) {
                        takeCasualties(f, 1);
                    }
                }
            }

        //check for victory
            info.combatRounds++;
            info.hitsFree += f.preHit + f.hits;
            info.hitsShadow += s.preHit + s.hits + s.postHits;

            if (s.elites <= 0 && s.regulars <= 0 && f.elites <= 0 && f.regulars <= 0) {
                info.ties++;
                combatOver = true;
            } else {
                if (f.elites <= 0 && f.regulars <= 0) {
                    info.shadowWins++;
                    info.remainingHPShadow += s.elites + s.regulars;
                    combatOver = true;
                } else {
                    if (s.elites <= 0 && s.regulars <= 0) {
                        info.freeWins++;
                        info.remainingHPFree += f.elites + f.regulars;
                        combatOver = true;
                    }

                    //press or use a dice
                    if (press && s.elites > 0) {
                        s.elites--;
                        s.regulars++;
                        info.presses++;
                    } else {
                        info.diceUsed++;
                        //HERE add dice!

                    }
                }

            }
            firstTurn = false; //why do i track this if i track turn number...?
        }

    }
    printInfo();
    printEndResults();
    printWarnings();
} //run 'step' number of combats and report winrates and gathered info

function printEndResults() {
    document.getElementById("fwr").innerText = "Free Winrate: " + Math.round(info.freeWins/info.total * 10000) / 100 + "%";
    document.getElementById("swr").innerText = "Shadow Winrate: " + Math.round(info.shadowWins/info.total * 10000) / 100 + "%";
    document.getElementById("twr").innerText = "Draw (No Capture): " + Math.round(info.ties/info.total * 10000) / 100 + "%";
} //publish winrates to HTML

function printWarnings() {
    getWarnings();
    document.getElementById("warnings").innerText = "";
    for (let i = 0; i < warnings.length; i++) {
        document.getElementById("warnings").innerText = document.getElementById("warnings").innerText + warnings[i] + "\n";
    }
} //publish warnings to HTML

function getWarnings() {
    warnings = [];

    if (shadow.stronghold && (shadow.city || free.city || free.stronghold)) {
        warnings.push("Check your city/stronghold settings!");
    } else
    if (shadow.city && (shadow.stronghold || free.city || free.stronghold)) {
        warnings.push("Check your city/stronghold settings!");
    } else
    if (free.stronghold && (free.city || shadow.city || shadow.stronghold)) {
        warnings.push("Check your city/stronghold settings!");
    } else
    if (free.city && (free.stronghold || shadow.city || shadow.stronghold)) {
        warnings.push("Check your city/stronghold settings!");
    }

    if (free.regulars + free.elites > 10) {
        warnings.push("Free violates army size restrictions.")
    }
    if (shadow.regulars + shadow.elites > 10) {
        warnings.push("Shadow violates army size restrictions.")
    }
    if (free.regulars + free.elites > 5 && free.stronghold) {
        warnings.push("Free violates stronghold army size restrictions.")
    }
    if (shadow.regulars + shadow.elites > 5 && shadow.stronghold) {
        warnings.push("Shadow violates stronghold army size restrictions.")
    }

} //check for bad starting conditions

function takeCasualties(side, amount) {
    while (amount > 0) {
        //kill regular if more than 5 units and has regular

        //kill elite if more than 5 and no regular

        //kill regular if 5 or fewer units and has 0 elites

        //downgrade elite if 5 or fewer units and more than 1 elite

        //TO-DO: Should downgrading an elite be an option if dice is an issue?

        if (side.regulars + side.elites > 5) {
            if (side.regulars > 0) {
                side.regulars--;
            } else {
                side.elites--;
                side.regulars++;
            }
        } else {
            if (side.elites > 0) {
                side.elites--;
                side.regulars++;
            } else {
                side.regulars--;
            }
        }
        amount--;
    }
} //unrefined logic TO DO



//card arrays are poorly planned. Array slot 0 not in use, starts with 1 in combat :)
let freeCards = ["No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card",]
let shadowCards = ["No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card","No Card",]
function setCard(index, player, cardName) {
    if (player === "free") {
        freeCards.splice(index, 1, cardName);
    } else {
        shadowCards.splice(index, 1, cardName);
    }

    document.getElementById("shadow1").innerText = shadowCards[1];

    document.getElementById("free1").innerText = freeCards[1];


    document.getElementById("shadow2").innerText = shadowCards[2];

    document.getElementById("free2").innerText = freeCards[2];

    document.getElementById("shadow3").innerText = shadowCards[3];

    document.getElementById("free3").innerText = freeCards[3];

} //buttons use this function to modify array

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        let i;
        for (i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

//utility functions
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRoll(numDice, bonus, target) {
    let result = 0;
    let rolls = [];
    for (let i = 0; i < numDice; i++) {
        let roll = getRandomInt(6) + 1;
        rolls.push(roll);
        if (roll === 1) {
            confusionOnes++;
        }
        if (roll + bonus >= target) {
            result++;
        }
    }
    return result;
}

function round(number, places) {
    return Math.round(number * places) / places;
}


var slider = document.getElementById("myRange");
var output = document.getElementById("steps");

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    steps = this.value * this.value;
    output.innerHTML = "Steps: " + Math.round(steps);
}
