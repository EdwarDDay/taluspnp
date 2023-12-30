/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/taluspnp/templates/actor/parts/actor-abilities-direct-input.html",
    "systems/taluspnp/templates/actor/parts/actor-abilities.html",
    "systems/taluspnp/templates/actor/parts/actor-consequences.html",
    "systems/taluspnp/templates/actor/parts/actor-coven.html",
    "systems/taluspnp/templates/actor/parts/actor-items.html",
    "systems/taluspnp/templates/actor/parts/actor-person.html",
  ]);
};
