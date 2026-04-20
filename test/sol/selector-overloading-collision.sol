"Tento program by mal skončiť statickou sémantickou chybou 35."
"Dôvod: trieda 'Main' sa pokúša definovať dve metódy s rovnakým názvom 'foo' v rôznej arite."
"Podľa špecifikácie SOL26 nie je podporované preťažovanie metód."

class Main : Object {
    run [ |
        _ := self foo.
        _ := self foo: 1.
    ]

    foo [ |
        _ := 1.
    ]

    foo: [ :x |
        _ := x print.
    ]
}
