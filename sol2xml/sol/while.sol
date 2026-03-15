class Main : Object {
  run  "<- definice metody - bezparametrický selektor run"
    [ | 
      "tělo nějaké metody v rámci nějaké třídy, kde se vytvoří atribut 'attr'"
      x := self attr: 3.
      y := [| ret := (self attr) greaterThan: 0. ] whileTrue:
      [| r := ((self attr) asString) print.
      r := self attr: ((self attr) minus: 1).].
    ]
}