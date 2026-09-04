import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (rel) => JSON.parse(await fs.readFile(path.join(root, rel), 'utf8'));

const CATEGORIES = [
    'Web Browsers',
    'Communication',
    'Media',
    'Gaming',
    'Office',
    'Creative',
    'System',
    'File Sharing',
    'Security',
    'VPN & Network',
    'Dev: Editors',
    'Dev: Languages',
    'Dev: Tools',
    'Terminal',
    'CLI Tools',
    'AI Tools',
];

const CATEGORY_COLORS = {
    'Web Browsers': '#f97316',
    'Communication': '#3b82f6',
    'Media': '#eab308',
    'Gaming': '#a855f7',
    'Office': '#6366f1',
    'Creative': '#06b6d4',
    'System': '#ef4444',
    'File Sharing': '#14b8a6',
    'Security': '#22c55e',
    'VPN & Network': '#10b981',
    'Dev: Editors': '#0ea5e9',
    'Dev: Languages': '#f43f5e',
    'Dev: Tools': '#64748b',
    'Terminal': '#71717a',
    'CLI Tools': '#6b7280',
    'AI Tools': '#d946ef',
};

const CATEGORY_FILES = {
    'Web Browsers': 'src/lib/apps/web-browsers.json',
    'Communication': 'src/lib/apps/communication.json',
    'Media': 'src/lib/apps/media.json',
    'Gaming': 'src/lib/apps/gaming.json',
    'Office': 'src/lib/apps/office.json',
    'Creative': 'src/lib/apps/creative.json',
    'System': 'src/lib/apps/system.json',
    'File Sharing': 'src/lib/apps/file-sharing.json',
    'Security': 'src/lib/apps/security.json',
    'VPN & Network': 'src/lib/apps/vpn-network.json',
    'Dev: Editors': 'src/lib/apps/dev-editors.json',
    'Dev: Languages': 'src/lib/apps/dev-languages.json',
    'Dev: Tools': 'src/lib/apps/dev-tools.json',
    'Terminal': 'src/lib/apps/terminal.json',
    'CLI Tools': 'src/lib/apps/cli-tools.json',
    'AI Tools': 'src/lib/apps/ai-tools.json',
};

const DISTROS = [
    { id: 'ubuntu', name: 'Ubuntu', icon: 'ubuntu', color: '#E95420', installPrefix: 'sudo apt install -y' },
    { id: 'debian', name: 'Debian', icon: 'debian', color: '#A81D33', installPrefix: 'sudo apt install -y' },
    { id: 'arch', name: 'Arch', icon: 'archlinux', color: '#1793D1', installPrefix: 'sudo pacman -S --needed --noconfirm' },
    { id: 'fedora', name: 'Fedora', icon: 'fedora', color: '#51A2DA', installPrefix: 'sudo dnf install -y' },
    { id: 'opensuse', name: 'OpenSUSE', icon: 'opensuse', color: '#73BA25', installPrefix: 'sudo zypper install -y' },
    { id: 'nix', name: 'Nix', icon: 'nixos', color: '#5277C3', installPrefix: 'nix-env -iA nixpkgs.' },
    { id: 'flatpak', name: 'Flatpak', icon: 'flatpak', color: '#4A90D9', installPrefix: 'flatpak install flathub -y' },
    { id: 'snap', name: 'Snap', icon: 'snapcraft', color: '#82BEA0', installPrefix: 'sudo snap install' },
    { id: 'homebrew', name: 'Homebrew', icon: 'homebrew', color: '#FBB040', installPrefix: 'brew install' },
];

const apps = [];
for (const category of CATEGORIES) {
    const file = CATEGORY_FILES[category];
    const categoryApps = await readJson(file);
    for (const app of categoryApps) {
        apps.push(app);
    }
}

const aur = await readJson('src/lib/aur-packages.json');
const nixUnfree = await readJson('src/lib/nix-unfree.json');
const verifiedFlatpaks = await readJson('src/lib/verified-flatpaks.json');
const verifiedSnaps = await readJson('src/lib/verified-snaps.json');

const data = {
    distros: DISTROS,
    categories: CATEGORIES,
    categoryColors: CATEGORY_COLORS,
    aurPatterns: ['-bin', '-git', '-appimage'],
    knownAurPackages: aur.packages,
    nixUnfreePackages: nixUnfree.packages,
    verifiedFlatpaks: verifiedFlatpaks.apps,
    verifiedSnaps: verifiedSnaps.apps,
    apps,
};

const json = `${JSON.stringify(data, null, 2)}\n`;
await fs.writeFile(path.join(root, 'data.json'), json);
await fs.writeFile(path.join(root, 'web/data.json'), json);

console.log(`Wrote data.json with ${apps.length} apps across ${CATEGORIES.length} categories`);
