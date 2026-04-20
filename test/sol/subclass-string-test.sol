class MyString : String {
  myMethod
    [ |
      "Custom metóda, ktorá využíva vnútorný stav a zdedenú metódu"
      _ := self concatenateWith: ' is custom'.
    ]
}

class Main : Object {
  run
    [ |
      nl := '\n'.
      "1. Vytvorenie inštancie podtriedy pomocou new"
      s1 := MyString new.
      _ := 'Length of new MyString: ' print.
      _ := ((s1 length) asString) print. 
      _ := nl print.

      "2. Vytvorenie inštancie pomocou from:"
      s2 := MyString from: 'hello'.
      
      "Vstavaný print, ktorý volá asString, prípadne asString napriamo:"
      _ := 'asString of MyString from: ' print.
      _ := (s2 asString) print. 
      _ := nl print.
      
      "Zdedená metóda length"
      _ := 'Length should be 5: ' print.
      _ := ((s2 length) asString) print. 
      _ := nl print.
      
      "Dedičnosť behaviorálnych predikátov"
      _ := 'isString should be true: ' print.
      _ := (((s2 isString) asString)) print. 
      _ := nl print.
      _ := 'isNumber should be false: ' print.
      _ := (((s2 isNumber) asString)) print. 
      _ := nl print.
      
      "Spustenie custom metódy na overenie použiteľnosti stavu"
      res := s2 myMethod.
      _ := 'MyString myMethod: ' print.
      _ := res print. 
      _ := nl print.
      
      "Volanie zdedenej metódy equalTo:"
      s3 := MyString from: 'hello'.
      s4 := String from: 'hello'.
      
      _ := 'MyString equalTo: MyString: ' print.
      _ := ((s2 equalTo: s3) asString) print. 
      _ := nl print.
      
      _ := 'MyString equalTo: String: ' print.
      _ := ((s2 equalTo: s4) asString) print. 
      _ := nl print.

      _ := 'MyString identicalTo: String: ' print.
      _ := ((s2 identicalTo: s4) asString) print. 
      _ := nl print.
    ]
}
