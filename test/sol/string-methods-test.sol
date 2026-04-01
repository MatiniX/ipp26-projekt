class Main : Object {
  run
    [ | 
      "Inicializacia zakladnych stringov"
      s1 := 'Hello'.
      s2 := ' World'.
      s3 := '42'.
      sBad := 'q4s2q'.
      sEmpty := ''.
      nl := '\n'.

      "1. Test metody print"
      _ := s1 print.
      _ := nl print.

      "2. Test metody concatenateWith:"
      _ := '--- concatenateWith: ---' print. _ := nl print.
      s4 := s1 concatenateWith: s2.
      _ := s4 print. 
      _ := nl print.

      "3. Test metody length"
      _ := '--- length ---' print. _ := nl print.
      len := s4 length.
      _ := (len asString) print. 
      _ := nl print.

      "4. Test metody startsWith:endsBefore:"
      _ := '--- startsWith:endsBefore: ---' print. _ := nl print.
      "Podretazec od indexu 1 po 5, cize 'Hell'"
      sub := s4 startsWith: 1 endsBefore: 5.
      _ := sub print. 
      _ := nl print.

      "4b. Hrany startsWith:endsBefore:"
      _ := '--- startsWith:endsBefore: edge ---' print. _ := nl print.
      "rozdiel 0 -> prazdny retazec"
      subEq := s4 startsWith: 3 endsBefore: 3.
      _ := '<' print. _ := subEq print. _ := '>' print. _ := nl print.
      "endsBefore vacsie ako dlzka -> po koniec"
      subLong := s1 startsWith: 3 endsBefore: 999.
      _ := subLong print. _ := nl print.
      "neplatny index (0) -> nil"
      subNil := s1 startsWith: 0 endsBefore: 2.
      _ := ((subNil isNil) asString) print. _ := nl print.

      "5. Test metody asInteger"
      _ := '--- asInteger ---' print. _ := nl print.
      num := s3 asInteger.
      "Pripocitame 1 k ziskanemu integeru pre overenie"
      res := num plus: 1.
      _ := (res asString) print. 
      _ := nl print.

      "5b. asInteger pre nevalidny retazec -> nil"
      numBad := sBad asInteger.
      _ := ((numBad isNil) asString) print.
      _ := nl print.

      "6. Test metody equalTo:"
      _ := '--- equalTo: ---' print. _ := nl print.
      isEq1 := s1 equalTo: 'Hello'.
      isEq2 := s1 equalTo: 'World'.
      _ := (isEq1 asString) print. _ := nl print. "Ocakavane: true"
      _ := (isEq2 asString) print. _ := nl print. "Ocakavane: false"

      "7. Test metody asString"
      _ := '--- asString ---' print. _ := nl print.
      strCopy := s1 asString.
      _ := strCopy print. 
      _ := nl print.
      _ := ((strCopy identicalTo: s1) asString) print.
      _ := nl print.

      "8. Test metody isString"
      _ := '--- isString ---' print. _ := nl print.
      isStr := s1 isString.
      _ := (isStr asString) print. 
      _ := nl print. "Ocakavane: true"

      "9. Hrany concatenateWith: a length"
      _ := '--- concatenateWith:/length edge ---' print. _ := nl print.
      badConcat := s1 concatenateWith: 1.
      _ := ((badConcat isNil) asString) print. _ := nl print.
      _ := ((sEmpty length) asString) print. _ := nl print.
    ]
}