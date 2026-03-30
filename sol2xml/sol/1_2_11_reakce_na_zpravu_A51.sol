class A : Object {
  foo [|]
  bar: [ :x | ]
}

class Main : Object {
  run [|
    "Bezparametrické selektory"
    o := A new. "vytvoří instanci A"
    _ := o foo. "metoda se najde v třídě A"
    _ := o asString. "metoda se najde v třídě Object"
    _ := o bad. "metoda se nenajde v A ani v Object, neexistuje atribut 'bad' -> CHYBA 51"
  ]
}