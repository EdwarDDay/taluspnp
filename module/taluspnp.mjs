// Import document classes.
import { TalusPNPActor } from "./documents/actor.mjs";
import { TalusPNPItem } from "./documents/item.mjs";
// Import sheet classes.
import { TalusPNPActorSheet } from "./sheets/actor-sheet.mjs";
import { TalusPNPItemSheet } from "./sheets/item-sheet.mjs";
// roll
import { TalusRoll } from "./helpers/talus-roll.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { TALUS_PNP } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.taluspnp = {
    TalusPNPActor,
    TalusPNPItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.TALUS_PNP = TALUS_PNP;

  // Define custom Document classes
  CONFIG.Actor.documentClass = TalusPNPActor;
  CONFIG.Item.documentClass = TalusPNPItem;
  CONFIG.Dice.rolls.push(TalusRoll);

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("taluspnp", TalusPNPActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("taluspnp", TalusPNPItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  createIncreaseXpMacro();
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.taluspnp.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "taluspnp.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}

function createIncreaseXpMacro() {
  game.createIncreaseXpDialog = async function () {
    const actors = game.actors.filter(a => a.type == 'character');
    const contentHtml = await renderTemplate('systems/taluspnp/templates/hud/increaseXp.html', {actors: actors});
    const dialog = new Dialog({
      title: game.i18n.localize("TALUS_PNP.DialogIncreaseXpTitle"),
      content: contentHtml,
      buttons: {
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("TALUS_PNP.DialogIncreaseXpButtonCancel")
        },
        increase: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("TALUS_PNP.DialogIncreaseXpTitle"),
          callback: (target, event) => {
            const t = new FormDataExtended(target[0].querySelector("form")).object;
            if (typeof(t.increase) === "number") {
              const validIds = [];
              for (let [k,v] of Object.entries(t)) {
                if (k.startsWith("id.") && v) validIds.push(k.substring(3));
              }
              if (validIds.length > 0) {
                game.actors.updateAll(actor => ({ 'system.attributes.xp.value': Math.max(actor.system.attributes.xp.value + t.increase, 0)}), (actor) => validIds.includes(actor.id));
              }
            }
          }
        }
      },
      default: "increase"
    });
    dialog.render(true);
  }
}
