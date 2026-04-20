"Tento program by mal skončiť statickou sémantickou chybou 32."
"Dôvod: trieda 'Child' dedí z neexistujúcej triedy 'MissingParent'."
"Podľa špecifikácie je použitie nedefinovanej triedy chyba 32."

class Child : MissingParent {
}

class Main : Object {
    run [ |
        _ := 1.
    ]
}
