"Tento program by mal skončiť statickou sémantickou chybou."
"Dôvod: Literál bloku definuje dva parametre s rovnakým identifikátorom ':x'."

class Main : Object {
    run [ |
        "Vytvorenie bloku s dvoma rovnomenne pomenovanými parametrami"
        b := [ :x :x | 
            "Ak by tento blok prešiel, nebolo by jasné, na ktorú hodnotu 'x' ukazuje"
            _ := x print. 
        ].
        
        "Pokus o vykonanie bloku"
        _ := b value: 10 value: 20.
    ]
}