class Main : Object {
    run [|
        a := 10.
        b := 3.
        c := 0.
        nl := '\n'.

        "Test equalTo: (10 == 10, 10 == 3)"
        _ := ((a equalTo: 10) asString) print.
        _ := nl print.
        _ := ((a equalTo: b) asString) print.
        _ := nl print.

        "Test greaterThan: (10 > 3, 3 > 10)"
        _ := ((a greaterThan: b) asString) print.
        _ := nl print.
        _ := ((b greaterThan: a) asString) print.
        _ := nl print.

        "Test plus: (10 + 3)"
        _ := ((a plus: b) asString) print.
        _ := nl print.

        "Test minus: (10 - 3)"
        _ := ((a minus: b) asString) print.
        _ := nl print.

        "Test multiplyBy: (10 * 3)"
        _ := ((a multiplyBy: b) asString) print.
        _ := nl print.

        "Test asString (10)"
        _ := (a asString) print.
        _ := nl print.

        "Test asInteger (10)"
        _ := (((a asInteger) equalTo: a) asString) print.
        _ := nl print.

        "Test timesRepeat: (3 times)"
        _ := ((b timesRepeat: [ :i | _ := (i asString) print. ]) asString) print.
        _ := nl print.

        "Test divBy: (10 / 3, 10 / 0)"
        _ := ((a divBy: b) asString) print.
        _ := nl print.
        "Nasledujúci riadok by mal spôsobiť chybu (delenie nulou):"
        _ := ((a divBy: c) asString) print.
    ]
}
