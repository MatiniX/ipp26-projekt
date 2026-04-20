class MyInteger : Integer {
  myMethod
    [ |
      "Custom metóda, ktorá využíva vnútorný stav a zdedenú metódu"
      _ := self plus: 100.
    ]
}

class Main : Object {
  run
    [ |
      nl := '\n'.
      "1. Vytvorenie inštancie podtriedy pomocou new"
      i1 := MyInteger new.
      _ := 'Value of new MyInteger (should be 0): ' print.
      _ := (i1 asString) print. 
      _ := nl print.

      "2. Vytvorenie inštancie pomocou from:"
      i2 := MyInteger from: 42.
      
      _ := 'asString of MyInteger from: ' print.
      _ := (i2 asString) print. 
      _ := nl print.
      
      "Zdedená metóda plus:"
      _ := '42 plus 8 should be 50: ' print.
      _ := ((i2 plus: 8) asString) print. 
      _ := nl print.
      
      "Dedičnosť behaviorálnych predikátov"
      _ := 'isNumber should be true: ' print.
      _ := (((i2 isNumber) asString)) print. 
      _ := nl print.
      _ := 'isString should be false: ' print.
      _ := (((i2 isString) asString)) print. 
      _ := nl print.
      
      "Spustenie custom metódy na overenie použiteľnosti stavu"
      res := i2 myMethod.
      _ := 'MyInteger myMethod (42 + 100): ' print.
      _ := (res asString) print. 
      _ := nl print.
      
      "3. Kopírovanie inštančných atribútov cez from: (ADVANCED test spec)"
      "Pridáme dynamický inštančný atribút do i2"
      _ := i2 myAttr: 'tajny stav'.
      
      "Vytvoríme kópiu pomocou from:"
      i3 := MyInteger from: i2.
      
      _ := 'Copied MyInteger myAttr (should be tajny stav): ' print.
      _ := (i3 myAttr) print.
      _ := nl print.
      
      "Volanie zdedenej metódy equalTo:"
      i4 := Integer from: 42.
      
      _ := 'MyInteger equalTo: MyInteger: ' print.
      _ := ((i2 equalTo: i3) asString) print. 
      _ := nl print.
      
      _ := 'MyInteger equalTo: Integer: ' print.
      _ := ((i2 equalTo: i4) asString) print. 
      _ := nl print.

      _ := 'MyInteger identicalTo: Integer: ' print.
      _ := ((i2 identicalTo: i4) asString) print. 
      _ := nl print.
    ]
}
