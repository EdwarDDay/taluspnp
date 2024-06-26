import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import {TalusRoll} from "../helpers/talus-roll.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class TalusPNPActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["taluspnp", "sheet", "actor"],
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "consequence" }]
    });
  }

  /** @override */
  get template() {
    return `systems/taluspnp/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareWitchDefaults(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc-witch') {
      this._prepareItems(context);
      this._prepareWitchDefaults(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc-without-abilities') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    const generalAbilityImprovement = context.system.attributes.xp.value >= 6;
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.TALUS_PNP.abilities[k]) ?? k;
      v.disableImprovement = !generalAbilityImprovement || v.value >= 6;
    }
  }

  /**
     * Organize and classify defaults for Character sheets.
     *
     * @param {Object} context The actor to prepare.
     *
     * @return {undefined}
     */
  _prepareWitchDefaults(context) {
    context.covens = CONFIG.TALUS_PNP.covens;
    context.covenAttributes = CONFIG.TALUS_PNP.covenAttributes;

    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.TALUS_PNP.abilities[k]) ?? k;
    }
    context.system.leftAbilities = {
      ath: context.system.abilities.ath,
      dex: context.system.abilities.dex,
      kno: context.system.abilities.kno,
    };
    context.system.rightAbilities = {
      wil: context.system.abilities.wil,
      cha: context.system.abilities.cha,
      emp: context.system.abilities.emp,
    };
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} context The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const people = [];
    let nextConsequence = 1;
    const consequences = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }

      // Append to features.
      else if (i.type === 'person') {
        people.push(i);
      }
      // Append to consequences.
      else if (i.type === 'consequence') {
        if (i.system.kind != undefined && nextConsequence < 7) {
          const consequence = Object.assign({}, i);
          consequence.kind = CONFIG.TALUS_PNP.consequenceKinds[i.system.kind];
          consequences[nextConsequence++] = consequence;
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.people = people;
    context.consequences = consequences;
    context.consequenceKinds = CONFIG.TALUS_PNP.consequenceKinds;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.find('.ability-change').click(this._onAbilityChange.bind(this));

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.implementation.create(itemData, {parent: this.actor});
  }

  async _onAbilityChange(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.action == "inc") {
      if (await this.actor.increaseAbility(dataset.ability)) {
        this.render(false);
      }
    } else if (dataset.action == "dec") {
      if (await this.actor.decreaseAbility(dataset.ability)) {
        this.render(false);
      }
    }
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @return {Promise}
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      const abilityTag = game.i18n.localize("TALUS_PNP.AbilityTag")
      let label = dataset.label ? `[${abilityTag}] ${dataset.label}` : '';
      let roll = new TalusRoll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
}
