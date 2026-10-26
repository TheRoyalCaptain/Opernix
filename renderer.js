const $ = (selector) => document.querySelector(selector);
const formatBytes = (bytes) => `${(bytes / 1024 ** 3).toFixed(1)} GB`;
const safe = (value, fallback = 'Niet beschikbaar') => value || fallback;
const setText = (selector, value) => { $(selector).textContent = value; };
const setMeter = (selector, value) => { $(selector).style.width = `${Math.max(0, Math.min(100, value || 0))}%`; };
let releaseUrl = 'https://github.com/TheRoyalCaptain/Opernix/releases';
let toastTimer;

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

function showView(name) {
  document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === `view-${name}`));
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === name));
  setText('#page-title', document.querySelector(`[data-view="${name}"] span:not(.nav-dot)`).textContent);
}

function setRows(selector, rows, emptyMessage) {
  const tbody = $(selector);
  tbody.replaceChildren();
  if (!rows.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = selector === '#disk-list' ? 4 : selector === '#volume-list' || selector === '#network-list' ? 5 : 1;
    cell.className = 'empty-row';
    cell.textContent = emptyMessage;
    row.append(cell);
    tbody.append(row);
    return;
  }
  rows.forEach((values) => {
    const row = document.createElement('tr');
    values.forEach((value, index) => {
      const cell = document.createElement('td');
      if (value === 'Online' || value === 'Gekoppeld') {
        const status = document.createElement('span');
        status.className = 'state-pill';
        status.textContent = value;
        cell.append(status);
      } else cell.textContent = value;
      if (index === 0) cell.title = String(value);
      row.append(cell);
    });
    tbody.append(row);
  });
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days > 0 ? `${days}d ${hours}u` : `${hours}u ${minutes}m`;
}

async function refreshSystemInfo() {
  $('#refresh-button').classList.add('is-loading');
  try {
    const data = await window.opernix.getSystemInfo();
    const totalStorage = data.filesystems.reduce((sum, fs) => sum + (fs.size || 0), 0);
    const usedStorage = data.filesystems.reduce((sum, fs) => sum + (fs.used || 0), 0);
    const cpuName = safe(data.cpu.brand, data.cpu.manufacturer);
    const gpuNames = data.graphics.controllers.map((gpu) => gpu.model).filter(Boolean);
    const boardName = [data.board.manufacturer, data.board.model].filter(Boolean).join(' ');
    const memoryTotal = data.memory.total;
    const memoryUsed = data.memory.active || data.memory.used;

    setText('#hostname-title', data.hostname || 'Jouw pc, in beeld.');
    setText('#os-subtitle', `${safe(data.os.distro, data.os.platform)} · ${safe(data.os.arch)} · kernel ${safe(data.os.kernel)}`);
    setText('#os-badge-text', safe(data.os.distro, 'LINUX').toUpperCase());
    setText('#cpu-load', `${Math.round(data.load.currentLoad)}%`);
    setText('#cpu-name', cpuName);
    setText('#cpu-cores', `${data.cpu.cores} cores · ${data.cpu.physicalCores} fysiek`);
    setMeter('#cpu-meter', data.load.currentLoad);
    $('#memory-used').innerHTML = `${(memoryUsed / 1024 ** 3).toFixed(1)}<small> GB</small>`;
    setText('#memory-total', `van ${formatBytes(memoryTotal)} in gebruik`);
    setText('#memory-free', `${formatBytes(memoryTotal - memoryUsed)} beschikbaar`);
    setMeter('#memory-meter', memoryTotal ? memoryUsed / memoryTotal * 100 : 0);
    $('#storage-used').innerHTML = `${(usedStorage / 1024 ** 3).toFixed(0)}<small> GB</small>`;
    setText('#storage-total', `van ${formatBytes(totalStorage)} in gebruik`);
    setText('#storage-free', `${formatBytes(totalStorage - usedStorage)} vrij`);
    setMeter('#storage-meter', totalStorage ? usedStorage / totalStorage * 100 : 0);
    setText('#uptime-value', formatUptime(data.time.uptime));
    setText('#boot-time', `Gestart ${new Date(data.time.current - data.time.uptime * 1000).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })}`);
    setText('#detail-cpu', `${cpuName} · ${data.cpu.cores} cores`);
    setText('#detail-gpu', gpuNames.join(', ') || 'Niet gedetecteerd');
    setText('#detail-board', boardName || 'Niet beschikbaar');
    setText('#detail-arch', `${data.os.arch} · ${data.os.kernel}`);
    setText('#detail-distro', `${data.os.distro} ${data.os.release}`);
    setText('#detail-kernel', data.os.kernel);
    setText('#hardware-cpu', cpuName);
    setText('#hardware-cpu-maker', safe(data.cpu.manufacturer));
    setText('#hardware-cores', `${data.cpu.cores} logisch · ${data.cpu.physicalCores} fysiek`);
    setText('#hardware-gpus', gpuNames.join(' · ') || 'Niet gedetecteerd');
    setText('#hardware-memory', formatBytes(memoryTotal));
    setText('#hardware-board-maker', safe(data.board.manufacturer));
    setText('#hardware-board', safe(data.board.model));
    setText('#hardware-bios', [data.bios.vendor, data.bios.version].filter(Boolean).join(' · '));
    setText('#hardware-battery', data.battery.hasBattery ? (data.battery.isCharging ? 'Aan het opladen' : 'Op batterij') : 'Geen batterij gedetecteerd');
    setText('#hardware-battery-level', data.battery.hasBattery ? `${data.battery.percent}%` : 'Niet van toepassing');
    setText('#hardware-battery-power', data.battery.hasBattery ? (data.battery.acConnected ? 'Aangesloten' : 'Niet aangesloten') : 'Niet van toepassing');
    setText('#hardware-model', [data.system.manufacturer, data.system.model].filter(Boolean).join(' ') || 'Niet beschikbaar');
    setText('#last-updated', `Bijgewerkt ${new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`);
    setRows('#volume-list', data.filesystems.map((fs) => [fs.mount, fs.type || 'Onbekend', formatBytes(fs.used), formatBytes(fs.size - fs.used), 'Online']), 'Geen volumes gevonden');
    setRows('#disk-list', data.disks.map((disk) => [disk.name || disk.device, disk.type || 'Onbekend', formatBytes(disk.size), disk.interfaceType || 'Onbekend']), 'Geen fysieke schijven gevonden');
    setRows('#network-list', data.network.filter((iface) => !iface.internal).map((iface) => [iface.iface, iface.type || 'Netwerk', iface.ip4 || 'Geen IPv4', iface.mac || 'Niet beschikbaar', iface.operstate === 'up' ? 'Gekoppeld' : 'Offline']), 'Geen externe interfaces gevonden');
  } catch (error) {
    showToast(`Systeeminformatie ophalen mislukt: ${error.message}`);
    setText('#last-updated', 'Gegevens niet beschikbaar');
  } finally {
    $('#refresh-button').classList.remove('is-loading');
  }
}

function updateStatus(status) {
  const check = $('#check-update');
  $('#update-dot').hidden = !['available', 'downloaded'].includes(status.status);
  check.disabled = ['checking', 'downloading'].includes(status.status);
  $('#download-update').hidden = status.status !== 'available';
  $('#install-update').hidden = status.status !== 'downloaded';
  const states = {
    checking: ['Updates controleren...', 'Even kijken of er een nieuwere versie beschikbaar is.'],
    current: ['Je bent helemaal bij.', 'Er is geen nieuwere versie beschikbaar.'],
    available: [`Versie ${status.version} is beschikbaar.`, 'Download de update wanneer je er klaar voor bent.'],
    downloading: ['Update downloaden...', `${Math.round(status.percent || 0)}% voltooid.`],
    downloaded: ['Klaar om te installeren.', `Versie ${status.version} is gedownload. Herstart om bij te werken.`],
    'dev-mode': ['Updates beschikbaar in de geïnstalleerde app.', 'De GitHub-updatecontrole werkt zodra Opernix als AppImage is geïnstalleerd.'],
    error: ['Controleren is niet gelukt.', status.message || 'Controleer de GitHub-releaseconfiguratie en probeer opnieuw.']
  };
  const [title, description] = states[status.status] || states.error;
  setText('#update-heading', title);
  setText('#update-message', description);
  if (status.status === 'current') showToast('Je gebruikt de nieuwste versie.');
  if (status.status === 'error') showToast(status.message || 'De updatecontrole is mislukt.');
}

document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => showView(item.dataset.view)));
document.querySelectorAll('[data-open-view]').forEach((item) => item.addEventListener('click', () => showView(item.dataset.openView)));
$('#refresh-button').addEventListener('click', refreshSystemInfo);
$('#check-update').addEventListener('click', async () => {
  updateStatus({ status: 'checking' });
  const result = await window.opernix.checkForUpdates();
  if (result.status === 'error' || result.status === 'dev-mode') updateStatus(result);
});
$('#download-update').addEventListener('click', async () => {
  const result = await window.opernix.downloadUpdate();
  if (result.status === 'error') updateStatus(result);
});
$('#install-update').addEventListener('click', () => window.opernix.installUpdate());
$('#open-releases').addEventListener('click', () => window.opernix.openExternal(releaseUrl));
window.opernix.onUpdateStatus(updateStatus);
window.opernix.getAppInfo().then((info) => {
  releaseUrl = info.releasesUrl;
  document.querySelectorAll('#app-version, #current-version, #detail-version').forEach((element) => { element.textContent = `v${info.version}`; });
});
refreshSystemInfo();