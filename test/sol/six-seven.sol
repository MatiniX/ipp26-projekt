class Main : Object {
run [|
    x := 42.
    blok := [ :x | _ := (x asString) print.].
    _ := blok value: 67. 
  ]
}