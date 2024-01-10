/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class TalusPNPActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() { // TODO localize link title, change ROBOTO font, add witch character icons
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
  if (this.type !== 'character') return;
    const systemData = actorData.system;

    this._calculateHealth(systemData);

    this._calculateXP(systemData);
  }

  _calculateHealth(systemData) {
    const consequences = this.items.reduce((acc, item) => acc + (item.type === 'consequence' ? 1 : 0), 0);

    systemData.health = {
      value: 6 - consequences,
      min: 0,
      max: 6
    }
  }

  _calculateXP(systemData) {
    const level = Math.floor(systemData.attributes.xp.value / 6);
    const initialLevelDone = Object.values(systemData.abilities).reduce((acc, ability) => acc + ability.value, 0) >= 6;
    systemData.attributes.xp.initialLevelDone = initialLevelDone;

    for (let [k, v] of Object.entries(systemData.abilities)) {
      v.increasable = level > 0 && (initialLevelDone || v.value < 3) && v.value < 6;
      v.decreasable = v.value > 0;
    }
  }

  async increaseAbility(ability) {
    if (ability && this.system.abilities[ability] && this.system.abilities[ability].increasable) {
      await this.update({
        'system.attributes.xp.value': this.system.attributes.xp.value - 6,
        [`system.abilities.${ability}.value`]: this.system.abilities[ability].value + 1
      });
      return true;
    } else {
      return false;
    }
  }

  async decreaseAbility(ability) {
    if (ability && this.system.abilities[ability] && this.system.abilities[ability].decreasable) {
      await this.update({
        'system.attributes.xp.value': this.system.attributes.xp.value + 6,
        [`system.abilities.${ability}.value`]: this.system.abilities[ability].value - 1
      });
      return true;
    } else {
      return false;
    }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (!actorData.type.startsWith("npc-")) return;

    const systemData = actorData.system;

    this._calculateHealth(systemData);
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.value + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.xp) {
      data.xp = data.attributes.xp.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc-witch') return;

    // Process additional NPC data here.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
  }
}
