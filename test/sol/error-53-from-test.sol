class Main : Object {
  run
    [ |
      "Tento test by mal SKONČIŤ S CHYBOU 53!"
      
      _ := 'Attempting to create Integer from String...' print.
      
      "String má síce stringový interný stav, ale Integer očakáva číselný."
      s := '123'.
      
      "Nasledovný riadok musí spôsobiť CHYBU 53 podľa špecifikácie,"
      "pretože s neobsahuje celočíselný interný atribút."
      i := Integer from: s.
      
      "Ak interpreter nedal chybu 53, tak test zlyhal (spravil implicitný cast)."
      _ := 'FAIL - no Error 53 thrown!' print.
    ]
}
