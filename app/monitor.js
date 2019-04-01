exports.characterInfo = async page => {
  return await page.evaluate(() =>
    setInterval(() => {
      if (character) {
        var inventory = `${character.items.filter(item => !!item).length}/${
          character.items.length
        }`;
        var xp = `${((character.xp * 100) / character.max_xp).toFixed(2)}%`;
        window.nb_logInfo(
          `Inventory: ${inventory} / XP: ${xp} / Gold: ${
            character.gold
          } / Map: ${character.map} / Target: ${character.target}`
        );
      }
    }, 1000 * 10)
  );
};
