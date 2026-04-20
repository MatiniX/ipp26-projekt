class Main : Object {
  "Metóda na výpočet faktoriálu rekurzívne"
  factorial:
    [ :n |
      isZero := n equalTo: 0.
      
      "Využívame bloky pre podmienené vetvenie"
      res := isZero
        ifTrue: [ | 
          "Základný prípad rekurzie"
          _ := 1. 
        ]
        ifFalse: [ | 
          "Rekurzívny krok"
          nMinusOne := n minus: 1.
          prevFact := self factorial: nMinusOne.
          _ := n multiplyBy: prevFact.
        ].
    ]
    
  run
    [ |
      nl := '\n'.
      _ := '--- Test: Recursive method call (Factorial) ---' print. _ := nl print.
      
      _ := 'Calculating factorial of 5...' print. _ := nl print.
      r := self factorial: 5.
      
      _ := 'Result (should be 120): ' print.
      _ := (r asString) print. _ := nl print.
      
      _ := 'Calculating factorial of 0...' print. _ := nl print.
      r := self factorial: 0.
      
      _ := 'Result (should be 1): ' print.
      _ := (r asString) print. _ := nl print.
    ]
}