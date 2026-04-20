"Tento program by mal skončiť statickou sémantickou chybou 35."
"Dôvod: trieda 'A' je definovaná dvakrát, čo spôsobuje kolíziu názvov tried a neplatný vzťah dedičnosti v programe."

class A : Object {
}

class A : Object {
}

class Main : Object {
    run [ |
        _ := 1.
    ]
}
