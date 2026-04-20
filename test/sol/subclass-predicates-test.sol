class MyNil : Nil {}
class MyTrue : True {}
class MyFalse : False {}
class MyInt : Integer {}
class MyStr : String {}
class MyObj : Object {}

class Main : Object {
  run
    [ |
      nl := '\n'.
      n := MyNil new.
      t := MyTrue new.
      f := MyFalse new.
      i := MyInt from: 42.
      s := MyStr from: 'test'.
      o := MyObj new.

      _ := '--- MyNil predicates ---' print. _ := nl print.
      _ := 'isNil should be true: ' print. _ := ((n isNil) asString) print. _ := nl print.
      _ := 'isString should be false: ' print. _ := ((n isString) asString) print. _ := nl print.
      _ := 'isNumber should be false: ' print. _ := ((n isNumber) asString) print. _ := nl print.

      _ := '--- MyInt predicates ---' print. _ := nl print.
      _ := 'isNil should be false: ' print. _ := ((i isNil) asString) print. _ := nl print.
      _ := 'isString should be false: ' print. _ := ((i isString) asString) print. _ := nl print.
      _ := 'isNumber should be true: ' print. _ := ((i isNumber) asString) print. _ := nl print.

      _ := '--- MyStr predicates ---' print. _ := nl print.
      _ := 'isNil should be false: ' print. _ := ((s isNil) asString) print. _ := nl print.
      _ := 'isString should be true: ' print. _ := ((s isString) asString) print. _ := nl print.
      _ := 'isNumber should be false: ' print. _ := ((s isNumber) asString) print. _ := nl print.

      _ := '--- MyTrue predicates ---' print. _ := nl print.
      _ := 'isNil should be false: ' print. _ := ((t isNil) asString) print. _ := nl print.
      _ := 'isString should be false: ' print. _ := ((t isString) asString) print. _ := nl print.
      _ := 'isNumber should be false: ' print. _ := ((t isNumber) asString) print. _ := nl print.

      _ := '--- MyFalse predicates ---' print. _ := nl print.
      _ := 'isNil should be false: ' print. _ := ((f isNil) asString) print. _ := nl print.
      _ := 'isString should be false: ' print. _ := ((f isString) asString) print. _ := nl print.
      _ := 'isNumber should be false: ' print. _ := ((f isNumber) asString) print. _ := nl print.
      
      _ := '--- MyObj predicates ---' print. _ := nl print.
      _ := 'isNil should be false: ' print. _ := ((o isNil) asString) print. _ := nl print.
      _ := 'isString should be false: ' print. _ := ((o isString) asString) print. _ := nl print.
      _ := 'isNumber should be false: ' print. _ := ((o isNumber) asString) print. _ := nl print.
    ]
}
