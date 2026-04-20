"Tento program by mal skončiť statickou sémantickou chybou 35."
"Dôvod: triedy A a B tvoria cyklus dedičnosti, čo je neplatný vzťah dedičnosti."

class A : B {
}

class B : A {
}

class Main : Object {
    run [ |
        a := A new.
        _ := 1.
    ]
}
