class MyInt : Integer { }
class Main : Object {
  run [|
    x := 1. y := 1. 
    z := Integer from: 1.
    u := MyInt from: 1. 
    w := MyInt from: 1.

    a := x equalTo: y. 
    b := a asString.
    _ := b print.

    a := x equalTo: z.
    b := a asString.
    _ := b print. "obojí true"

    a := x identicalTo: y.
    b := a asString.
    _ := b print. "podle implementace"

    a := x identicalTo: z.
    b := a asString.
    _ := b print. "podle implementace"

    a := u equalTo: x.
    b := a asString. 
    _ := b print.

    a := u equalTo: w.
    b := a asString. 
    _ := b print. "obojí true"

    a := u identicalTo: x.
    b := a asString. 
    _ := b print. "false"

    a := u identicalTo: w.
    b := a asString. 
    _ := b print. "podle implementace"

    isNil := w isNil.
    b := isNil asString.
    _ := b print.
  ]
}