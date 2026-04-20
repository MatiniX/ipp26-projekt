class Main : Object {
  run
    [ |
      "Pripravíme si 1-parametrický blok."
      b := [ :x | _ := (x asString) print. ].
      
      "Zavoláme ho nesprávnou aritou - BEZ parametrov."
      "Block musí mať presne a iba jednú metódu pre value (tu je to value:)."
      "Preto prijatie zprávy 'value' vyvolá Error 51 (Does Not Understand)."
      _ := b value.
    ]
}