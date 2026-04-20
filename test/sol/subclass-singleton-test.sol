class MyNil : Nil {}
class MyTrue : True {}
class MyFalse : False {}

class Main : Object {
  run
    [ |
      nl := '\n'.
      
      _ := '--- Nil singleton vs MyNil subclass ---' print. _ := nl print.
      b1 := Nil new.
      b2 := Nil new.
      _ := 'Nil identicalTo: Nil should be true: ' print.
      _ := ((b1 identicalTo: b2) asString) print. _ := nl print.
      
      n1 := MyNil new.
      n2 := MyNil new.
      _ := 'MyNil identicalTo: MyNil should be false: ' print.
      _ := ((n1 identicalTo: n2) asString) print. _ := nl print.
      
      _ := '--- True singleton vs MyTrue subclass ---' print. _ := nl print.
      b1 := True new.
      b2 := True new.
      _ := 'True identicalTo: True should be true: ' print.
      _ := ((b1 identicalTo: b2) asString) print. _ := nl print.
      
      t1 := MyTrue new.
      t2 := MyTrue new.
      _ := 'MyTrue identicalTo: MyTrue should be false: ' print.
      _ := ((t1 identicalTo: t2) asString) print. _ := nl print.

      _ := '--- False singleton vs MyFalse subclass ---' print. _ := nl print.
      b1 := False new.
      b2 := False new.
      _ := 'False identicalTo: False should be true: ' print.
      _ := ((b1 identicalTo: b2) asString) print. _ := nl print.
      
      f1 := MyFalse new.
      f2 := MyFalse new.
      _ := 'MyFalse identicalTo: MyFalse should be false: ' print.
      _ := ((f1 identicalTo: f2) asString) print. _ := nl print.
    ]
}