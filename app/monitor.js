exports.characterInfo = async page => {
    return await page.evaluate(() => {
        setInterval(() => {
            if (character) {
                var inventory = `${character.items.filter(item => !!item).length}/${character.items.length}`;
                var xp = `${((character.xp * 100) / character.max_xp).toFixed(2)}%`;
                var target = Object.values(entities).filter(ent => ent.id == character.target)[0];
                window.nb_logInfo(`Name: ${character.name} / Inventory: ${inventory} / XP: ${xp} / Gold: ${character.gold} / Map: ${character.map} / Target: ${target ? target.name : "none"} / ${character.rip ? "Dead" : "Alive"}`);
            }
        }, 1000 * 10);
    });
};

exports.isDead = async page => {
    return await page.evaluate(() => {
        var nb_dead = false;
        setInterval(() => {
            if (character && character.rip && !nb_dead) {
                nb_dead = true;
                setTimeout(function() {
                    nb_dead = false;
                    window.nb_logInfo(`Warning: ${character.name} you DEAD!`);
                }, 1000 * 12);
            }
        }, 1000);
    });
};

exports.runCode = async page => {
    return await page.evaluate(() => {
        setInterval(() => {
            if (actual_code && code_run) {
                window.nb_logInfo(`${character.name} running code...`);
            } else {
                window.nb_logInfo(`Warning: ${character.name} stopped code!`);
            }
        }, 1000 * 60);
    });
};