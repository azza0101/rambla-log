import unittest
from core import *
DEMO="""TITLE: TEST
FCM: NON-DROP FRAME

001  001      V     C        01:00:04:00 01:00:04:01 01:00:04:00 01:00:04:01
[keep] Test
 |C:ResolveColorGreen |M:Da tenere |D:25
"""
class Mock:
 def __init__(self):self.markers={}
 def GetSetting(self,n):return '25'
 def GetStartTimecode(self):return '01:00:00:00'
 def GetMarkers(self):return self.markers
 def AddMarker(self,f,*args):self.markers[f]={'name':args[1],'duration':args[3]};return True
class TestBridge(unittest.TestCase):
 def test_edl(self):
  s=parse_edl(DEMO,'test.edl')
  self.assertEqual(s.markers[0].tc,'01:00:04:00')
  self.assertEqual(s.markers[0].duration,25)
 def test_timeline(self):
  t=Mock();s=parse_edl(DEMO,'x.edl');p,w=plan(s,t)
  self.assertEqual(p[0][0],100)
  self.assertEqual(apply(t,p)[0],1)
  self.assertEqual(len(plan(s,t)[0]),0)
 def test_default_marker_length_one_second(self):
  t=Mock();s=parse_edl(DEMO.replace('|D:25','|D:150'),'x.edl')
  p,w=plan(s,t)
  self.assertEqual(apply(t,p)[0],1)
  self.assertEqual(t.markers[100]['duration'],25)
 def test_one_second_at_24_fps(self):
  class Rate24(Mock):
   def GetSetting(self,n):return '24'
  t=Rate24();s=parse_edl(DEMO,'x.edl')
  p,w=plan(s,t)
  self.assertEqual(apply(t,p)[0],1)
  self.assertEqual(t.markers[96]['duration'],24)
 def test_bad(self):
  with self.assertRaises(ValueError):parse_edl('BAD','bad.edl')
 def test_drop(self):
  self.assertEqual(frames('01:00:00;00','29.97'),107892)
  with self.assertRaises(ValueError):frames('00:01:00;00','29.97')
if __name__=='__main__':unittest.main()
