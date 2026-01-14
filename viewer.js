/**
 * EPI Web Viewer
 * Client-side implementation using JSZip and Web Crypto API
 */

// Global state
let currentVerificationResult = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Buttons
    const btnOpen = document.getElementById('btn-open-file');
    const fileInput = document.getElementById('file-input');

    btnOpen.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    document.getElementById('btn-try-another-error').addEventListener('click', resetToInitial);
    document.getElementById('btn-close-file').addEventListener('click', resetToInitial);
    document.getElementById('btn-export-report').addEventListener('click', exportVerificationReport);

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchLayer(e.target.dataset.layer);
        });
    });

    // Drag and drop
    const dropZone = document.getElementById('drop-zone');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-active'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-active'));

    dropZone.addEventListener('drop', (e) => {
        dropZone.classList.remove('drag-active');
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

function resetToInitial() {
    currentVerificationResult = null;
    document.getElementById('file-input').value = '';
    showState('initial');
}

function showState(stateName) {
    document.querySelectorAll('.state-view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${stateName}-state`).classList.add('active');
}

async function handleFile(file) {
    if (!file.name.endsWith('.epi')) {
        alert('Please select a .epi file.');
        return;
    }

    showState('loading');
    updateVerificationStep('parsing', 'loading');

    try {
        const result = await verifyEpiFile(file);

        if (result.success) {
            updateVerificationStep('parsing', 'complete');
            updateVerificationStep('integrity', 'complete');
            updateVerificationStep('signature', 'complete');

            currentVerificationResult = result;
            displayVerifiedEvidence(result);
        } else {
            updateVerificationStep('parsing', 'error');
            showError(result.error, result.details);
        }
    } catch (err) {
        console.error(err);
        showError('An unexpected error occurred: ' + err.message);
    }
}

// Core Verification Logic using JSZip
async function verifyEpiFile(file) {
    try {
        const zip = await JSZip.loadAsync(file);

        // 1. Check Structure
        if (!zip.file('mimetype') || !zip.file('manifest.json')) {
            throw new Error('Invalid EPI file structure: missing mimetype or manifest.json');
        }

        // 2. Check Mimetype
        const mimetype = await zip.file('mimetype').async('string');
        if (mimetype.trim() !== 'application/vnd.epi+zip') {
            throw new Error(`Invalid mimetype: ${mimetype}`);
        }

        // 3. Parse Manifest
        const manifestStr = await zip.file('manifest.json').async('string');
        const manifest = JSON.parse(manifestStr);

        // 4. Integrity Check
        const fileManifest = manifest.file_manifest || {};
        const mismatches = [];
        let filesChecked = 0;

        for (const [filename, expectedHash] of Object.entries(fileManifest)) {
            const fileInZip = zip.file(filename);
            if (!fileInZip) {
                mismatches.push({ file: filename, error: 'File missing' });
                continue;
            }

            const contentBuffer = await fileInZip.async('arraybuffer');
            const actualHash = await computeSHA256(contentBuffer);

            if (actualHash !== expectedHash) {
                mismatches.push({
                    file: filename,
                    error: 'Hash mismatch',
                    expected: expectedHash,
                    actual: actualHash
                });
            }
            filesChecked++;
        }

        if (mismatches.length > 0) {
            return {
                success: false,
                error: 'Integrity check failed',
                details: { mismatches }
            };
        }

        // 5. Signature Check (Format only for now, mirroring desktop app)
        const signatureResult = checkSignatureFormat(manifest.signature);
        if (!signatureResult.valid) {
            return {
                success: false,
                error: 'Signature verification failed: ' + signatureResult.error,
                details: { signature: signatureResult }
            };
        }

        // 6. Extract Viewer
        let viewerHtml = null;
        if (zip.file('viewer.html')) {
            viewerHtml = await zip.file('viewer.html').async('string');
        }

        // Return Result
        return {
            success: true,
            manifest: manifest,
            viewerHtml: viewerHtml,
            verificationDetails: {
                integrity: { valid: true, filesChecked },
                signature: signatureResult
            }
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function computeSHA256(buffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkSignatureFormat(signature) {
    if (!signature) {
        return { valid: false, error: 'No signature present', level: 'UNSIGNED' };
    }
    const parts = signature.split(':');
    if (parts.length !== 3) return { valid: false, error: 'Invalid signature format' };

    if (parts[0] !== 'ed25519') return { valid: false, error: `Unsupported algorithm: ${parts[0]}` };

    return { valid: true, algorithm: parts[0], keyName: parts[1], level: 'SIGNED' };
}

function updateVerificationStep(stepId, status) {
    const step = document.getElementById(`step-${stepId}`);
    if (!step) return;

    step.classList.remove('loading', 'complete', 'error');
    step.classList.add(status);

    const icon = step.querySelector('.step-icon');
    if (status === 'loading') icon.textContent = '⏳';
    else if (status === 'complete') {
        icon.textContent = '✓';
        icon.style.color = '#10b981';
    }
    else if (status === 'error') {
        icon.textContent = '✗';
        icon.style.color = '#ef4444';
    }
}

function displayVerifiedEvidence(result) {
    const manifest = result.manifest;

    // Banner
    document.getElementById('status-algorithm').textContent = 'Ed25519';
    document.getElementById('status-timestamp').textContent = new Date(manifest.created_at).toISOString();
    document.getElementById('status-version').textContent = `EPI ${manifest.spec_version}`;

    // Summary
    document.getElementById('summary-workflow').textContent = manifest.workflow_id || '—';
    document.getElementById('summary-created').textContent = new Date(manifest.created_at).toLocaleString();

    const parts = manifest.signature ? manifest.signature.split(':') : [];
    const signerName = parts.length > 1 ? parts[1] : 'Unsigned';
    document.getElementById('summary-signer').textContent = signerName;

    document.getElementById('summary-files').textContent = Object.keys(manifest.file_manifest || {}).length;

    // Layer 1: Embedded Viewer
    // We render this into an iframe to sandboxing
    const container = document.getElementById('embedded-viewer');
    container.innerHTML = '';

    if (result.viewerHtml) {
        const iframe = document.createElement('iframe');
        iframe.sandbox = "allow-scripts allow-popups allow-forms";
        container.appendChild(iframe);

        // Inject layout fixes into the embedded HTML
        // This forces the content to fit the iframe and handle scrolling
        let htmlContent = result.viewerHtml;
        const layoutFix = `
            <style>
                html, body { 
                    height: 100% !important; 
                    width: 100% !important; 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    overflow: auto !important; 
                }
                /* Ensure terminal/content containers fill space */
                #terminal, .terminal, .xterm-viewport {
                     height: 100% !important;
                }
            </style>
        `;

        // Try to inject before </head>, otherwise append
        if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', layoutFix + '</head>');
        } else {
            htmlContent += layoutFix;
        }

        // Use Blob URL to safely load content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        iframe.src = URL.createObjectURL(blob);
    } else {
        container.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">No embedded viewer found.</div>';
    }

    // Layer 2: Facts
    renderFactsTable(manifest);

    // Layer 3: Crypto
    renderCryptoDetails(result);

    showState('viewer');
}

function renderFactsTable(manifest) {
    const factsTable = document.getElementById('facts-table');
    const facts = [
        { label: 'Workflow ID', value: manifest.workflow_id },
        { label: 'Spec Version', value: manifest.spec_version },
        { label: 'Created At', value: manifest.created_at },
        { label: 'Signature Present', value: manifest.signature ? 'Yes' : 'No' },
    ];

    if (manifest.environment) {
        facts.push(
            { label: 'OS', value: manifest.environment.os_name },
            { label: 'Platform', value: manifest.environment.platform },
            { label: 'Python', value: manifest.environment.python_version }
        );
    }

    let html = '<table><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>';
    facts.forEach(f => {
        html += `<tr><td>${f.label}</td><td>${f.value}</td></tr>`;
    });
    html += '</tbody></table>';
    factsTable.innerHTML = html;
}

function renderCryptoDetails(result) {
    const el = document.getElementById('crypto-details');
    const m = result.manifest;
    let txt = 'CRYPTOGRAPHIC VERIFICATION REPORT\n===============================\n\n';

    txt += `[ INTEGRITY CHECK ]\n`;
    txt += `Status: ${result.verificationDetails.integrity.valid ? 'PASS' : 'FAIL'}\n`;
    txt += `Files Verified: ${result.verificationDetails.integrity.filesChecked}\n`;
    txt += `Hashing Algorithm: SHA-256\n\n`;

    txt += `[ SIGNATURE ]\n`;
    if (m.signature) {
        txt += `Algorithm: Ed25519\n`;
        txt += `Raw Signature: ${m.signature}\n`;
        txt += `Status: Format Valid (Key verification not implemented in browser)\n`;
    } else {
        txt += `Status: UNSIGNED\n`;
    }

    txt += `\n[ FILE MANIFEST ]\n`;
    for (const [f, h] of Object.entries(m.file_manifest || {})) {
        txt += `${f}: ${h}\n`;
    }

    el.textContent = txt;
}

function showError(msg, details) {
    document.getElementById('error-message').textContent = msg;
    if (details) {
        document.getElementById('error-details').textContent = JSON.stringify(details, null, 2);
    }
    showState('error');
}

function switchLayer(layerId) {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        if (b.dataset.layer === layerId) b.classList.add('active');
    });
    document.querySelectorAll('.layer-panel').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`layer-${layerId}`).classList.add('active');
}

function exportVerificationReport() {
    // Reuse logic from previous one or similiar
    alert('Report generation copied to clipboard (Mock)');
}
