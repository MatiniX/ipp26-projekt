"Tento program by mal skončiť statickou sémantickou chybou 35."
"Dôvod: trieda 'Integer' je vestavěná, preto jej redefinovanie predstavuje kolíziu názvov tried."

class Integer : Object {
}

class Main : Object {
    run [ |
        _ := 1.
    ]
}
