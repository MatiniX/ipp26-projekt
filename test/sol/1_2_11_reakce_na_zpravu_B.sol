class B : A {
  sus  [ | _ := 'hello'. ]
  bar: [ :y | ]
  fun [|
    _ := self bar: 1. "najde se v B"
    _ := self wee: 3. "najde se v A"
    _ := self gro: 5. "metoda se nenajde v B ani v A, vytvoří se atribut 'gro'"
    _ := self foo. "volání zděděné metody A.foo v kontextu instance B (případ b)"
    a := self sus. "najde se metoda v B (má přednost před atributem vytvořeným z 'foo')"
    b := super marker. "metoda se hledá až v A, kde není, ale na instanci existuje atribut 'marker' -> do 'b' se přiřadí 1234"
  ]
}

class A : Object {
  foo  [ | 
    "V následujících řádcích může 'self' ukazovat (a) na instanci, kde je vlastní třídou A (např. `(A new) foo.`),
        nebo (b) na instanci, kde je vlastní třídou B (tj. k volání 'foo' došlo díky dědičnosti), což se děje v tomto příkladu
        z funkce 'fun' ve třídě B."

    _ := self marker: 1234.
    "Případ (a): na třídě A se hledá metoda 'marker:', nenajde se -> pokus vytvořit atribut -> uspěje."
    "Případ (b): na třídě *B* se hledá metoda 'marker:', nenajde se -> na třídě A se hledá metoda 'marker:', nenajde se -> pokus vytvořit atribut
      -> uspěje"
    
    a := self gro. 
    "Případ (a): na třídě A se hledá metoda 'gro', nenajde se -> na instanci se hledá atribut -> neuspěje (pokud takový atribut někdo
        dané instanci dřív nenastavil) -> CHYBA 51."
    "Případ (b): na třídě *B* se hledá metoda 'gro', nenajde se -> na třídě A se hledá metoda 'gro', nenajde se -> na instanci se hledá atribut 'gro'
        -> v tomto konkrétním případě (kdy se 'foo' volá z 'fun') už je na instanci atribut nastaven (řádek 5) -> do 'a' se přiřadí 5"
    
    b := self marker.
    "Případ (a): na třídě A se hledá metoda 'marker', nenajde se -> na instaci se hledá atribut 'marker' -> ten vznikl výše, tudíž je přečten 
        -> do 'b' se přiřadí 1234."
    "Případ (b): na třídě B se hledá metoda 'sus', najde se! -> do 'b' se přiřadí řetězec 'hello' (výsledek volání 'sus', které je definované v B)."
  ]
  bar: [ :x | ]
  wee: [ :z | ]
}

class Main : Object {
  run [ |
    b := B new.
    _ := b fun. "průchod bez chyby, ověřuje chování popsané jako případ (b)"

    a := A new.
    _ := a foo. "zde má nastat CHYBA 51 (případ a, čtení neexistujícího atributu 'gro')"
  ]
}
