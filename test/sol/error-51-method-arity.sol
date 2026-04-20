class MultiArg : Object {
  do:and:
    [ :x :y | _ := 'Two arguments' print. ]
}

class Main : Object {
  run
    [ |
      obj := MultiArg new.
      
      "Objekt pozná metódu do:and: (2 parametre)."
      "Zaslanie zprávy do: (1 parameter) spôsobí nasledujúce:"
      "1. Interpreter hľadá do: (nenájde)."
      "2. Skúsi vytvoriť inštančný atribút 'do:'. Podmienka je, že nesmie existovať bezparametrický selektor 'do'."
      "Kedže 'do' neexistuje, VZTVORÍ atribút 'do:'! Takto to spraví."
      _ := obj do: 'A single argument instead of two'.
      
      "ALE zaslanie zprávy s tromi parametrami do:and:but: "
      "1. Hľadá do:and:but: (nenájde)."
      "2. Je to viacparametrický selektor, ten NEVYTVÁRA atribúty."
      "3. Okamžitá chyba 51 (Does Not Understand)."
      _ := obj do: 1 and: 2 but: 3.
    ]
}