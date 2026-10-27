"""Updater regression tests, no real network or user EXE mutation."""
import hashlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from updater import semantic_version, is_newer, pointer_value, download_update

class UpdaterTests(unittest.TestCase):
    def test_semver_comparison(self):
        self.assertTrue(is_newer({"version":"0.2.0"},"0.1.0"))
        self.assertFalse(is_newer({"version":"0.1.0"},"0.1.0"))
        self.assertFalse(is_newer({"version":"0.1.0"},"0.2.0"))
        self.assertEqual(semantic_version("bridge-v1.10.0"),(1,10,0))
        with self.assertRaises(ValueError):semantic_version("bridge-v0.2.0;malicious")
    def test_pointer_confined(self):
        self.assertEqual(pointer_value("RAMBLA-Log-Bridge-0.2.0.exe"),"RAMBLA-Log-Bridge-0.2.0.exe")
        for invalid in ("../../foo.exe","RAMBLA Log Bridge.exe","a.exe","RAMBLA-Log-Bridge-1.0.0.exe/../x"):
            with self.assertRaises(ValueError):pointer_value(invalid)
    def test_checksum_gate(self):
        from updater import download_update
        class Reply:
            def __init__(self,data):
                self.data=data
                self.url="https://github.com/azza0101/rambla-log/releases/download/bridge-v0.2.0/example.exe"
                self.headers={"Content-Length":str(len(data))}
            def __enter__(self):return self
            def __exit__(self,*args):pass
            def read(self,n):part,self.data=self.data[:n],self.data[n:];return part
        with tempfile.TemporaryDirectory() as folder:
            with patch("updater.VERSIONS",Path(folder)),patch("updater.load_expected_checksum",return_value="0"*64),patch("updater.urllib.request.urlopen",return_value=Reply(b"MZFAKE")):
                with self.assertRaisesRegex(RuntimeError,"SHA-256"):
                    download_update({"version":"0.2.0","exe":"https://github.com/azza0101/rambla-log/releases/download/bridge-v0.2.0/example.exe","size":6},lambda *args:None)
            self.assertEqual(list(Path(folder).iterdir()),[])
    def test_valid_download_and_progress(self):
        from updater import download_update
        data=b"MZ"+b"safe-test-binary"
        class Reply:
            url="https://github.com/azza0101/rambla-log/releases/download/bridge-v0.2.0/example.exe"
            headers={"Content-Length":str(len(data))}
            def __init__(self):self.remaining=data
            def __enter__(self):return self
            def __exit__(self,*args):pass
            def read(self,n):part,self.remaining=self.remaining[:n],self.remaining[n:];return part
        steps=[]
        with tempfile.TemporaryDirectory() as folder:
            with patch("updater.VERSIONS",Path(folder)),patch("updater.load_expected_checksum",return_value=hashlib.sha256(data).hexdigest()),patch("updater.urllib.request.urlopen",return_value=Reply()):
                dest=download_update({"version":"0.2.0","exe":"https://github.com/azza0101/rambla-log/releases/download/bridge-v0.2.0/example.exe","size":len(data)},lambda *args:steps.append(args))
                self.assertEqual(dest.read_bytes(),data)
                self.assertEqual(steps[-1][1],95)

if __name__=="__main__":unittest.main()
