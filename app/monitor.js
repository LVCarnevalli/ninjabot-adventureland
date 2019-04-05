exports.characterInfo = async page => {
  page.evaluate(() => {
    setInterval(() => {
      if (window["character"]) {
        var inventory = `${character.items.filter(item => !!item).length}/${
          character.items.length
        }`;
        var xp = `${((character.xp * 100) / character.max_xp).toFixed(2)}%`;
        var target = Object.values(entities).filter(
          ent => ent.id == character.target
        )[0];
        window.nb_logMonitor(
          `Name: ${
            character.name
          } / Inventory: ${inventory} / XP: ${xp} / Gold: ${
            character.gold
          } / Map: ${character.map} / Target: ${
            target ? target.name : "none"
          } / ${character.rip ? "Dead" : "Alive"}`
        );
      }
    }, 1000 * 10);
  });
};

exports.runCode = async page => {
  page.evaluate(() => {
    setInterval(() => {
      if (window["character"]) {
        if (window["actual_code"] && window["code_run"]) {
          window.nb_logMonitor(`${character.name} running code...`);
        } else {
          window.nb_logMonitor(`Warning: ${character.name} stopped code!`);
        }
      }
    }, 1000 * 60);
  });
};
