// TuxMate Command Generation
// Generates install commands for different distros

const CommandGenerator = {
    // Generate multi-line command format
    // e.g., apt install -y \
    //       pkg1 \
    //       pkg2
    generateMultiLine(prefix, packages) {
        if (packages.length === 0) return '# No packages selected';
        if (packages.length === 1) return `${prefix} ${packages[0]}`;
        
        return `${prefix} \\\n  ${packages.join(' \\\n  ')}`;
    },

    // Generate flatpak install command (includes repo setup)
    generateFlatpakInstallCommand() {
        return 'sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo';
    },

    // Get flatpak install command for packages
    generateFlatpakCommand(packages, includeRepoSetup = false) {
        const pkgs = packages.map(p => p.pkg || p);
        let cmd = '';
        
        if (includeRepoSetup) {
            cmd = this.generateFlatpakInstallCommand() + '\n';
        }
        
        if (pkgs.length === 0) return cmd + '# No flatpak packages selected';
        
        // Use multi-line format similar to apt
        cmd += this.generateMultiLine('flatpak install flathub -y', pkgs);
        
        return cmd;
    },

    // Generate command for a distro
    generate(distroId, selectedApps, options = {}) {
        const { helper = 'yay', hasHelper = false } = options;
        
        // Check if flatpaksupport is selected (enables Flatpak app installation)
        const flatpakSelected = selectedApps.includes('flatpaksupport');
        
        // Get packages for selected apps
        const packages = [];
        const flatpakPackages = [];
        
        selectedApps.forEach(appId => {
            const app = apps.find(a => a.id === appId);
            if (!app) return;
            
            const pkg = app.targets[distroId];
            if (pkg) {
                // Native package for this distro
                packages.push(pkg);
            } else if (flatpakSelected && app.targets.flatpak) {
                // Flatpak-only app (only if flatpak package is selected)
                flatpakPackages.push(app.targets.flatpak);
            }
        });

        if (packages.length === 0 && flatpakPackages.length === 0) {
            return '# Select apps above to generate command';
        }

        let command = '';
        const distro = getDistroById(distroId);

        switch (distroId) {
            case 'ubuntu':
            case 'debian':
                if (packages.length > 0) {
                    command = this.generateMultiLine('sudo apt install -y', packages);
                }
                break;

            case 'arch':
                if (packages.length > 0) {
                    if (this.hasAurPackages(packages)) {
                        if (!hasHelper) {
                            // Install helper first
                            const helperInstall = this.generateHelperInstall(helper);
                            command = helperInstall + ' && \\\n' + 
                                this.generateMultiLine(`${helper} -S --needed --noconfirm`, packages);
                        } else {
                            command = this.generateMultiLine(`${helper} -S --needed --noconfirm`, packages);
                        }
                    } else {
                        command = this.generateMultiLine('sudo pacman -S --needed --noconfirm', packages);
                    }
                }
                break;

            case 'fedora':
                if (packages.length > 0) {
                    command = this.generateMultiLine('sudo dnf install -y', packages);
                }
                break;

            case 'opensuse':
                if (packages.length > 0) {
                    command = this.generateMultiLine('sudo zypper install -y', packages);
                }
                break;

            case 'nix':
                return this.generateNixConfig(packages);

            case 'flatpak':
                return this.generateFlatpakCommand(packages, true);

            case 'snap':
                return this.generateSnapCommand(packages);

            case 'homebrew':
                return this.generateHomebrewCommand(packages);

            default:
                if (packages.length > 0) {
                    command = this.generateMultiLine('# Install:', packages);
                }
        }

        // Add Flatpak apps if flatpak is selected and there are Flatpak-only apps
        if (flatpakPackages.length > 0 && flatpakSelected && distroId !== 'flatpak') {
            // Add Flathub repo and install Flatpak apps
            const flatpakCmd = this.generateFlatpakCommand(flatpakPackages, true);
            
            if (command) {
                command += '\n\n# Install Flatpak apps:\n' + flatpakCmd;
            } else {
                command = '# Install Flatpak apps:\n' + flatpakCmd;
            }
        }

        return command || '# No packages selected';
    },

    // Get flatpak installation command for a distro
    getFlatpakInstallForDistro(distroId) {
        switch (distroId) {
            case 'ubuntu':
            case 'debian':
                return 'sudo apt install -y flatpak';
            case 'arch':
                return 'sudo pacman -S --needed --noconfirm flatpak';
            case 'fedora':
                return 'sudo dnf install -y flatpak';
            case 'opensuse':
                return 'sudo zypper install -y flatpak';
            default:
                return '# Install flatpak using your package manager';
        }
    },

    // Check if any packages are from AUR
    hasAurPackages(packages) {
        return packages.some(pkg => isAurPackage(pkg));
    },

    // Generate AUR helper install command
    generateHelperInstall(helper) {
        return `sudo pacman -S --needed git base-devel && \\
git clone https://aur.archlinux.org/${helper}.git /tmp/${helper} && \\
cd /tmp/${helper} && \\
makepkg -si --noconfirm && \\
cd - && \\
rm -rf /tmp/${helper}`;
    },

    // Generate Nix configuration
    generateNixConfig(packages) {
        const sortedPkgs = packages.filter(p => p.trim()).sort();
        const pkgList = sortedPkgs.map(p => `    ${p}`).join('\n');
        return `environment.systemPackages = with pkgs; [\n${pkgList}\n];`;
    },

    // Generate Snap command
    generateSnapCommand(packages) {
        if (packages.length === 0) return '# No packages selected';
        
        // Snap doesn't support installing multiple packages at once
        // Each package may have different flags (--classic)
        const commands = packages.map(pkg => `sudo snap install ${pkg}`);
        
        if (commands.length === 1) return commands[0];
        return commands.join(' && \\\n');
    },

    // Generate Homebrew command
    generateHomebrewCommand(packages) {
        const formulae = packages.filter(p => !p.startsWith('--cask '));
        const casks = packages.filter(p => p.startsWith('--cask ')).map(p => p.replace('--cask ', ''));
        
        const parts = [];
        
        if (formulae.length > 0) {
            parts.push(this.generateMultiLine('brew install', formulae));
        }
        
        if (casks.length > 0) {
            parts.push(this.generateMultiLine('brew install --cask', casks));
        }
        
        return parts.join(' && \\\n') || '# No packages selected';
    },

    // Generate download script (full script with shebang)
    generateDownloadScript(distroId, selectedApps, options = {}) {
        const command = this.generate(distroId, selectedApps, options);
        
        if (distroId === 'nix') {
            // Return Nix config as-is
            return command;
        }
        
        return `#!/bin/bash
# TuxMate Install Script for ${getDistroById(distroId)?.name || distroId}
# Generated: ${new Date().toISOString()}

set -e

${command}

echo "Installation complete!"
`;
    },
};
