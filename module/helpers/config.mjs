export const TALUS_PNP = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
TALUS_PNP.abilities = {
  "ath": "TALUS_PNP.AbilityAth",
  "dex": "TALUS_PNP.AbilityDex",
  "kno": "TALUS_PNP.AbilityKno",
  "wil": "TALUS_PNP.AbilityWil",
  "cha": "TALUS_PNP.AbilityCha",
  "emp": "TALUS_PNP.AbilityEmp"
};

TALUS_PNP.abilityAbbreviations = {
  "ath": "TALUS_PNP.AbilityAthAbbr",
  "dex": "TALUS_PNP.AbilityDexAbbr",
  "kno": "TALUS_PNP.AbilityKnoAbbr",
  "wil": "TALUS_PNP.AbilityWilAbbr",
  "cha": "TALUS_PNP.AbilityChaAbbr",
  "emp": "TALUS_PNP.AbilityEmpAbbr"
};

TALUS_PNP.covens = [ "runic", "water", "fire", "earth", "air", "brew", "herbs", "tarot" ];

TALUS_PNP.covenAttributes = {
  runic: {
    label: "TALUS_PNP.CovensRunic",
    img: "icons/svg/item-bag.svg",
    description: "TALUS_PNP.CovensRunicDescription",
    color: "orange",
    order: 0,
    probability: 1
  },
  water: {
    label: "TALUS_PNP.CovensWater",
    img: "icons/svg/item-bag.svg",
    description: "TALUS_PNP.CovensWaterDescription",
    color: "blue",
    order: 1,
    probability: 5
  },
  fire: {
    label: "TALUS_PNP.CovensFire",
    img: "icons/svg/item-bag.svg",
    description: "TALUS_PNP.CovensFireDescription",
    color: "red",
    order: 2,
    probability: 5
  },
  earth: {
    label: "TALUS_PNP.CovensEarth",
    img: "icons/svg/item-bag.svg",
    description: "TALUS_PNP.CovensEarthDescription",
    color: "green",
    order: 3,
    probability: 5
  },
  air: {
    label: "TALUS_PNP.CovensAir",
    img: "icons/svg/item-bag.svg",
    description: "TALUS_PNP.CovensAirDescription",
    color: "yellow",
    order: 4,
    probability: 5
  },
  brew: {
    label: "TALUS_PNP.CovensBrew",
    img: "icons/svg/item-bag.svg",
    description: "TALUS_PNP.CovensBrewDescription",
    color: "brown",
    order: 5,
    probability: 19
  },
  herbs: {
    label: "TALUS_PNP.CovensHerbs",
    img: "icons/svg/item-bag.svg",
    description: "TALUS_PNP.CovensHerbsDescription",
    color: "white",
    order: 6,
    probability: 30
  },
  tarot: {
    label: "TALUS_PNP.CovensTarot",
    img: "icons/svg/item-bag.svg",
    description: "TALUS_PNP.CovensTarotDescription",
    color: "purple",
    order: 7,
    probability: 30
  }
}

TALUS_PNP.consequenceKinds = {
  physical: {
    label: "TALUS_PNP.ConsequenceKindPhysical",
    labelAddConsequences: "TALUS_PNP.ConsequencePhysicalAdd",
    class: "consequence-physical",
    defaultImage: "icons/skills/wounds/bone-broken-knee-beam.webp"
  },
  mental: {
    label: "TALUS_PNP.ConsequenceKindMental",
    labelAddConsequences: "TALUS_PNP.ConsequenceMentalAdd",
    class: "consequence-mental",
    defaultImage: "icons/skills/wounds/injury-face-impact-orange.webp"
  },
  social: {
    label: "TALUS_PNP.ConsequenceKindSocial",
    labelAddConsequences: "TALUS_PNP.ConsequenceSocialAdd",
    class: "consequence-social",
    defaultImage: "icons/skills/movement/figure-running-gray.webp",
  },
}
