import { doc, getDoc, setDoc } from "@/lib/supabase-client";

export interface Settings {
  blockedCardBins: string[];
  allowedCountries: string[];
}

const SETTINGS_DOC_ID = "app_settings";

export async function getSettings(): Promise<Settings> {
  try {
    const snapshot = await getDoc(doc("settings", SETTINGS_DOC_ID));
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        blockedCardBins: data.blockedCardBins || [],
        allowedCountries: data.allowedCountries || [],
      };
    }
    const defaults = { blockedCardBins: [], allowedCountries: [] };
    await setDoc(doc("settings", SETTINGS_DOC_ID), defaults);
    return defaults;
  } catch (error) {
    console.error("[Supabase] Error getting settings:", error);
    return { blockedCardBins: [], allowedCountries: [] };
  }
}

export async function updateBlockedCardBins(blockedCardBins: string[]) {
  await setDoc(doc("settings", SETTINGS_DOC_ID), { blockedCardBins });
}

export async function addBlockedCardBin(bin: string) {
  const settings = await getSettings();
  if (!settings.blockedCardBins.includes(bin)) {
    await updateBlockedCardBins([...settings.blockedCardBins, bin]);
  }
}

export async function removeBlockedCardBin(bin: string) {
  const settings = await getSettings();
  await updateBlockedCardBins(settings.blockedCardBins.filter((item) => item !== bin));
}

export async function updateAllowedCountries(allowedCountries: string[]) {
  await setDoc(doc("settings", SETTINGS_DOC_ID), { allowedCountries });
}

export async function addAllowedCountry(country: string) {
  const settings = await getSettings();
  const normalized = country.toUpperCase();
  if (!settings.allowedCountries.includes(normalized)) {
    await updateAllowedCountries([...settings.allowedCountries, normalized]);
  }
}

export async function removeAllowedCountry(country: string) {
  const settings = await getSettings();
  const normalized = country.toUpperCase();
  await updateAllowedCountries(settings.allowedCountries.filter((item) => item !== normalized));
}

export async function _icb(cardNumber: string) {
  const settings = await getSettings();
  return settings.blockedCardBins.includes(cardNumber.replace(/\s/g, "").substring(0, 4));
}

export async function isCountryAllowed(countryCode: string) {
  const settings = await getSettings();
  return settings.allowedCountries.length === 0 ||
    settings.allowedCountries.includes(countryCode.toUpperCase());
}
