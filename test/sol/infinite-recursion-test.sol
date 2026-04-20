class Main : Object {
  loop
    [ |
      "Voláme túto istú metódu znovu a znovu bez podmienky na ukončenie."
      _ := self loop.
    ]
    
  run
    [ |
      nl := '\n'.
      _ := '--- Test: Infinite Recursion ---' print. _ := nl print.
      _ := 'This should drop the interpreter due to maximum call stack size exceeded.' print. _ := nl print.
      
      _ := self loop.
    ]
}