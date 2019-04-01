exports.characterInfo = async page => {
    return await page.evaluate(() =>
        setInterval(() => {
            if (character) {
                var inventory = `${character.items.filter(item => !!item).length}/${character.items.length}`;
                var xp = `${((character.xp * 100) / character.max_xp).toFixed(2)}%`;
                var target = Object.values(entities).filter(ent => ent.target == character.name)[0];
                window.nb_logInfo(`Inventory: ${inventory} / XP: ${xp} / Gold: ${character.gold} / Map: ${character.map} / Target: ${target ? target.name : "none"}`);
            }
        }, 1000 * 10)
    );
};