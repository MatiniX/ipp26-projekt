class Main : Object {
  run
    [ |
      "Pripravíme si 0-parametrický blok."
      b := [ | _ := 'Hello' print. ].
      
      "Zavoláme ho s dvomi parametrami."
      "Zaslanie zprávy 'value:value:' narazí na Error 51, lebo blok pozná len 'value'."
      _ := b value: 1 value: 2.
    ]
}