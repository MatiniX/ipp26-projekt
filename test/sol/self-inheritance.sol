"Tento program by mal skončiť statickou sémantickou chybou 35."
"Dôvod: trieda 'A' dedí sama zo seba, čo vytvára neplatný vzťah dedičnosti."

class A : A {
}

class Main : Object {
    run [ |
        _ := 1.
    ]
}
