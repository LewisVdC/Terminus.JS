import { events } from "./lib/events.js";
import { Terminal } from "./lib/terminal.js";
import { sleep, spawn } from "./lib/helpers.js";
import { Achievement } from "./lib/achievements.js";
// import "./logi/skills.js"; // this is heavily broken rn, TODO: change this to use class (like achievements)

// 0.1.0
// Rando stops committing to dev

function greetMessage() {
    let date = new Date();
    if (randomnumbah(0, 10000) == 1) {
        return "Unwelcome to AntiTerminus.";
    } else if (date.getMonth() == 0 && getDate() == 1) {
        return "Happy New Year! Welcome to Terminus.";
    } else if (date.getMonth() == 8 && date.getDate() == 15) {
        return `It's Terminus.JS anniversary! Welcome!`;
    }
    return "Welcome to Terminus.JS";
}

// Wow, fancy! :)
spawn(async () => {
    await sleep(1000);
    terminal.log(greetMessage());
    await sleep(2000);
    terminal.log("You can type 'help' to see available commands");
    await sleep(2000);
});

//The object for determining how many points you make from any given update.

let game = events({
    terminal: new Terminal(document.body.querySelector("#terminal")),
    gameverison: "0.1.0",
    unlocks: events({
        begin: false,
        index: false,
        doctype: false,
        configyml: false,
        infshop: false,
    }),
    enemies: events({
        enemypoints: 0,
        gamblefactor: 1.5,
        enabled: true,
        difficulty: 0.5,
        encounterchance: 10,
    }),
    misc: events({ // I do not know why i called this misc, just shove random shtuff here.
        cantaffordskill: "You need more skill points.",
        needparentskill: "Unlock the previous skill first.",
    }),
    skillpoints: 0,
    xp: 0,
    incombat: false,
    pointcalcstatus: false,
    infstage: 0,
    points: 0,
    steponeadd: 0,
    steptwomult: 1,
    stepthreemult: 1,
    stepfouradd: 1,
    basegain: 1,
    upgradebonus: 1,
    upgpriceboost: 0,
    upgstage: 0,
    updateloop: 1,
    power: 10,
    powerpoints: 1, //Hahah PP
    indebted: 1,
    difficulty: 1,
    maxbattery: 15,
    rechargerate: 1,
    antipower: 10,
    itemduration: 0,
    totalencounters: 0,
    pointcalc: () => {
        game.pointcalcstatus = false;
        game.points += (game.basegain +
            game.steponeadd * game.steptwomult *
                game.stepthreemult +
            game.stepfouradd * game.powerpoints) /
            game.difficulty;
        if (game.itemduration > 0) {
            game.itemduration -= 1;
            game.points *= game.itemmult;
        }
    },
});
const dangerlevel = randomnumbah(game.enemies.difficulty, game.enemies.difficulty * 10)
/** @type {Terminal} */
const terminal = game.terminal;

terminal.addCommand(function hints(force = -1) {
    const list = [
        "You can generate points by calling update.",
        "Power mult = power / 10",
        "help can update its contents based on the things you have purchased.",
        "You can change your difficulty by calling difficultyset(number)", //BROKEN
        "You can get more hints by calling hints.",
        "Run 'fullscreen' to be able to, well, play in fullscreen. Call again to exit."
        //TODO: Re add clear() to new terminal.
    ];
    if (force >= 0) return terminal.log(list[force]);
    terminal.log(list[Math.floor(Math.random() * list.length)]);
});

terminal.addCommand(function achievements() {
    terminal.log(Achievement.all());
});

terminal.addCommand(function github() {
    terminal.log("https://github.com/rando-idiot/Terminus.JS");
});

terminal.addCommand(function credits() {
    [
        "Developer: @rando.idiot on discord.",
        "Major contributor: @.bleb1k on discord.",
        "Check us out!",
    ].forEach((str) => terminal.log(str));
});

terminal.addCommand(function discord() {
    [
        "You can find me and other people who either hate this game or enjoy it here:",
        "Discord.gg/kYyEQ2hjPs",
    ].forEach((str) => terminal.log(str));
});
terminal.addCommand(function fullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    console.log("Toggled fullscreen.")
  }
  );
const DEBUG_MODE = false;
if (DEBUG_MODE) {
    const debug = [
        //The reason to make this a constant is so i can just organize all of this into one thing. Please do not change.
        terminal.addCommand(function setpoints(number) {
            game.points = number;
        }),
        terminal.addCommand(function chooseunlock(bool) {
            if (!typeof bool === "boolean") return;
            game.unlocks.begin = bool;
            game.unlocks.index = bool;
            game.unlocks.doctype = bool;
            game.unlocks.configyml = bool;
            game.unlocks.infshop = bool;
        }),
        terminal.addCommand(function dumpgame() {
            terminal.log(game)
            console.log(game)
        }),
    ];
}

game.points$onChange((points) => {
    terminal.log(`You have ${points.toFixed(2)} points.`);
    if (!game.indebted && points < 0) {
        game.indebted = true;
    } else if (game.indebted && points > 0) {
        game.indebted = false;
    }
});

game.indebted$on(true, () => {
    terminal.log("You are in debt.");
});
game.indebted$on(false, () => {
    terminal.log("You got out of debt.");
});


terminal.addCommand(function run() {
    if (game.enemies.incombat === false) {
        terminal.log("You arent in combat?????");
    } else {
        let lostmoney = game.points / 10;
        game.enemies.incombat = false;
        game.points = game.points - lostmoney;
        terminal.log("You fled. Cost ", lostmoney);
    }
});

terminal.addCommand(function fight() {
    if (game.incombat === false) {
        terminal.log("You are not in combat.");
    } else {
        let foo = game.dangerlevel / game.enemies.difficulty; // why have so much variables representing attack chance
        if (randomnumbah(0, foo) === foo) {
            game.points = game.enemies.enemypoints * 0.5;
            terminal.log("You won!");
        } else {
            terminal.log("You lost.");
            game.points = game.enemies.difficulty * game.points;
        }
    }
    game.incombat = false;
});

terminal.addCommand(function roam() {
    let encounteredenemy = randomnumbah(0, game.enemies.encounterchance); // your random number generator is integer based
    let founditem = randomnumbah(0, itemkey.totalitems); // lists count from zero
    if (founditem === itemkey.totalitems) {
        itemkey.helditem = founditem;
        terminal.log("woag you found item"); //omg you foundies itemer
        if (founditem === 1) {
            terminal.log("You found " + itemkey.itemid1.name);
            terminal.log("'" + itemkey.itemid1);
        }
        if (founditem === 2) {
            terminal.log("You found " + itemkey.itemid2.name);
            terminal.log("'" + itemkey.itemid2);
        }
        if (founditem === 3) {
            terminal.log("You found " + itemkey.itemid3.name);
            terminal.log("'" + itemkey.itemid3);
        }
    }
    if (encounteredenemy === 1) {
        game.enemies.enemypoints = game.points / randomnumbah(0, 4);
        terminal.log("You have encountered an enemy!");
        terminal.log("The enemy points are: ", game.enemies.enemypoints);
        terminal.log(
            "You can either use 'fight' or 'flee' to determine how you want to act.",
        );
    }
});

let itemkey = {
    encounterchance: 10,
    helditem: 0,
    totalitems: 3,
    itemid0: {
        name: "N/A",
        description: "This is not an item",
    },
    itemid1: {
        name: "Battery",
        description: "Refills battery",
    },
    itemid2: {
        name: "Get Rich Quick!",
        description: "Gain 2 updates worth of points",
    },
    itemid3: {
        name: "MultBox",
        description: "Gain *2 points per update() for 3 updates()",
    },
}; // whyyyyyyyyyyyy //Rando - Because why not :333333

function randomnumbah(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

terminal.addCommand(function useheld() {
    if (itemkey.helditem === 0) {
        terminal.log("You aren't holding anything.");
    } else if (itemkey.helditem === 1) {
        terminal.log("Used ", itemkey.itemid1.name);
        game.power = game.maxbattery;
    } else if (itemkey.helditem === 2) {
        terminal.log("Used ", itemkey.itemid2.name);
        game.points = game.pointcalc();
        game.pointcalcstatus = true;
    } else if (itemkey.helditem === 3) {
        terminal.log("Used ", itemkey.itemid3.name);
        game.itemduration = 3;
        game.itemmult = 2;
    }
});

terminal.addCommand(function help() {
    const list = [
        "help\n- Shows this.",
        "shop\n- Shows the available purchasable items.",
        "update\n- Increases points. Equivalent of clicking in a clicker game.",
        "charge\n- Gain power.",
        "difficultyset(number)\n- Change your difficulty.",
        "github\n- Shows the github repo link.",
        "credits\n- Shows the credits.",
        "discord\n- Gives a link to the terminus.js discord.",
        "hints\n- Shows a hint.",
        "achievements\n- Shows achievements.",
    ];

    if (game.unlocks.infshop) {
        list.push("infshop\n- Shows infinitley purchasable items.");
    }

    if (DEBUG_MODE) list.push("pointsset(set)....Sets your points.");
    terminal.log(...list);
});
// help();

terminal.addCommand(function difficultyset(number) {
    game.difficulty = number;
    terminal.log(`Set difficulty to ${number}`);
    terminal.log(
        "Can be changed at any time, but you wouldn't do that, would you?",
    );
});

game.power$onChange((power) => {
    if (game.power == game.maxbattery) {
        return terminal.log("Full charge.");
    }
    terminal.log("Current battery: " + game.power);
});
terminal.addCommand(function charge() {
    if (game.power < game.maxbattery) {
        game.power = game.power + game.rechargerate;
    }
});

const exptolevel = 100;
terminal.addCommand(function update() {
    if (game.power <= 0) {
        game.xp = game.xp + 10;
        terminal.log("Gained 10 exp.");
        if (game.xp == exptolevel) {
            game.skillpoints = game.skillpoints + 1;
            terminal.log("Leveled up!");
        }
        return;
    }

    game.powerpoints = game.power / game.antipower;
    game.power -= 1;

    game.pointcalc();
});

terminal.addCommand(function shop() {
    terminal.log(...[
        "begin: $5.........The beginning",
        "index: $20........index.html",
        "doctype: $50......<!DOCTYPE HTML>",
        "configyml: $100...config.yml",
        game.upgstage === 0
            ? "push: $500........git push 1"
            : game.upgstage === 1
            ? "push: $5000.......git push 2"
            : game.upgstage === 2
            ? "push: $50000......git push 3"
            : "push: $???........git push ?",
    ]);
});

game.unlocks.begin$on(true, () => {
    game.basegain = 10;
    game.points -= 5 * game.difficulty;
    terminal.log("Began!");
});
terminal.addCommand(function begin() {
    if (game.indebted) return terminal.log("Cannot afford!");
    game.unlocks.begin = true;
    terminal.changeCommand(function begin() {
        terminal.log("You already began.");
    });
});

game.unlocks.index$on(true, () => {
    game.steptwomult += 0.5;
    game.points -= 20 * game.difficulty;
    terminal.log("Created index.html!");
});
terminal.addCommand(function index() {
    if (game.indebted) return terminal.log("Cannot afford!");
    game.unlocks.index = true;
    terminal.changeCommand(function index() {
        terminal.log("You already created index.html");
    });
});

game.unlocks.doctype$on(true, () => {
    game.stepthreemult += 0.5;
    game.points -= 50 * game.difficulty;
    terminal.log("Added <!DOCTYPE HTML>!\n");
});
terminal.addCommand(function doctype() {
    if (game.indebted) return terminal.log("Cannot afford!");
    game.unlocks.doctype = true;
    terminal.changeCommand(function doctype() {
        terminal.log(
            "You- YOU ALREADY ADDED <!DOCTYPE HTML> YOU DONT NEED TO PUT IT EVERY TIME YOU ADD <BODY> STOP PLEASE",
        );
    });
});

game.unlocks.configyml$on(true, () => {
    game.stepfourmult *= 2;
    game.points -= 100 * game.difficulty;
    terminal.log("Created config.yml!");
});
terminal.addCommand(function configyml() {
    if (game.indebted) return terminal.log("Cannot afford!");
    game.unlocks.configyml = true;
    terminal.changeCommand(function configyml() {
        terminal.log("You already created config.yml");
    });
});

game.upgstage$on(1, () =>
    terminal.changeCommand(function push() {
        if (game.indebted) return "Come back when you're a little bit richer";

        game.upgstage = 2;
        game.points -= 5000 * game.difficulty;
    }));
game.upgstage$on(2, () =>
    terminal.changeCommand(function push() {
        if (game.indebted) return "Come back when you're a little bit richer";

        game.upgstage = 3;
        game.points -= 50000 * game.difficulty;
        return `You have ${game.points} points`;
    }));
game.upgstage$on(3, () =>
    terminal.changeCommand(function push3() {
        terminal.log("Please don't try this again, it's not funny");
    }));
terminal.addCommand(function push() {
    if (game.indebted) {
        return terminal.log("you are brokies :3");
    }

    game.unlocks.infshop = true;
    game.upgstage = 1;
    game.points -= 500 * game.difficulty;
});

game.unlocks.infshop$on(true, () => {
    terminal.log("You've unlocked the infshop. Check 'help' for details.");
    terminal.changeCommand(function infshop() {
        let list = game.upgstage === 1
            ? [ // todo: Export cost calculations
                `stepone: $${
                    5 + game.upgpriceboost * game.difficulty
                }\nIncreases step 1 addition`,
                `steptwo: $${
                    25 + game.upgpriceboost * game.difficulty
                }\nIncreases step 2 multiplier`,
                `stepthree: $${
                    25 + game.upgpriceboost * game.difficulty
                }\nIncreases step 3 multiplier`,
                `stepfour: $${
                    2 + game.upgpriceboost * game.difficulty
                }\nIncreases step 4 addition`,
            ]
            : [
                `stepone: $${
                    20 + game.upgpriceboost * game.difficulty
                }\nIncreases step 1 addition`,
                `steptwo: $${
                    100 + game.upgpriceboost * game.difficulty
                }\nIncreases step 2 multiplier`,
                `stepthree: $${
                    100 + game.upgpriceboost * game.difficulty
                }\nIncreases step 3 multiplier`,
                `stepfour: $${
                    8 + game.upgpriceboost * game.difficulty
                }\nIncreases step 4 addition`,
                `maxpowerup: $${
                    800 + game.upgpriceboost * game.difficulty
                }\nIncreases the maximum battery.`,
            ];

        list = [
            `Stage ${game.upgstage} upgrades`,
            ...list,
            `baseup: $${
                500 + game.upgpriceboost * game.difficulty
            }\nIncreases the base that is then multiplied etc etc`,
            `upgbonus: $${
                100 + game.upgpriceboost * game.difficulty
            }\nIncreases how much upgrades upgrade stuff OTHER THAN ITSELF.`,
            `helloworld: $0\nPrints 'Hello world!' in terminal.`,
        ];


        terminal.log(...list);
    });
});

terminal.addCommand(function infshop() {
    terminal.log("You have not unlocked infinite upgrades.");
});

game.upgstage$on(1, () => {
    terminal.changeCommand(function stepone() {
        if (game.indebted) {
            return terminal.log("You don't have enough money");
        }

        game.points -= 5 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.steponeadd += game.upgradebonus;
        game.upgpriceboost += 5;

        terminal.log("purchased stepone;");
    });

    terminal.changeCommand(function steptwo() {
        if (game.indebted) return terminal.log("You don't have enough money");

        game.points -= 25 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.steptwomult += game.upgradebonus;
        game.upgpriceboost += 5;

        terminal.log("purchased steptwo;");
    });

    terminal.changeCommand(function stepthree() {
        if (game.indebted) return terminal.log("You don't have enough money");

        game.points -= 25 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.stepthreemult += game.upgradebonus;
        game.upgpriceboost += 5;

        terminal.log("purchased stepthree;");
    });

    terminal.changeCommand(function stepfour() {
        if (game.indebted) return terminal.log("You don't have enough money");

        game.points -= 2 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.stepfouradd += game.upgradebonus;
        game.upgpriceboost += 5;

        terminal.log("purchased stepfour;");
    });

    terminal.changeCommand(function baseup() {
        if (game.indebted) return terminal.log("You don't have enough money");

        game.points -= 500 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.basegain += game.upgradebonus;
        game.upgpriceboost += 5;

        terminal.log("purchased baseup;");
    });

    terminal.changeCommand(function upgbonus() {
        if (game.indebted) {
            return terminal.log("You don't have enough money");
        }

        game.points -= 100 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.upgradebonus += 0.1;
        game.upgpriceboost += 5;

        terminal.log("purchased upgradebonus;");
    });
});

game.upgstage$on(2, () => {
    terminal.changeCommand(function stepone() {
        if (game.indebted) {
            return terminal.log("You don't have enough money");
        }

        game.points -= 20 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.steponeadd += game.upgradebonus;
        game.upgpriceboost += 5;

        terminal.log("purchased stepone;");
    });

    terminal.changeCommand(function steptwo() {
        if (game.indebted) {
            return terminal.log("You don't have enough money");
        }

        game.points -= 100 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.steptwomult += game.upgradebonus;
        game.upgpriceboost += 5;

        terminal.log("purchased steptwo;");
    });

    terminal.changeCommand(function stepthree() {
        if (game.indebted) {
            return terminal.log("You don't have enough money");
        }

        game.points -= 100 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.stepthreemult += game.upgradebonus;
        game.upgpriceboost += 5;

        terminal.log("purchased stepthree;");
    });

    terminal.changeCommand(function stepfour() {
        if (game.indebted) {
            return terminal.log("You don't have enough money");
        }

        game.points -= 8 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.stepfouradd += game.upgradebonus;
        game.upgpriceboost += 5;

        terminal.log("purchased stepfour;");
    });
    terminal.changeCommand(function maxpowerup() {
        if (game.indebted) {
            return terminal.log("You don't have enough money");
        }

        game.points -= 800 +
            game.upgpriceboost * game.upgpriceboost * game.difficulty;
        game.stepfouradd += game.upgradebonus;
        game.maxbattery += 5;

        terminal.log("purchased maxpowerup;");
    });
});

terminal.addCommand(function stepone() {
    return terminal.log("You have not unlocked infinite upgrades.");
});
terminal.addCommand(function steptwo() {
    return terminal.log("You have not unlocked infinite upgrades.");
});
terminal.addCommand(function stepthree() {
    return terminal.log("You have not unlocked infinite upgrades.");
});
terminal.addCommand(function stepfour() {
    return terminal.log("You have not unlocked infinite upgrades.");
});
terminal.addCommand(function baseup() {
    return terminal.log("You have not unlocked infinite upgrades.");
});
terminal.addCommand(function upgbonus() {
    return terminal.log("You have not unlocked infinite upgrades.");
});
terminal.addCommand(function maxpowerup() {
    return terminal.log("You have not leveled up enough");
});

terminal.addCommand(function helloworld() {
    terminal.log("Hello world!");
});

Achievement.init({ terminal });

const start = new Achievement({
    name: "Well, it's a start.",
    description: "Earn your first point.",
    eventValueSubscription: game.points$subscription(),
    criteria: (p) => p >= 1,
    action: () => {},
});
const brokeass = new Achievement({
    name: "Broke ass",
    description: "Collect 100 points.",
    requirements: [start],
    eventValueSubscription: game.points$subscription(),
    criteria: (p) => p >= 100,
    action: () => {},
});
const momentum = new Achievement({
    name: "Momentum",
    description: "Collect 1000 points.",
    requirements: [brokeass],
    eventValueSubscription: game.points$subscription(),
    criteria: (p) => p >= 1000,
    action: () => {},
});
const outage = new Achievement({
    name: "Outage",
    description: "Spend all power.",
    eventValueSubscription: game.power$subscription(),
    criteria: (p) => p <= 0,
    action: () => {
        terminal.log("To recharge power, use 'charge'.");
    },
});
const fullbattery = new Achievement({
    name: "Full battery",
    description: "Reach full power.",
    eventValueSubscription: game.power$subscription(),
    criteria: (p) => p === game.maxbattery,
    action: () => {},
});
const overcharged = new Achievement({
    name: "Overcharged",
    description: "Get a power value over the default maximum.",
    eventValueSubscription: game.power$subscription(),
    criteria: (p) => p > 15, // default maximum
    action: () => {},
});
const fighter = new Achievement({
    name: "The Fighter",
    description: "Engage in combat",
    eventValueSubscription: game.totalencounters$subscription(),
    criteria: (p) => p >= 1,
    action: () => {},
});

const fighter2 = new Achievement({
    name: "Combat enjoyer",
    description: "Engage in combat, but, a lot more.",
    eventValueSubscription: game.totalencounters$subscription(),
    criteria: (p) => p >= 10,
    action: () => {},
});

//:3
