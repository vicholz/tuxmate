// TuxMate Data Loader
// Loads data from data.json and provides helper functions

// Data will be populated when JSON is loaded
let distros = [];
let categories = [];
let categoryColors = {};
let apps = [];
let aurPatterns = [];
let knownAurPackages = new Set();

// Icon URL generators using Iconify API
const IconHelper = {
    si: (name, color) => `https://api.iconify.design/simple-icons/${name}.svg${color ? `?color=${encodeURIComponent(color)}` : ''}`,
    lo: (name) => `https://api.iconify.design/logos/${name}.svg`,
    mdi: (name, color) => `https://api.iconify.design/mdi/${name}.svg${color ? `?color=${encodeURIComponent(color)}` : ''}`,
    vs: (name) => `https://api.iconify.design/vscode-icons/${name}.svg`,
};

// Generate icon URL from icon name and optional color
function getIconUrl(iconName, color) {
    if (!iconName) return '';
    
    // Special cases for specific icons
    const iconMappings = {
        'chromium': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Chromium_Logo.svg',
        'vesktop': 'https://avatars.githubusercontent.com/u/113042587?s=200&v=4',
        'strawberry': 'https://www.strawberrymusicplayer.org/pictures/strawberry64.png',
        'meld': 'https://meldmerge.org/images/meld.svg',
        'inkscape': 'https://media.inkscape.org/static/images/inkscape-logo.svg',
        'darktable': 'https://www.svgrepo.com/show/378112/darktable.svg',
        'prismlauncher': 'https://raw.githubusercontent.com/PrismLauncher/PrismLauncher/develop/program_info/org.prismlauncher.PrismLauncher.logo.svg',
        'veracrypt': 'https://raw.githubusercontent.com/PapirusDevelopmentTeam/papirus-icon-theme/3390a630b535d1c1ccca04881b3959e262264116/Papirus/64x64/apps/veracrypt.svg',
        'bleachbit': 'https://raw.githubusercontent.com/chocolatey-community/chocolatey-packages/782707302851e7935c4a5a3e48e27140c774fa78/icons/bleachbit.svg',
        'flameshot': 'https://raw.githubusercontent.com/flameshot-org/flameshot/master/data/img/app/flameshot.svg',
        'zathura': 'https://raw.githubusercontent.com/TrixieUA/MoreWaita-copr-trixieua/e5bed029d63d4c14f1aba811152f3f0bf473a4bc/scalable/apps/zathura.svg',
        'nmap': 'https://raw.githubusercontent.com/bwks/vendor-icons-svg/702f2ac88acc71759ce623bc5000a596195e9db3/nmap-logo.svg',
        'gamemode': 'https://www.svgrepo.com/show/411187/game.svg',
        'firejail': 'https://linux.fi/w/images/1/1f/Firejail-logo.png',
        'clamav': 'https://raw.githubusercontent.com/ivangabriele/clamav-desktop/f60bfafdd23bb455f0468abe5f877d2b76eddfba/assets/icons/icon.svg',
    };
    
    if (iconMappings[iconName]) {
        return iconMappings[iconName];
    }
    
    // MDI icons (Material Design Icons)
    const mdiIcons = [
        'dna', 'api', 'hexadecimal', 'cat', 'ghost', 'ghost-outline', 'monitor', 'monitor-dashboard',
        'chart-bar', 'console', 'list', 'format-list-bulleted', 'file-code', 'file-code-outline',
        'magnify', 'text-search', 'folder-move', 'folder-move-outline', 'book', 'book-open-page-variant-outline',
        'download', 'download-multiple', 'folder-table', 'folder-table-outline', 'folder-key', 'folder-key-outline',
        'chart-arc', 'file-search', 'file-search-outline', 'view-split', 'view-split-vertical', 'sync',
        'video', 'video-vintage', 'controller', 'dock-window', 'backup', 'backup-restore', 'cloud-sync', 'ssh',
        'folder-multiple', 'printer-3d-nozzle', 'download-box', 'progress-download'
    ];
    
    if (mdiIcons.includes(iconName)) {
        return IconHelper.mdi(iconName, color);
    }
    
    // Logos icons
    const logoIcons = ['chrome', 'bun', 'npm', 'pnpm', 'yarn', 'visual-studio-code'];
    if (logoIcons.includes(iconName)) {
        return IconHelper.lo(iconName);
    }
    
    // VS Code icons
    const vsIcons = ['file-type-shell', 'file-type-cmake', 'file-type-pdf2'];
    if (vsIcons.includes(iconName) || iconName.startsWith('file-type-')) {
        return IconHelper.vs(iconName);
    }
    
    // Default to simple-icons
    return IconHelper.si(iconName, color);
}

// Load data from JSON file
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Failed to load data.json: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Populate global variables
        distros = data.distros.map(d => ({
            ...d,
            iconUrl: getIconUrl(d.icon, d.color)
        }));
        
        categories = data.categories;
        categoryColors = data.categoryColors;
        aurPatterns = data.aurPatterns;
        knownAurPackages = new Set(data.knownAurPackages);
        
        // Process apps to add icon URLs
        apps = data.apps.map(app => ({
            ...app,
            iconUrl: getIconUrl(app.icon, categoryColors[app.category])
        }));
        
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        return false;
    }
}

// Check if package is from AUR
function isAurPackage(packageName) {
    if (knownAurPackages.has(packageName)) return true;
    return aurPatterns.some(pattern => packageName.endsWith(pattern));
}

// Get apps by category
function getAppsByCategory(category) {
    return apps.filter(app => app.category === category);
}

// Check if app is available for distro
function isAppAvailable(app, distroId) {
    return distroId in app.targets;
}

// Get distro by ID
function getDistroById(distroId) {
    return distros.find(d => d.id === distroId);
}
