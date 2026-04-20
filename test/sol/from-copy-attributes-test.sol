class MyNumber : Integer {
  "Podtrieda Integeru, ktorej budeme dynamicky pridávať inštančné atribúty"
}

class MyText : String {
  "Podtrieda Stringu pre otestovanie toho istého správania"
}

class Main : Object {
  run
    [ |
      nl := '\n'.
      
      _ := '--- Testovanie hlbokej/plytkej kópie cez from: pre Integer ---' print.
      _ := nl print.

      "1. Vytvoríme inštanciu MyNumber a pridáme inštančné atribúty"
      n1 := MyNumber from: 42.
      _ := n1 customA: 'Hodnota A'.
      _ := n1 customB: 'Hodnota B'.
      
      "2. Vytvoríme kópiu pomocou from: (musí skopírovať interný stav = 42, aj atribúty)"
      n2 := MyNumber from: n1.
      
      "Overenie interného stavu"
      _ := 'n2 internal state (should be 42): ' print.
      _ := (n2 asString) print. 
      _ := nl print.
      
      "Overenie prekopírovania atribútov (toto často v skrytých testoch padá!)"
      _ := 'n2 customA (should be Hodnota A): ' print.
      _ := (n2 customA) print. 
      _ := nl print.
      
      _ := 'n2 customB (should be Hodnota B): ' print.
      _ := (n2 customB) print. 
      _ := nl print.
      
      "3. Overenie, že išlo o plytkú kópiu a inštancie sú nezávislé"
      _ := 'Meníme customA v pôvodnom (n1) objekte...' print.
      _ := nl print.
      _ := n1 customA: 'Zmenena Hodnota A'.
      
      _ := 'n2 customA po zmene v n1 (stále by mala byť Hodnota A): ' print.
      _ := (n2 customA) print. 
      _ := nl print.
      
      _ := 'Identita (n1 identicalTo: n2) should be false: ' print.
      _ := ((n1 identicalTo: n2) asString) print. 
      _ := nl print.

      _ := '--- Testovanie kópie cez from: pre String ---' print.
      _ := nl print.

      str1 := MyText from: 'Povodny string'.
      _ := str1 meta: 'Meta info'.

      str2 := MyText from: str1.

      _ := 'str2 internal state: ' print.
      _ := (str2 asString) print. 
      _ := nl print.

      _ := 'str2 meta (should be Meta info): ' print.
      _ := (str2 meta) print. 
      _ := nl print.
    ]
}
