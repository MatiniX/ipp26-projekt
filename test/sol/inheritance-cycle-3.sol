"Tento program by mal skončiť statickou sémantickou chybou 35."
"Dôvod: triedy A, B a C tvoria cyklus dedičnosti A -> B -> C -> A."

class A : B {
}

class B : C {
}

class C : A {
}

class Main : Object {
    run [ |
        a := C new.
        _ := 1.
    ]
}
