exports.characterInfo = async page => {
    setInterval(() => {
        page.evaluate(() => {
            if (character) {
                var inventory = `${character.items.filter(item => !!item).length}/${character.items.length}`;
                var xp = `${((character.xp * 100) / character.max_xp).toFixed(2)}%`;
                var target = Object.values(entities).filter(ent => ent.id == character.target)[0];
                window.nb_logInfo(`Name: ${character.name} / Inventory: ${inventory} / XP: ${xp} / Gold: ${character.gold} / Map: ${character.map} / Target: ${target ? target.name : "none"} / ${character.rip ? "Dead" : "Alive"}`);
            }
        });
    }, 1000 * 10);
};

exports.isDead = async page => {
    setInterval(async () => {
        let rip = await page.evaluate(() => character && character.rip);
        if (rip && character) {
            page.evaluate(() => {
                setTimeout(function() {
                    window.nb_logInfo(`Warning: ${character.name} you DEAD!`);
                }, 1000 * 12);
            });
        }
    }, 1000 * 10);
};

exports.runCode = async page => {
    setInterval(() => {
        page.evaluate(() => {
            if (actual_code && code_run && character) {
                window.nb_logInfo(`${character.name} running code...`);
            } else {
                window.nb_logInfo(`Warning: ${character.name} stopped code!`);
            }
        });
    }, 1000 * 60);
};