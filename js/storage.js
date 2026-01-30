// TuxMate Storage - LocalStorage persistence
// Handles saving/loading selections, named presets, and auto-save

const STORAGE_KEYS = {
    DISTRO: 'tuxmate_distro',
    APPS: 'tuxmate_apps',
    HELPER: 'tuxmate_helper',
    HAS_HELPER: 'tuxmate_has_helper',
    PRESETS: 'tuxmate_presets',
    LAST_USED: 'tuxmate_last_used',
    INCLUDE_FLATPAK_APPS: 'tuxmate_include_flatpak_apps',
};

const Storage = {
    // Get saved distro
    getDistro() {
        try {
            return localStorage.getItem(STORAGE_KEYS.DISTRO) || 'ubuntu';
        } catch {
            return 'ubuntu';
        }
    },

    // Save distro
    saveDistro(distroId) {
        try {
            localStorage.setItem(STORAGE_KEYS.DISTRO, distroId);
        } catch {}
    },

    // Get saved apps (as array of app IDs)
    getApps() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.APPS);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    },

    // Save apps
    saveApps(appIds) {
        try {
            localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify([...appIds]));
        } catch {}
    },

    // Get helper (yay or paru)
    getHelper() {
        try {
            return localStorage.getItem(STORAGE_KEYS.HELPER) || 'yay';
        } catch {
            return 'yay';
        }
    },

    // Save helper
    saveHelper(helper) {
        try {
            localStorage.setItem(STORAGE_KEYS.HELPER, helper);
        } catch {}
    },

    // Get has helper installed
    getHasHelper() {
        try {
            return localStorage.getItem(STORAGE_KEYS.HAS_HELPER) === 'true';
        } catch {
            return false;
        }
    },

    // Save has helper
    saveHasHelper(has) {
        try {
            localStorage.setItem(STORAGE_KEYS.HAS_HELPER, has.toString());
        } catch {}
    },

    // Get include flatpak apps setting (default: true)
    getIncludeFlatpakApps() {
        try {
            const value = localStorage.getItem(STORAGE_KEYS.INCLUDE_FLATPAK_APPS);
            // Default to true if not set
            if (value === null) return true;
            return value === 'true';
        } catch {
            return true;
        }
    },

    // Save include flatpak apps setting
    saveIncludeFlatpakApps(include) {
        try {
            localStorage.setItem(STORAGE_KEYS.INCLUDE_FLATPAK_APPS, include.toString());
        } catch {}
    },

    // Get all presets
    getPresets() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.PRESETS);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    },

    // Save all presets
    savePresets(presets) {
        try {
            localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
        } catch {}
    },

    // Save a named preset
    savePreset(name, data) {
        const presets = this.getPresets();
        presets[name] = {
            ...data,
            savedAt: new Date().toISOString(),
        };
        this.savePresets(presets);
    },

    // Load a preset by name
    loadPreset(name) {
        const presets = this.getPresets();
        return presets[name] || null;
    },

    // Delete a preset
    deletePreset(name) {
        const presets = this.getPresets();
        delete presets[name];
        this.savePresets(presets);
    },

    // Get preset names
    getPresetNames() {
        const presets = this.getPresets();
        return Object.keys(presets);
    },

    // Auto-save current state as "Last Used"
    autoSave(state) {
        this.savePreset('Last Used', state);
        // Also save to individual keys for quick access
        this.saveDistro(state.distro);
        this.saveApps(state.apps);
        this.saveHelper(state.helper || 'yay');
        this.saveHasHelper(state.hasHelper || false);
        this.saveIncludeFlatpakApps(state.includeFlatpakApps !== undefined ? state.includeFlatpakApps : true);
    },

    // Load "Last Used" on startup
    loadLastUsed() {
        const preset = this.loadPreset('Last Used');
        if (preset) {
            return {
                distro: preset.distro || this.getDistro(),
                apps: preset.apps || this.getApps(),
                helper: preset.helper || this.getHelper(),
                hasHelper: preset.hasHelper || this.getHasHelper(),
                includeFlatpakApps: preset.includeFlatpakApps || this.getIncludeFlatpakApps(),
            };
        }
        // Fallback to individual keys
        return {
            distro: this.getDistro(),
            apps: this.getApps(),
            helper: this.getHelper(),
            hasHelper: this.getHasHelper(),
            includeFlatpakApps: this.getIncludeFlatpakApps(),
        };
    },

    // Export current selection as JSON string
    exportSelection(state) {
        const exportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            distro: state.distro,
            apps: state.apps,
            helper: state.helper,
            hasHelper: state.hasHelper,
            includeFlatpakApps: state.includeFlatpakApps,
        };
        return JSON.stringify(exportData, null, 2);
    },

    // Import selection from JSON string
    importSelection(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.apps || !Array.isArray(data.apps)) {
                throw new Error('Invalid format: apps array required');
            }
            return {
                distro: data.distro || 'ubuntu',
                apps: data.apps,
                helper: data.helper || 'yay',
                hasHelper: data.hasHelper || false,
                includeFlatpakApps: data.includeFlatpakApps !== undefined ? data.includeFlatpakApps : true,
            };
        } catch (e) {
            console.error('Import failed:', e);
            return null;
        }
    },

    // Clear all storage
    clearAll() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch {}
    },
};
