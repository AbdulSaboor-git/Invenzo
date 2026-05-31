/**
 * Canonical unit names used throughout the codebase.
 * Always import from here — never hard-code unit strings inline.
 *
 * BUG-01 fix: the POS page was using 'liter' (American) while the sales API
 * and dashboard used 'litre' (British), causing the weight/volume quantity
 * normalisation to silently fail.  'litre' is now the single canonical form.
 */

/** Units where a "base unit" is 1 gram / 1 ml, so display quantity = stored / 1000 */
export const WEIGHT_VOLUME_UNITS = ['kg', 'litre'];

/**
 * Returns true when a product unit is sold / stored in its sub-unit
 * (grams for kg, millilitres for litre) and must be divided by 1000
 * before multiplying by the per-kg/per-litre purchase price.
 */
export function isWeightVolumeUnit(unit) {
  return WEIGHT_VOLUME_UNITS.includes(unit);
}

/**
 * Normalise a stored quantity to its "display" unit.
 * e.g. 1000 g → 1 kg, 500 ml → 0.5 litre
 */
export function normaliseQuantity(quantity, unit) {
  return isWeightVolumeUnit(unit) ? quantity / 1000 : quantity;
}
