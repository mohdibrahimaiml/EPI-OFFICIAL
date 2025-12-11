/**
 * EPI Terminal Simulator
 * Provides a realistic typing experience and mock execution of EPI commands.
 */

class TerminalDemo {
    constructor(elementId, options = {}) {
        this.container = document.getElementById(elementId);
        this.options = options; // { onPhaseChange: (phase) => {} }
        if (!this.container) return;

        this.body = this.container.querySelector('.terminal-body');
        this.inputLine = null;
        this.isTyping = false;
        this.isAutoRunning = false;

        // Mock File System
        this.files = {
            'experiment.py': '# AI Experiment Workflow\nimport openai\nfrom epi_recorder import record\n\nwith record("exp_01"):\n    print("Running model...")',
            'README.md': '# My Project\nDocumentation here.',
            'requirements.txt': 'openai\nepi-recorder\npandas'
        };

        this.history = [];
        this.historyIndex = 0;

        this.init();
    }

    init() {
        // Force scroll to top to prevent browser jump
        window.scrollTo(0, 0);

        this.clear();
        this.clear();
        this.newLine(false); // Don't focus on init

        // Focus input on click
        this.container.addEventListener('click', () => {
            const input = this.body.querySelector('.command-input');
            if (input) {
                input.disabled = false;
                input.focus();
            }
        });

        // Initial welcome message
        this.print([
            { text: 'EPI Portable Environment v2.0.0', color: 'text-dim' },
            { text: 'Type "help" for a list of commands.', color: 'text-dim' },
            { text: '' }
        ]);

        // Auto-start demo if visible
        this.startAutoDemo();
    }

    clear() {
        this.body.innerHTML = '';
    }

    newLine(autoFocus = true) {
        // Remove old cursor if exists
        const oldCursor = this.body.querySelector('.cursor');
        if (oldCursor) oldCursor.remove();

        // Disable old input
        const oldInput = this.body.querySelector('.command-input');
        if (oldInput) {
            oldInput.disabled = true;
            oldInput.parentElement.innerHTML = oldInput.value;
        }

        const line = document.createElement('div');
        line.className = 'command-line';
        line.innerHTML = `
            <span class="prompt text-green">➜</span>
            <span class="path text-blue">~/project</span>
            <span class="prompt text-gray">$</span>
            <div class="input-area">
                <input type="text" class="command-input" spellcheck="false" autocomplete="off">
            </div>
        `;

        this.body.appendChild(line);
        this.scrollToBottom();

        this.inputLine = line.querySelector('.command-input');
        if (autoFocus) {
            this.inputLine.focus();
        } else {
            this.inputLine.disabled = true;
        }

        // Event Listeners
        this.inputLine.addEventListener('keydown', (e) => this.handleInput(e));
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const cmd = this.inputLine.value.trim();
            this.history.push(cmd);
            this.historyIndex = this.history.length;
            this.history.push(cmd);
            this.historyIndex = this.history.length;
            this.execute(cmd, true); // User always focuses
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.inputLine.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.inputLine.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.inputLine.value = '';
            }
        }
    }

    async execute(cmd, autoFocus = true) {
        this.newLine(!this.isAutoRunning && autoFocus); // Lock previous line
        const parts = cmd.split(' ');
        const program = parts[0];
        const args = parts.slice(1);

        if (!program) {
            this.newLine();
            return;
        }

        // Simulate processing delay
        this.inputLine.disabled = true;

        switch (program) {
            case 'help':
                this.print([
                    { text: 'Available commands:', color: 'text-yellow' },
                    { text: '  epi run <file>    Record and verify a script' },
                    { text: '  epi view <file>   Open recording viewer' },
                    { text: '  ls                List files' },
                    { text: '  cat <file>        Show file content' },
                    { text: '  clear             Clear screen' }
                ]);
                break;

            case 'clear':
                this.clear();
                break;

            case 'ls':
                this.print([
                    { text: Object.keys(this.files).join('  stdout.log  recording.epi  '), color: 'text-blue' }
                ]);
                break;

            case 'cat':
                const file = this.files[args[0]];
                if (file) {
                    this.print([{ text: file }]);
                } else {
                    this.print([{ text: `cat: ${args[0]}: No such file or directory`, color: 'text-red' }]);
                }
                break;

            case 'pip':
                await this.simulatePip(args);
                break;

            case 'epi':
                await this.handleEpiCommand(args);
                break;

            default:
                this.print([{ text: `command not found: ${program}`, color: 'text-red' }]);
        }

        this.newLine(!this.isAutoRunning && autoFocus);
        this.scrollToBottom();
    }

    async handleEpiCommand(args) {
        const subcmd = args[0];

        if (!subcmd) {
            this.print([{ text: 'usage: epi <command> [options]', color: 'text-red' }]);
            return;
        }

        if (subcmd === 'run') {
            if (!args[1]) {
                this.print([{ text: 'accusing: missing argument <file>', color: 'text-red' }]);
                return;
            }
            await this.simulateRecording(args[1]);
        } else if (subcmd === 'view') {
            this.print([{ text: 'Opening viewer...', color: 'text-blue' }]);
            if (!this.isAutoRunning) {
                setTimeout(() => openViewerModal(), 800);
            }
        } else if (subcmd === 'verify') {
            await this.simulateVerification(args[1]);
        } else {
            this.print([{ text: `epi: unknown command '${subcmd}'`, color: 'text-red' }]);
        }
    }

    async simulateRecording(filename) {
        const steps = [
            { text: `→ Starting EPI Recorder v2.0.0`, delay: 200 },
            { text: `  Target: ${filename}`, delay: 100 },
            { text: `  Environment: Python 3.11.4 | Windows 10`, color: 'text-dim', delay: 300 },
            { text: `● Recording active... (PID: 1420)`, color: 'text-green', delay: 400 },
            { text: `  > Intercepted OpenAI: chat.completions.create (gpt-4)`, color: 'text-blue', delay: 800 },
            { text: `  > Redacted API Key: sk-proj-***`, color: 'text-yellow', delay: 200 },
            { text: `  > Captured artifact: results.json`, delay: 300 },
            { text: `✓ Workflow verified: Integrity OK`, color: 'text-green', delay: 500 },
            { text: `✓ Signature valid: Ed25519 (Key: default)`, color: 'text-green', delay: 200 },
            { text: `\nOutput saved to: ./recording_20251211.epi [240KB]`, color: 'text-blue', delay: 0 }
        ];

        for (const step of steps) {
            await this.delay(step.delay);
            this.print([{ text: step.text, color: step.color }]);
        }
    }

    async simulatePip(args) {
        if (this.options.onPhaseChange) this.options.onPhaseChange('install');

        if (args[0] === 'install' && args[1] === 'epi-recorder') {
            const lines = [
                { text: 'Collecting epi-recorder', color: 'text-dim' },
                { text: '  Downloading epi_recorder-2.0.0-py3-none-any.whl (18 kB)' },
                { text: 'Installing collected packages: epi-recorder', color: 'text-dim' },
                { text: 'Successfully installed epi-recorder-2.0.0', color: 'text-green' }
            ];
            for (const line of lines) {
                this.print([line]);
                await this.delay(Math.random() * 200 + 100);
            }
        } else {
            this.print([{ text: `pip: unknown command or package`, color: 'text-red' }]);
        }
    }

    async simulateVerification(filename) {
        this.print([
            { text: `Verifying ${filename || 'recording.epi'}...`, color: 'text-dim' }
        ]);
        await this.delay(800);
        this.print([
            { text: `+---------------------------------------+` },
            { text: `| TRUST LEVEL: HIGH                     |`, color: 'text-green' },
            { text: `| Message: Cryptographically Verified   |` },
            { text: `| Integrity: OK                         |` },
            { text: `| Signer:    Mohd Ibrahim (default)     |` },
            { text: `+---------------------------------------+` }
        ]);
    }

    async startAutoDemo() {
        if (this.isAutoRunning || this.options.skipAutoDemo) return;
        this.isAutoRunning = true;

        // Sequence: Install -> Record -> Verify -> View

        // 1. Install Phase
        await this.delay(1000);
        if (this.options.onPhaseChange) this.options.onPhaseChange('install');
        await this.typeCommand('pip install epi-recorder');
        await this.print([
            { text: 'Collecting epi-recorder', color: 'text-white' },
            { text: 'Downloading epi_recorder-2.0.0-py3-none-any.whl (18 kB)', color: 'text-white' },
            { text: 'Installing collected packages: epi-recorder', color: 'text-white' },
            { text: 'Successfully installed epi-recorder-2.0.0', color: 'text-green' }
        ]);
        this.newLine(false);

        // 2. Record Phase
        await this.delay(1500);
        if (this.options.onPhaseChange) this.options.onPhaseChange('record');
        await this.delay(1000);
        await this.typeCommand('epi run experiment.py');

        // 3. Verify & View Phase
        if (this.options.onPhaseChange) this.options.onPhaseChange('view');
        await this.delay(2000); // Allow time to read verifying message
        await this.typeCommand('epi view output.epi');

        // Final: Open Viewer
        this.print([{ text: 'Opening viewer...', color: 'text-dim' }]);
        await this.delay(1000);

        if (typeof openViewerModal === 'function') {
            openViewerModal();
        } else {
            // Fallback if global function not found (e.g. scoping issue)
            const event = new CustomEvent('open-viewer');
            window.dispatchEvent(event);
        }

        // Loop
        await this.delay(5000);
        this.print([{ text: '↺ Restarting simulation...', color: 'text-dim' }]);
        await this.delay(1000);
        this.clear();
        this.newLine(false);
        this.isAutoRunning = false;
        this.startAutoDemo();
    }

    async typeCommand(text) {
        if (this.isTyping) return;
        this.isTyping = true;

        // Find the last command line explicitly, traversing backwards or using querySelectorAll
        // Note: active command line might not be the absolute last element if other output exists, 
        // but for typing we generally want the last *command line* added.
        const commandLines = this.body.querySelectorAll('.command-line');
        if (commandLines.length === 0) return;

        const lastCommandLine = commandLines[commandLines.length - 1];
        const input = lastCommandLine.querySelector('.command-input');

        if (!input) {
            this.isTyping = false;
            return;
        }

        // Simulate typing
        for (let i = 0; i < text.length; i++) {
            input.value += text[i];
            await this.delay(Math.random() * 50 + 30); // Random typing speed
        }

        await this.delay(300);
        await this.delay(300);
        this.execute(text, false); // No focus for auto-runner
        this.isTyping = false;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Viewer Logic
function createViewerModal() {
    const backdrop = document.createElement('div');
    backdrop.className = 'viewer-backdrop';

    const modal = document.createElement('div');
    modal.className = 'viewer-modal';

    modal.innerHTML = `
        <div class="viewer-header">
            <h3 class="font-bold text-gray-800">EPI Viewer - recording_20251211.epi</h3>
            <div class="viewer-close">✕</div>
        </div>
        <div style="flex:1; background: #f3f4f6; overflow: hidden; position: relative;">
            <iframe src="demo_player.html" style="width:100%; height:100%; border:none;"></iframe>
             <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; color: #6b7280;">
                <p>Interactive Viewer Mockup</p>
                <p class="text-xs mt-2">(Loads demo_player.html)</p>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    const close = () => {
        backdrop.classList.remove('active');
        modal.classList.remove('active');
        setTimeout(() => {
            backdrop.remove();
            modal.remove();
        }, 500);
    };

    modal.querySelector('.viewer-close').onclick = close;
    backdrop.onclick = close;

    return { backdrop, modal };
}

function openViewerModal() {
    let { backdrop, modal } = createViewerModal();
    // Force reflow
    void backdrop.offsetWidth;

    backdrop.classList.add('active');
    modal.classList.add('active');
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Homepage Terminal (ID: interactive-terminal)
    const homeTerminal = document.getElementById('interactive-terminal');
    // Only init if found AND NOT on simulation page (which handles it via inline script)
    // Actually, safer to just check if it's already initialized or if we are on index.html context.
    // The simulation.html script manually calls new TerminalDemo.
    // The index.html does NOT have a manual script, so we must init here if element exists.

    // Check if we are on the simulation page to avoid double-init if that page has the same ID
    const isSimulationPage = window.location.pathname.includes('simulation.html');

    if (homeTerminal && !isSimulationPage) {
        // Init specifically for homepage
        const term = new TerminalDemo('interactive-terminal', {
            skipAutoDemo: false
        });
    }
});
