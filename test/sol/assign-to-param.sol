"Tento program testuje kolíziu parametrov s premennými v rámci jedného bloku."
"Dôvod: Podľa zadania sa parametre chovajú ako nemodifikovateľné proměnné."
"Interpret by mal vrátiť sémantickú chybu (kód 34)."

class Main : Object {
    run [ |
        "Blok definuje parameter :a"
        b := [ :a | 
            "Tu dochádza ku kolízii/chybe zmeny: chcem priradiť do 'a', ale to je parameter, nie voľná premenná,"
            "do ktorej môžem implicitne vložiť hodnotu."
            a := 42.
        ].
        
        "Spustenie bloku"
        _ := b value: 10.
    ]
}