"""Verified GitHub Releases auto-updater; stage side-by-side to avoid replacing a running EXE."""
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

REPO = "azza0101/rambla-log"
API = "https://api.github.com/repos/" + REPO + "/releases/latest"
INSTALL_DIR = Path(os.getenv("LOCALAPPDATA", str(Path.home()))) / "RAMBLA Log Bridge"
VERSIONS = INSTALL_DIR / "versions"
POINTER = INSTALL_DIR / "current.txt"
MAX_EXE = 150_000_000
VALID_ASSET = {"RAMBLA.Log.Bridge.exe", "RAMBLA Log Bridge.exe"}
ALLOWED_HOSTS = {"github.com", "api.github.com", "release-assets.githubusercontent.com", "objects.githubusercontent.com"}


def semantic_version(value):
    value = value.removeprefix("bridge-v")
    if not re.fullmatch(r"\d+\.\d+\.\d+", value):
        raise ValueError("Versione GitHub non valida: " + value[:60])
    return tuple(map(int, value.split(".")))


def fetch_release():
    request = urllib.request.Request(API, headers={"User-Agent": "RAMBLA-Log-Bridge-Updater", "Accept": "application/vnd.github+json"})
    with urllib.request.urlopen(request, timeout=20) as response:
        raw = response.read(1_000_001)
    if len(raw) > 1_000_000:
        raise RuntimeError("La risposta GitHub è troppo grande.")
    release = json.loads(raw)
    tag = str(release.get("tag_name", ""))
    semantic_version(tag)
    assets = release.get("assets", [])
    exe = next((asset for asset in assets if asset.get("name") in VALID_ASSET), None)
    sha = next((asset for asset in assets if asset.get("name") in {name + ".sha256" for name in VALID_ASSET}), None)
    if not exe or not sha:
        raise RuntimeError("La Release non contiene EXE e SHA-256: " + tag)
    return {"tag": tag, "version": tag.removeprefix("bridge-v"), "exe": exe["browser_download_url"], "checksum": sha["browser_download_url"], "size": exe.get("size", 0)}


def allowed_url(url):
    from urllib.parse import urlparse
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_HOSTS:
        raise RuntimeError("Download non consentito da un host diverso da GitHub.")
    return url


def load_expected_checksum(release):
    request = urllib.request.Request(allowed_url(release["checksum"]), headers={"User-Agent": "RAMBLA-Log-Bridge-Updater"})
    with urllib.request.urlopen(request, timeout=20) as response:
        allowed_url(response.url)
        body = response.read(4097)
    if len(body) > 4096:
        raise RuntimeError("Checksum GitHub troppo grande.")
    digest = body.decode("ascii").strip().split()[0].lower()
    if not re.fullmatch(r"[0-9a-f]{64}", digest):
        raise RuntimeError("Checksum GitHub non valido.")
    return digest


def pointer_value(filename):
    if not re.fullmatch(r"RAMBLA-Log-Bridge-\d+\.\d+\.\d+\.exe", filename):
        raise ValueError("Nome del file di aggiornamento non valido.")
    return filename


def current_executable():
    try:
        name = pointer_value(POINTER.read_text(encoding="utf-8").strip())
        selected = VERSIONS / name
        if selected.is_file():
            return selected
    except (FileNotFoundError, ValueError, OSError):
        pass
    fallback = INSTALL_DIR / "RAMBLA Log Bridge.exe"
    if fallback.is_file():
        return fallback
    return None


def write_pointer(filename):
    pointer_value(filename)
    INSTALL_DIR.mkdir(parents=True, exist_ok=True)
    target = POINTER.with_suffix(".new")
    target.write_text(filename + "\n", encoding="utf-8")
    os.replace(target, POINTER)


def download_update(release, callback):
    """Download to a versioned file; verify digest before changing any launcher pointer."""
    semantic_version(release["version"])
    callback("Verifico la firma SHA-256 pubblicata…", 7)
    expected = load_expected_checksum(release)
    filename = pointer_value("RAMBLA-Log-Bridge-" + release["version"] + ".exe")
    VERSIONS.mkdir(parents=True, exist_ok=True)
    destination = VERSIONS / filename
    if destination.exists():
        with destination.open("rb") as file:
            digest = hashlib.file_digest(file, "sha256").hexdigest()
        if digest == expected:
            callback("File già scaricato e verificato.", 95)
            return destination
    callback("Scarico la nuova versione…", 10)
    temp = destination.with_suffix(".partial")
    req = urllib.request.Request(allowed_url(release["exe"]), headers={"User-Agent": "RAMBLA-Log-Bridge-Updater"})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            allowed_url(response.url)
            size = int(response.headers.get("Content-Length") or 0)
            if size > MAX_EXE:
                raise RuntimeError("L'eseguibile è troppo grande.")
            size = size or int(release.get("size") or 0)
            hasher = hashlib.sha256()
            count = 0
            with temp.open("wb") as output:
                while True:
                    chunk = response.read(256 * 1024)
                    if not chunk:
                        break
                    count += len(chunk)
                    if count > MAX_EXE:
                        raise RuntimeError("Limite massimo del download superato.")
                    output.write(chunk)
                    hasher.update(chunk)
                    percent = 10 + min(79, round(79 * count / size)) if size else None
                    callback("Download: " + (str(round(100 * count / size)) + "%" if size else str(round(count / 1_048_576, 1)) + " MB"), percent)
        callback("Controllo integrità SHA-256…", 90)
        if count == 0 or hasher.hexdigest() != expected:
            raise RuntimeError("Verifica SHA-256 fallita: non installo il file.")
        with temp.open("rb") as file:
            if file.read(2) != b"MZ":
                raise RuntimeError("Il file scaricato non è un eseguibile Windows.")
        os.replace(temp, destination)
        callback("Nuova versione verificata.", 95)
        return destination
    finally:
        try:
            temp.unlink(missing_ok=True)
        except OSError:
            pass


def activate_and_launch(destination):
    """Atomic pointer switch only after verified download; roll back on launch failure."""
    destination = Path(destination)
    if destination.parent.resolve() != VERSIONS.resolve():
        raise RuntimeError("Il file non appartiene alla cartella RAMBLA.")
    pointer_value(destination.name)
    previous = POINTER.read_text(encoding="utf-8").strip() if POINTER.exists() else None
    write_pointer(destination.name)
    try:
        flags = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
        subprocess.Popen([str(destination)], close_fds=True, creationflags=flags)
    except Exception:
        if previous:
            write_pointer(previous)
        else:
            POINTER.unlink(missing_ok=True)
        raise


def is_newer(release, installed):
    return semantic_version(release["version"]) > semantic_version(installed)
