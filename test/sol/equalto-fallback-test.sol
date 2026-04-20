class MyObject : Object {}

class Main : Object {
  run
    [ |
      nl := '\n'.
      
      _ := '--- equalTo: fallback to identicalTo: ---' print. _ := nl print.
      "Podľa špecifikácie: ak objekt nemá interné atribúty, equalTo: invokuje identicalTo:"
      
      o1 := MyObject new.
      o2 := MyObject new.
      
      _ := 'MyObject 1 equalTo: MyObject 2 (should be false, as they differ): ' print.
      _ := ((o1 equalTo: o2) asString) print. _ := nl print.
      
      _ := 'MyObject 1 equalTo: MyObject 1 (should be true, same identity): ' print.
      _ := ((o1 equalTo: o1) asString) print. _ := nl print.
      
      _ := 'True equalTo: True (should be true for singletons): ' print.
      _ := (((True new) equalTo: (True new)) asString) print. _ := nl print.

      "Podotýkam, singletons podtriedy s novým 'new' už nie sú tie isté inštancie!"
      "Mali by sa vyrovnať equalTo:? Ak sú singletons True a False (bez interného stavu),"
      "tak equalTo: zlyhá (vráti false)."
    ]
}