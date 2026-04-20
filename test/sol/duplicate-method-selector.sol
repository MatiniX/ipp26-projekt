"Tento program by mal skončiť statickou sémantickou chybou."
"Dôvod: Třída 'Main' definuje dvakrát metódu so selektorom 'foo:'."

class Main : Object {
    
    run [ | 
        _ := self foo: 10.
    ]

    "Prvá definícia metódy foo:"
    foo: [ :x | 
        _ := (x asString) print. 
    ]

    "Druhá definícia metódy foo: - tu by mala nastať chyba kolízie mien."
    "V SOL26 sa prísne identifikujú metódy podľa ich selektoru a neexistuje preťažovanie."
    foo: [ :y | 
        _ := y print. 
    ]
}