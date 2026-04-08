// Persistent player data — coins, skins, ad-free status

const KEY_COINS = 'stairs-coins';
const KEY_SKIN = 'stairs-skin';
const KEY_AD_FREE = 'stairs-ad-free';
const KEY_BEST = 'stairs-best';
const KEY_BEST_COMBO = 'stairs-best-combo';

export interface SkinDef {
  id: string;
  name: string;
  price: number;          // 0 = free (default)
  palette: { bg: number; fg: number }[];
  markColor: number;
}

export const SKINS: SkinDef[] = [
  {
    id: 'classic',
    name: 'Classic',
    price: 0,
    palette: [
      { bg: 0x7c6cf0, fg: 0x6c5ce7 },
      { bg: 0x1e96f0, fg: 0x0984e3 },
      { bg: 0x10c9a3, fg: 0x00b894 },
      { bg: 0xf08850, fg: 0xe17055 },
      { bg: 0xe84040, fg: 0xd63031 },
      { bg: 0xf558a0, fg: 0xe84393 },
      { bg: 0x10ddd8, fg: 0x00cec9 },
      { bg: 0xffd56e, fg: 0xfdcb6e },
    ],
    markColor: 0xff4757,
  },
  {
    id: 'neon',
    name: 'Neon',
    price: 200,
    palette: [
      { bg: 0x39ff14, fg: 0x20cc00 },
      { bg: 0x00fff5, fg: 0x00ccbb },
      { bg: 0xff073a, fg: 0xcc0030 },
      { bg: 0xfef65b, fg: 0xd4cc40 },
      { bg: 0xff6ec7, fg: 0xcc58a0 },
      { bg: 0x7b68ee, fg: 0x6050cc },
      { bg: 0xff4500, fg: 0xcc3800 },
      { bg: 0x00bfff, fg: 0x009acc },
    ],
    markColor: 0x39ff14,
  },
  {
    id: 'pastel',
    name: 'Pastel',
    price: 150,
    palette: [
      { bg: 0xffb3ba, fg: 0xf09aa0 },
      { bg: 0xbae1ff, fg: 0x9ec8e8 },
      { bg: 0xbaffc9, fg: 0x9ee8b0 },
      { bg: 0xffffba, fg: 0xe8e8a0 },
      { bg: 0xe8baff, fg: 0xd0a0e8 },
      { bg: 0xffdfba, fg: 0xe8c8a0 },
      { bg: 0xbaffee, fg: 0xa0e8d6 },
      { bg: 0xffd1dc, fg: 0xe8bac6 },
    ],
    markColor: 0xff6b81,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    price: 300,
    palette: [
      { bg: 0x2c3e50, fg: 0x1a252f },
      { bg: 0x34495e, fg: 0x222e3a },
      { bg: 0x445566, fg: 0x303d4a },
      { bg: 0x556677, fg: 0x3d4d5c },
      { bg: 0x3d566e, fg: 0x2a3d50 },
      { bg: 0x4a6580, fg: 0x344a60 },
      { bg: 0x2c4a6e, fg: 0x1a3450 },
      { bg: 0x395068, fg: 0x263a50 },
    ],
    markColor: 0xe74c3c,
  },
  {
    id: 'candy',
    name: 'Candy',
    price: 250,
    palette: [
      { bg: 0xff6fd8, fg: 0xe060c0 },
      { bg: 0xff9a76, fg: 0xe08060 },
      { bg: 0xfeca57, fg: 0xe0b040 },
      { bg: 0x48dbfb, fg: 0x30c0e0 },
      { bg: 0xff9ff3, fg: 0xe080d8 },
      { bg: 0x54a0ff, fg: 0x4088e0 },
      { bg: 0x5f27cd, fg: 0x4a1ea8 },
      { bg: 0x01a3a4, fg: 0x008888 },
    ],
    markColor: 0xff4757,
  },
];

export const store = {
  getCoins(): number {
    return Number(localStorage.getItem(KEY_COINS) || '0');
  },
  addCoins(n: number) {
    localStorage.setItem(KEY_COINS, String(this.getCoins() + n));
  },
  spendCoins(n: number): boolean {
    const c = this.getCoins();
    if (c < n) return false;
    localStorage.setItem(KEY_COINS, String(c - n));
    return true;
  },

  getCurrentSkin(): SkinDef {
    const id = localStorage.getItem(KEY_SKIN) || 'classic';
    return SKINS.find(s => s.id === id) || SKINS[0];
  },
  setSkin(id: string) {
    localStorage.setItem(KEY_SKIN, id);
  },
  getOwnedSkins(): string[] {
    const raw = localStorage.getItem('stairs-owned-skins');
    const owned = raw ? JSON.parse(raw) as string[] : ['classic'];
    return owned;
  },
  buySkin(id: string): boolean {
    const skin = SKINS.find(s => s.id === id);
    if (!skin) return false;
    if (this.getOwnedSkins().includes(id)) return false;
    if (!this.spendCoins(skin.price)) return false;
    const owned = this.getOwnedSkins();
    owned.push(id);
    localStorage.setItem('stairs-owned-skins', JSON.stringify(owned));
    return true;
  },

  // ---- Block Themes ----
  getCurrentTheme(): string {
    return localStorage.getItem('stairs-block-theme') || 'building';
  },
  setTheme(id: string) {
    localStorage.setItem('stairs-block-theme', id);
  },
  getOwnedThemes(): string[] {
    const raw = localStorage.getItem('stairs-owned-themes');
    return raw ? JSON.parse(raw) as string[] : ['building'];
  },
  buyTheme(id: string, price: number): boolean {
    if (this.getOwnedThemes().includes(id)) return false;
    if (!this.spendCoins(price)) return false;
    const owned = this.getOwnedThemes();
    owned.push(id);
    localStorage.setItem('stairs-owned-themes', JSON.stringify(owned));
    return true;
  },

  isAdFree(): boolean {
    return localStorage.getItem(KEY_AD_FREE) === '1';
  },
  setAdFree() {
    localStorage.setItem(KEY_AD_FREE, '1');
  },

  getBest(): number {
    return Number(localStorage.getItem(KEY_BEST) || '0');
  },
  setBest(n: number) {
    localStorage.setItem(KEY_BEST, String(n));
  },
  getBestCombo(): number {
    return Number(localStorage.getItem(KEY_BEST_COMBO) || '0');
  },
  setBestCombo(n: number) {
    localStorage.setItem(KEY_BEST_COMBO, String(n));
  },
};
