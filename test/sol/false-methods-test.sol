class Main : Object {
    run [|
        nl := '\n'.

        f1 := False new.
        f2 := False from: false.

        "singleton behavior"
        _ := ((f1 identicalTo: f2) asString) print.
        _ := nl print.
        _ := ((f2 identicalTo: false) asString) print.
        _ := nl print.

        "basic False methods"
        _ := (f1 asString) print.
        _ := nl print.
        _ := ((f1 not) asString) print.
        _ := nl print.
        _ := ((f1 isBoolean) asString) print.
        _ := nl print.

        "and: on false short-circuits (does not evaluate argument)"
        side := 0.
        _ := (((f1 and: [| side := side plus: 1. r := true. ]) asString) print).
        _ := nl print.
        _ := (side asString) print.
        _ := nl print.

        "or: on false evaluates argument block"
        side2 := 0.
        _ := (((f1 or: [| side2 := side2 plus: 1. r := true. ]) asString) print).
        _ := nl print.
        _ := (side2 asString) print.
        _ := nl print.

        "ifTrue:ifFalse: executes second branch"
        _ := ((f1 ifTrue: [| r := 'T'. ] ifFalse: [| r := 'F'. ]) asString) print.
        _ := nl print.
    ]
}