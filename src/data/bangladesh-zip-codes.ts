// data/bangladesh-zip-codes.ts
// Source: Bangladesh Postal Service (BPS) district postal code ranges
// All Bangladesh postal codes are exactly 4 digits (1000–9999)

import { BangladeshDistricts } from './bangladesh-districts'

/** A range of valid postal codes [min, max] (inclusive) */
type PostalRange = [number, number]

/** Map of district → list of valid postal code ranges */
export const BANGLADESH_ZIP_RANGES: Record<BangladeshDistricts, PostalRange[]> = {
  [BangladeshDistricts.BAGERHAT]:        [[9300, 9399]],
  [BangladeshDistricts.BANDARBAN]:       [[4600, 4699]],
  [BangladeshDistricts.BARGUNA]:         [[8700, 8799]],
  [BangladeshDistricts.BARISAL]:         [[8200, 8299]],
  [BangladeshDistricts.BHOLA]:           [[8300, 8399]],
  [BangladeshDistricts.BOGURA]:          [[5800, 5899]],
  [BangladeshDistricts.BRAHMANBARIA]:    [[3400, 3499]],
  [BangladeshDistricts.CHANDPUR]:        [[3600, 3699]],
  [BangladeshDistricts.CHAPAINAWABGANJ]: [[6300, 6399]],
  [BangladeshDistricts.CHATTOGRAM]:      [[4000, 4399]],
  [BangladeshDistricts.CHUADANGA]:       [[7200, 7299]],
  [BangladeshDistricts.COMILLA]:         [[3500, 3599]],
  [BangladeshDistricts.COX_BAZAR]:       [[4700, 4799]],
  [BangladeshDistricts.DHAKA]:           [[1000, 1399]],
  [BangladeshDistricts.DINAJPUR]:        [[5200, 5299]],
  [BangladeshDistricts.FARIDPUR]:        [[7800, 7899]],
  [BangladeshDistricts.FENI]:            [[3900, 3999]],
  [BangladeshDistricts.GAIBANDHA]:       [[5700, 5799]],
  [BangladeshDistricts.GAZIPUR]:         [[1700, 1799]],
  [BangladeshDistricts.GOPALGANJ]:       [[8100, 8199]],
  [BangladeshDistricts.HABIGANJ]:        [[3300, 3399]],
  [BangladeshDistricts.JAMALPUR]:        [[2000, 2099]],
  [BangladeshDistricts.JASHORE]:         [[7400, 7499]],
  [BangladeshDistricts.JHALOKATI]:       [[8600, 8699]],
  [BangladeshDistricts.JHENAIDAH]:       [[7300, 7399]],
  [BangladeshDistricts.JOYPURHAT]:       [[5900, 5999]],
  [BangladeshDistricts.KHAGRACHHARI]:    [[4400, 4499]],
  [BangladeshDistricts.KHULNA]:          [[9000, 9299]],
  [BangladeshDistricts.KISHOREGANJ]:     [[2300, 2399]],
  [BangladeshDistricts.KURIGRAM]:        [[5600, 5699]],
  [BangladeshDistricts.KUSHTIA]:         [[7000, 7099]],
  [BangladeshDistricts.LAKSHMIPUR]:      [[3700, 3799]],
  [BangladeshDistricts.LALMONIRHAT]:     [[5500, 5599]],
  [BangladeshDistricts.MADARIPUR]:       [[7900, 7999]],
  [BangladeshDistricts.MAGURA]:          [[7600, 7699]],
  [BangladeshDistricts.MANIKGANJ]:       [[1800, 1899]],
  [BangladeshDistricts.MEHERPUR]:        [[7100, 7199]],
  [BangladeshDistricts.MOULVIBAZAR]:     [[3200, 3299]],
  [BangladeshDistricts.MUNSHIGANJ]:      [[1500, 1599]],
  [BangladeshDistricts.MYMENSINGH]:      [[2200, 2299]],
  [BangladeshDistricts.NAOGAON]:         [[6400, 6499]],
  [BangladeshDistricts.NARAIL]:          [[7500, 7599]],
  [BangladeshDistricts.NARAYANGANJ]:     [[1400, 1499]],
  [BangladeshDistricts.NARSINGDI]:       [[1600, 1699]],
  [BangladeshDistricts.NATORE]:          [[6700, 6799]],
  [BangladeshDistricts.NAWABGANJ]:       [[6300, 6399]],
  [BangladeshDistricts.NETRAKONA]:       [[2400, 2499]],
  [BangladeshDistricts.NILPHAMARI]:      [[5300, 5399]],
  [BangladeshDistricts.NOAKHALI]:        [[3800, 3899]],
  [BangladeshDistricts.PABNA]:           [[6600, 6699]],
  [BangladeshDistricts.PANCHAGARH]:      [[5000, 5099]],
  [BangladeshDistricts.PATUAKHALI]:      [[8400, 8499]],
  [BangladeshDistricts.PIROJPUR]:        [[8500, 8599]],
  [BangladeshDistricts.RAJBARI]:         [[7700, 7799]],
  [BangladeshDistricts.RAJSHAHI]:        [[6000, 6199]],
  [BangladeshDistricts.RANGAMATI]:       [[4500, 4599]],
  [BangladeshDistricts.RANGPUR]:         [[5400, 5499]],
  [BangladeshDistricts.SATKHIRA]:        [[9400, 9499]],
  [BangladeshDistricts.SHARIATPUR]:      [[8000, 8099]],
  [BangladeshDistricts.SHERPUR]:         [[2100, 2199]],
  [BangladeshDistricts.SIRAJGANJ]:       [[6800, 6899]],
  [BangladeshDistricts.SUNAMGANJ]:       [[3100, 3199]],
  [BangladeshDistricts.SYLHET]:          [[3000, 3099]],
  [BangladeshDistricts.TANGAIL]:         [[1900, 1999]],
  [BangladeshDistricts.THAKURGAON]:      [[5100, 5199]],
}

/**
 * All valid Bangladesh postal code ranges flattened into a single list.
 * Used to validate any postal code without requiring a specific district.
 */
const ALL_RANGES: PostalRange[] = Object.values(BANGLADESH_ZIP_RANGES).flat()

/**
 * Returns `true` if `zip` is a valid Bangladesh 4-digit postal code.
 *
 * Rules:
 *  - Must be exactly 4 digits (no letters, spaces, or special chars)
 *  - Must fall within at least one known Bangladesh district postal range
 */
export function isValidBangladeshZip(zip: string): boolean {
  if (!/^\d{4}$/.test(zip)) return false
  const code = parseInt(zip, 10)
  return ALL_RANGES.some(([min, max]) => code >= min && code <= max)
}

/**
 * Reverse-lookup: returns the district name(s) matching a given postal code,
 * or an empty array if none found.
 */
export function getDistrictByZip(zip: string): BangladeshDistricts[] {
  if (!/^\d{4}$/.test(zip)) return []
  const code = parseInt(zip, 10)
  return (Object.entries(BANGLADESH_ZIP_RANGES) as [BangladeshDistricts, PostalRange[]][])
    .filter(([, ranges]) => ranges.some(([min, max]) => code >= min && code <= max))
    .map(([district]) => district)
}
