class Main : Object {
  run
    [ | 
      "Inicializacia zakladnych stringov"
      s1 := 'Hello'.
      s2 := ' World'.
      s3 := '42'.
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
      "Podretazec od indexu 1 po 5, cize 'Hello'"
      sub := s4 startsWith: 1 endsBefore: 5.
      _ := sub print. 
      _ := nl print.

      "5. Test metody asInteger"
      _ := '--- asInteger ---' print. _ := nl print.
      num := s3 asInteger.
      "Pripocitame 1 k ziskanemu integeru pre overenie"
      res := num plus: 1.
      _ := (res asString) print. 
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

      "8. Test metody isString"
      _ := '--- isString ---' print. _ := nl print.
      isStr := s1 isString.
      _ := (isStr asString) print. 
      _ := nl print. "Ocakavane: true"
    ]
}