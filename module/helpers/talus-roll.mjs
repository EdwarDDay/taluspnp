
export class TalusRoll extends Roll {
  constructor(formula, data, options) {
    super(formula, data, options);
  }

  async render({isPrivate=false}={}) {
    return await super.render(await this._talusArgs(isPrivate));
  }

  async _talusArgs(isPrivate) {
    const dice = this.dice;
    if (dice.length == 1 && dice[0].number == 3 && dice[0].faces == 6) {
      if ( !this._evaluated ) await this.evaluate({async: true});
      const talusDie = this.dice[0].values[0];
      let templateDice = "2-5";
      switch (talusDie) {
        case 1:
          templateDice = "1";
          break;
        case 6:
          templateDice = "6";
          break;
      }
      return {
        template: "systems/taluspnp/templates/dice/talus-" + templateDice + ".html",
        flavor: talusDie,
        isPrivate: isPrivate,
      };
    } else {
      return {
        isPrivate: isPrivate,
      };
    }
  }
}
