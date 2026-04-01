class Main : Object {
    run [|
        nl := '\n'.

        "Block new creates empty zero-arg block"
        empty := Block new.
        _ := (((empty value) isNil) asString) print.
        _ := nl print.

        "value: on unary block"
        inc := [ :x | r := x plus: 1. ].
        _ := ((inc value: 41) asString) print.
        _ := nl print.

        "value:value: on binary block"
        add := [ :x :y | r := x plus: y. ].
        _ := ((add value: 2 value: 3) asString) print.
        _ := nl print.

        "isBlock"
        _ := ((empty isBlock) asString) print.
        _ := nl print.
        _ := ((([| t := 0. ]) isBlock) asString) print.
        _ := nl print.

        "whileTrue: prints countdown and returns last body value"
        counter := 3.
        cond := [| c := counter greaterThan: 0. ].
        body := [|
            _ := (counter asString) print.
            _ := ',' print.
            counter := counter minus: 1.
        ].

        last := cond whileTrue: body.
        _ := nl print.
        _ := (last asString) print.
        _ := nl print.
        _ := ((counter equalTo: 0) asString) print.
        _ := nl print.
    ]
}