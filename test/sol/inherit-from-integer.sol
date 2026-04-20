"Tento program by mal byť platný a mal by vyprodukovať výsledok 6."
"Dôvod: SOL26 umožňuje definovať triedu s rodičom Integer; dedenie mimo Object je v tomto zmysle povolené."
"Test overuje, že podtrieda Integer zdedí správanie a vie použiť metódu plus:."

class MyInt : Integer {
}

class Main : Object {
    run [ |
        x := MyInt from: 5.
        _ := ((x plus: 1) asString) print.
    ]
}
